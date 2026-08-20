import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getUncachableStripeClient } from "./stripeClient";

export const STRIPE_PRODUCT_ID = "prod_V6XkGJSvSNyOl5";

type Interval = "month" | "year";

export type BillingPlan = {
  id: string;
  interval: Interval;
  amount: number;
  currency: string;
  nickname: string | null;
};

export type BillingStatus = {
  provider: "stripe";
  status: string;
  isPremium: boolean;
  cancelAtPeriodEnd: boolean;
  accessEndsAt: string | null;
  hasCustomer: boolean;
};

type SyncedPrice = {
  id: string;
  unit_amount: number | null;
  currency: string | null;
  nickname: string | null;
  recurring: { interval?: string } | null;
};

type SyncedSubscription = {
  id: string;
  status: string;
  cancel_at_period_end: boolean | null;
  current_period_end: number | null;
};

function isPremiumStripeStatus(status: string): boolean {
  return status === "active" || status === "trialing";
}

function dateFromUnixSeconds(value: number | null): Date | null {
  return value ? new Date(value * 1000) : null;
}

function billingBaseUrl(): string {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (!domain) {
    throw new Error("The application domain is not available for Stripe Checkout.");
  }
  return `https://${domain}`;
}

function hasRevenueCatPremium(metadata: Record<string, unknown>): boolean {
  return metadata.revenuecat_subscription_status === "active";
}

export async function listWebPlans(): Promise<BillingPlan[]> {
  const result = await db.execute(sql<SyncedPrice>`
    SELECT id, unit_amount, currency, nickname, recurring
    FROM stripe.prices
    WHERE product = ${STRIPE_PRODUCT_ID}
      AND active = TRUE
      AND type = 'recurring'
  `);

  const plans = (result.rows as SyncedPrice[])
    .map((price) => {
      const interval = price.recurring?.interval;
      if (interval !== "month" && interval !== "year") return null;
      if (price.unit_amount === null || !price.currency) return null;
      return {
        id: price.id,
        interval,
        amount: price.unit_amount,
        currency: price.currency,
        nickname: price.nickname,
      };
    })
    .filter((plan): plan is BillingPlan => plan !== null);

  const preferredNicknames: Record<Interval, string> = {
    month: "monthly_subscription",
    year: "annual_subscription",
  };

  return (["month", "year"] as const).flatMap((interval) => {
    const intervalPlans = plans.filter((plan) => plan.interval === interval);
    const preferredPlan = intervalPlans.find(
      (plan) => plan.nickname === preferredNicknames[interval],
    );
    if (!preferredPlan) {
      throw new Error(`The ${interval} Stripe subscription price is not configured.`);
    }
    return [preferredPlan];
  });
}

export async function getStripeBillingStatus(user: typeof usersTable.$inferSelect): Promise<BillingStatus> {
  if (!user.stripeCustomerId) {
    return {
      provider: "stripe",
      status: "none",
      isPremium: false,
      cancelAtPeriodEnd: false,
      accessEndsAt: null,
      hasCustomer: false,
    };
  }

  const result = await db.execute(sql<SyncedSubscription>`
    SELECT id, status, cancel_at_period_end, current_period_end
    FROM stripe.subscriptions
    WHERE customer = ${user.stripeCustomerId}
    ORDER BY current_period_end DESC NULLS LAST
    LIMIT 1
  `);
  const subscription = (result.rows[0] as SyncedSubscription | undefined) ?? null;
  const status = subscription?.status ?? "none";
  const isPremium = isPremiumStripeStatus(status);
  const accessEndsAt = dateFromUnixSeconds(subscription?.current_period_end ?? null);
  await reconcileUserEntitlements(user.id);

  return {
    provider: "stripe",
    status,
    isPremium,
    cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end),
    accessEndsAt: accessEndsAt?.toISOString() ?? null,
    hasCustomer: true,
  };
}

export async function createCheckoutSessionForUser(
  user: typeof usersTable.$inferSelect,
  priceId: string,
): Promise<{ url: string }> {
  const plans = await listWebPlans();
  const plan = plans.find((candidate) => candidate.id === priceId);
  if (!plan) {
    throw new Error("That subscription plan is no longer available.");
  }

  const stripe = await getUncachableStripeClient();
  let customerId = user.stripeCustomerId;
  if (customerId) {
    const activeSubscription = await db.execute(sql<{ status: string }>`
      SELECT status
      FROM stripe.subscriptions
      WHERE customer = ${customerId}
        AND status IN ('active', 'trialing', 'past_due', 'unpaid')
      ORDER BY current_period_end DESC NULLS LAST
      LIMIT 1
    `);
    if (activeSubscription.rows.length > 0) {
      throw new Error("You already have a web subscription to manage.");
    }
  }

  let reservation = await db.execute<{
    stripe_checkout_created_at: Date;
    stripe_checkout_idempotency_key: string;
  }>(sql`
    UPDATE users
    SET stripe_checkout_price_id = ${priceId},
        stripe_checkout_created_at = NOW(),
        stripe_checkout_idempotency_key = ${randomUUID()},
        stripe_checkout_session_id = NULL
    WHERE id = ${user.id}
      AND (
        stripe_checkout_created_at IS NULL
        AND stripe_checkout_session_id IS NULL
      )
    RETURNING stripe_checkout_created_at, stripe_checkout_idempotency_key
  `);
  let reservationKey = reservation.rows[0]?.stripe_checkout_idempotency_key;
  if (!reservationKey) {
    const [latestUser] = await db
      .select({
        checkoutSessionId: usersTable.stripeCheckoutSessionId,
        checkoutPriceId: usersTable.stripeCheckoutPriceId,
        checkoutIdempotencyKey: usersTable.stripeCheckoutIdempotencyKey,
      })
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .limit(1);
    if (latestUser?.checkoutSessionId) {
      const existingSession = await stripe.checkout.sessions.retrieve(latestUser.checkoutSessionId);
      if (existingSession.status === "open" && existingSession.url) {
        return { url: existingSession.url };
      }
      throw new Error(
        "Your previous checkout is being finalized. Please refresh your subscription status before starting another checkout.",
      );
    }
    if (latestUser?.checkoutPriceId !== priceId || !latestUser.checkoutIdempotencyKey) {
      throw new Error("You already have a web checkout in progress.");
    }
    reservationKey = latestUser.checkoutIdempotencyKey;
  }

  if (!customerId) {
    const customer = await stripe.customers.create(
      {
        email: user.email,
        metadata: { appUserId: String(user.id) },
      },
      { idempotencyKey: `perk-up-customer:${user.id}` },
    );
    customerId = customer.id;
    await db
      .update(usersTable)
      .set({ stripeCustomerId: customerId })
      .where(eq(usersTable.id, user.id));
  }

  const baseUrl = billingBaseUrl();
  const session = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        client_reference_id: String(user.id),
        mode: "subscription",
        line_items: [{ price: plan.id, quantity: 1 }],
        subscription_data: { metadata: { appUserId: String(user.id) } },
        success_url: `${baseUrl}/paywall?checkout=success`,
        cancel_url: `${baseUrl}/paywall?checkout=cancelled`,
      },
    { idempotencyKey: `perk-up-checkout:${user.id}:${reservationKey}` },
  );

  if (!session.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }
  await db
    .update(usersTable)
    .set({ stripeCheckoutSessionId: session.id })
    .where(eq(usersTable.id, user.id));
  return { url: session.url };
}

export async function reconcileUserEntitlements(userId: number): Promise<void> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return;

  const stripeResult = user.stripeCustomerId
    ? await db.execute<SyncedSubscription>(sql`
        SELECT id, status, cancel_at_period_end, current_period_end
        FROM stripe.subscriptions
        WHERE customer = ${user.stripeCustomerId}
        ORDER BY current_period_end DESC NULLS LAST
        LIMIT 1
      `)
    : { rows: [] as SyncedSubscription[] };
  const subscription = stripeResult.rows[0] ?? null;
  const metadata = (user.metadata as Record<string, unknown> | null) ?? {};
  const stripePremium = Boolean(subscription && isPremiumStripeStatus(subscription.status));
  const revenueCatPremium = hasRevenueCatPremium(metadata);
  const stripeAccessEndsAt = stripePremium
    ? dateFromUnixSeconds(subscription?.current_period_end ?? null)
    : null;
  const revenueCatAccessEndsAt = revenueCatPremium && metadata.renewal_date
    ? new Date(String(metadata.renewal_date))
    : null;
  const validAccessEndsAt = [stripeAccessEndsAt, revenueCatAccessEndsAt]
    .filter((date): date is Date => Boolean(date && !Number.isNaN(date.getTime())))
    .sort((a, b) => b.getTime() - a.getTime());
  const premiumUntil = validAccessEndsAt[0] ?? null;
  const hasPremium = stripePremium || revenueCatPremium;

  await db
    .update(usersTable)
    .set({
      isPremium: hasPremium,
      premiumUntil,
      stripeSubscriptionId: subscription?.id ?? null,
      metadata: {
        ...metadata,
        subscription_status: hasPremium ? "active" : "cancelled",
        stripe_subscription_status: subscription?.status ?? "none",
        stripe_renewal_date: stripeAccessEndsAt?.toISOString() ?? null,
        stripe_updated_at: new Date().toISOString(),
      },
    })
    .where(eq(usersTable.id, userId));
}

export async function createBillingPortalForUser(
  user: typeof usersTable.$inferSelect,
): Promise<{ url: string }> {
  if (!user.stripeCustomerId) {
    throw new Error("You do not have a web subscription to manage yet.");
  }

  const stripe = await getUncachableStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${billingBaseUrl()}/settings`,
  });
  return { url: session.url };
}