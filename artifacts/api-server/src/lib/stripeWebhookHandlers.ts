import { getStripeSync } from "./stripeClient";

export class StripeWebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error("Stripe webhook payload must remain a raw Buffer.");
    }

    const stripeSync = await getStripeSync();
    await stripeSync.processWebhook(payload, signature);
  }
}