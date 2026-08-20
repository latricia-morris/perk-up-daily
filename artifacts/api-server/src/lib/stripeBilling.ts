import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getUncachableStripeClient } from "./stripeClient";

export const STRIPE_PRODUCT_ID = "prod_UjddqqRebRnb13";

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

  return plans.sort((a, b) => (a.interval === "month" ? -1 : 1) - (b.interval === "month" ? -1 : 1));
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
  const currentMetadata = (user.metadata as Record<string, unknown> | null) ?? {};
  const metadata = {
    ...currentMetadata,
    stripe_subscription_status: status,
    stripe_renewal_date: accessEndsAt?.toISOString() ?? null,
    stripe_updated_at: new Date().toISOString(),
  };

  if (
    user.isPremium !== (isPremium || hasRevenueCatPremium(metadata)) ||
    user.stripeSubscriptionId !== subscription?.id ||
    user.premiumUntil?.getTime() !== accessEndsAt?.getTime()
  ) {
    await db
      .update(usersTable)
      .set({
        isPremium: isPremium || hasRevenueCatPremium(metadata),
        premiumUntil: accessEndsAt,
        stripeSubscriptionId: subscription?.id ?? null,
        metadata,
      })
      .where(eq(usersTable.id, user.id));
  }

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
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { appUserId: String(user.id) },
    });
    customerId = customer.id;
    await db
      .update(usersTable)
      .set({ stripeCustomerId: customerId })
      .where(eq(usersTable.id, user.id));
  }

  const baseUrl = billingBaseUrl();
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: String(user.id),
    mode: "subscription",
    line_items: [{ price: plan.id, quantity: 1 }],
    subscription_data: { metadata: { appUserId: String(user.id) } },
    success_url: `${baseUrl}/paywall?checkout=success`,
    cancel_url: `${baseUrl}/paywall?checkout=cancelled`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }
  return { url: session.url };
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