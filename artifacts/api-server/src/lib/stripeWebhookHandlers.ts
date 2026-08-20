import { db, usersTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { reconcileUserEntitlements } from "./stripeBilling";
import { getStripeSync } from "./stripeClient";

export class StripeWebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error("Stripe webhook payload must remain a raw Buffer.");
    }

    const stripeSync = await getStripeSync();
    await stripeSync.processWebhook(payload, signature);

    const event = JSON.parse(payload.toString("utf8")) as {
      type?: string;
      data?: { object?: Record<string, unknown> };
    };
    const object = event.data?.object ?? {};
    const clientReferenceId = typeof object.client_reference_id === "string"
      ? Number(object.client_reference_id)
      : NaN;
    const customerId = typeof object.customer === "string"
      ? object.customer
      : typeof object.customer?.toString === "function"
        ? object.customer.toString()
        : null;
    const checkoutSessionId = typeof object.id === "string" ? object.id : null;
    let userId = Number.isInteger(clientReferenceId) ? clientReferenceId : null;
    if (!userId && customerId) {
      const [user] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.stripeCustomerId, customerId))
        .limit(1);
      userId = user?.id ?? null;
    }
    if (userId) {
      const isCompletedCheckout = event.type === "checkout.session.completed";
      const isReleasedCheckout =
        event.type === "checkout.session.expired" ||
        event.type === "checkout.session.async_payment_failed";
      const isCancelledSubscription = event.type === "customer.subscription.deleted";
      if (checkoutSessionId && isReleasedCheckout) {
        const checkoutReservation = {
          stripeCheckoutSessionId: null,
          stripeCheckoutPriceId: null,
          stripeCheckoutIdempotencyKey: null,
          stripeCheckoutCreatedAt: null,
        };
        await db
          .update(usersTable)
          .set(checkoutReservation)
          .where(
            and(eq(usersTable.id, userId), eq(usersTable.stripeCheckoutSessionId, checkoutSessionId)),
          );
      } else if (customerId && isCompletedCheckout) {
        await db
          .update(usersTable)
          .set({ stripeCustomerId: customerId })
          .where(eq(usersTable.id, userId));
      } else if (isCancelledSubscription) {
        await db
          .update(usersTable)
          .set({
            stripeCheckoutSessionId: null,
            stripeCheckoutPriceId: null,
            stripeCheckoutIdempotencyKey: null,
            stripeCheckoutCreatedAt: null,
          })
          .where(eq(usersTable.id, userId));
      }
      await reconcileUserEntitlements(userId);
    }
  }
}