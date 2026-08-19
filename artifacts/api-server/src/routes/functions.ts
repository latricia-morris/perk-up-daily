/**
 * /api/functions/:name — stub cloud-function router.
 * Implements the Base44 functions.invoke() surface with real handlers
 * where possible, and graceful stubs for payment/SMS integrations.
 */
import { Router } from "express";
import { db, userEntriesTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { logger } from "../lib/logger";

const router: Router = Router();

// All cloud functions require an authenticated session.
router.post("/functions/:name", requireAuth, async (req, res): Promise<void> => {
  const { name } = req.params;
  const payload = req.body || {};
  // @ts-ignore — set by requireAuth
  const requestUser = req.user;
  const userId: number = requestUser.id;

  try {
    switch (name) {
      case "exportEntries": {
        const entries = await db
          .select()
          .from(userEntriesTable)
          .where(eq(userEntriesTable.userId, userId))
          .orderBy(desc(userEntriesTable.createdAt));
        res.json({ data: entries });
        return;
      }

      case "requestAccountDeletion": {
        // Do not claim a deletion request exists until email delivery and a
        // token-validated destructive workflow are configured.
        res.status(501).json({
          error: "Account deletion is not available yet. Please contact support.",
        });
        return;
      }

      case "confirmAccountDeletion": {
        res.status(501).json({
          error: "Account deletion is not available yet. Please contact support.",
        });
        return;
      }

      case "adminDashboard": {
        if (!requestUser.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
        // Return basic stats
        const [{ count: userCount }] = await db.execute<{ count: string }>(
          `SELECT COUNT(*)::text as count FROM users`
        ) as any;
        const [{ count: entryCount }] = await db.execute<{ count: string }>(
          `SELECT COUNT(*)::text as count FROM user_entries`
        ) as any;
        res.json({
          data: {
            user_count: parseInt(userCount || "0"),
            entry_count: parseInt(entryCount || "0"),
            date_range: { start: payload.start_date, end: payload.end_date },
          }
        });
        return;
      }

      case "createCheckoutSession": {
        // Subscription checkout — payment not configured on this deployment
        res.status(503).json({
          error: "Payment provider not yet configured. RevenueCat handles mobile in-app purchases.",
        });
        return;
      }

      case "send_sms": {
        logger.info({ payload }, "SMS stub: send_sms called");
        res.json({ success: true, sent: 0, failed: 0, message: "SMS not configured on this deployment" });
        return;
      }

      case "submitSupportRequest": {
        logger.info({ payload }, "Support request received");
        res.json({ success: true });
        return;
      }

      default:
        logger.warn({ name }, "Unknown function invoked");
        res.status(404).json({ error: `Function '${name}' not found` });
        return;
    }
  } catch (err) {
    logger.error({ err, name }, "Function invocation error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
