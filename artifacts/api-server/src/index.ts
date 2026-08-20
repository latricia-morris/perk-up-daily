import app from "./app";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./lib/logger";
import { runMigrations } from "stripe-replit-sync";
import { STRIPE_PRODUCT_ID } from "./lib/stripeBilling";
import { getStripeSync, getUncachableStripeClient } from "./lib/stripeClient";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function initializeStripe(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Stripe initialization.");
  }

  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text`);
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text`);
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_checkout_session_id" text`);
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_checkout_price_id" text`);
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_checkout_idempotency_key" text`);
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_checkout_created_at" timestamp with time zone`);
  await runMigrations({ databaseUrl });
  const stripeSync = await getStripeSync();
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domain) {
    await stripeSync.findOrCreateManagedWebhook(`https://${domain}/api/stripe/webhook`);
  } else {
    logger.warn("Stripe webhook setup skipped because REPLIT_DOMAINS is unavailable");
  }

  await stripeSync.syncSingleEntity(STRIPE_PRODUCT_ID);
  const stripe = await getUncachableStripeClient();
  const prices = await stripe.prices.list({
    product: STRIPE_PRODUCT_ID,
    active: true,
    type: "recurring",
    limit: 100,
  });
  await Promise.all(prices.data.map((price) => stripeSync.syncSingleEntity(price.id)));
}

async function start(): Promise<void> {
  try {
    await initializeStripe();
    logger.info("Stripe synchronization initialized");
  } catch (error) {
    // The rest of the app can run while an owner repairs an incomplete Stripe
    // connection. Billing routes return an explicit unavailable response.
    logger.error({ err: error }, "Stripe billing is unavailable");
  }
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

start().catch((error) => {
  logger.error({ err: error }, "API server failed to initialize");
  process.exit(1);
});
