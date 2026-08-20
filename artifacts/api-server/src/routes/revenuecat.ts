import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: Router = Router();

/**
 * POST /api/webhooks/revenuecat
 *
 * RevenueCat webhooks are authenticated with the shared Authorization value
 * configured in RevenueCat. Native clients must set their RevenueCat app user
 * id to this app's numeric user id. The handler intentionally ignores unknown
 * identities rather than creating accounts from third-party payloads.
 */
router.post("/webhooks/revenuecat", async (req, res): Promise<void> => {
  const webhookAuthorization = process.env.REVENUECAT_WEBHOOK_AUTHORIZATION;
  if (!webhookAuthorization) {
    logger.error("RevenueCat webhook rejected: authorization is not configured");
    res.status(503).json({ error: "RevenueCat webhook is not configured" });
    return;
  }

  if (req.headers.authorization !== webhookAuthorization) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const event = req.body?.event;
  const appUserId = String(event?.app_user_id ?? "");
  if (!/^\d+$/.test(appUserId)) {
    // A RevenueCat event for an unsupported identity is not retryable.
    res.status(202).json({ ignored: true });
    return;
  }

  const userId = Number(appUserId);
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!existing) {
    res.status(202).json({ ignored: true });
    return;
  }

  const entitlementIds = Array.isArray(event?.entitlement_ids)
    ? event.entitlement_ids.map(String)
    : [];
  const expiresAtMs = Number(event?.expiration_at_ms ?? 0);
  const hasUnexpiredPremium =
    entitlementIds.includes("premium") &&
    (!expiresAtMs || expiresAtMs > Date.now());

  const existingMetadata = (existing.metadata as Record<string, unknown> | null) ?? {};
  const stripeIsPremium =
    existingMetadata.stripe_subscription_status === "active" ||
    existingMetadata.stripe_subscription_status === "trialing";
  const metadata = {
    ...existingMetadata,
    subscription_status: hasUnexpiredPremium || stripeIsPremium ? "active" : "cancelled",
    revenuecat_subscription_status: hasUnexpiredPremium ? "active" : "cancelled",
    revenuecat_product_id: event?.product_id ?? null,
    revenuecat_store: event?.store ?? null,
    revenuecat_event_type: event?.type ?? null,
    renewal_date: expiresAtMs ? new Date(expiresAtMs).toISOString() : null,
    revenuecat_updated_at: new Date().toISOString(),
  };

  await db
    .update(usersTable)
    .set({ isPremium: hasUnexpiredPremium || stripeIsPremium, metadata })
    .where(eq(usersTable.id, userId));

  res.status(200).json({ received: true });
});

export default router;