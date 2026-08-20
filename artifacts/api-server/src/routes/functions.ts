/**
 * /api/functions/:name — stub cloud-function router.
 * Implements the Base44 functions.invoke() surface with real handlers
 * where possible, and graceful stubs for payment/SMS integrations.
 */
import { Router } from "express";
import { appLibraryTable, db, userEntriesTable, usersTable } from "@workspace/db";
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

        const requestedStart = new Date(payload.start_date);
        const requestedEnd = new Date(payload.end_date);
        const endDate = Number.isNaN(requestedEnd.getTime()) ? new Date() : requestedEnd;
        const startDate = Number.isNaN(requestedStart.getTime())
          ? new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
          : requestedStart;
        const [allUsers, allEntries, allLibraryItems] = await Promise.all([
          db.select().from(usersTable),
          db.select().from(userEntriesTable),
          db.select().from(appLibraryTable),
        ]);
        const inRange = (date: Date) => date >= startDate && date <= endDate;
        const metadataFor = (value: unknown): Record<string, unknown> =>
          value && typeof value === "object" ? value as Record<string, unknown> : {};
        const increment = (counts: Record<string, number>, key: string) => {
          counts[key] = (counts[key] ?? 0) + 1;
        };
        const toTimeline = (dates: Date[]) => {
          const counts: Record<string, number> = {};
          dates.forEach((date) => increment(counts, date.toISOString().slice(0, 10)));
          return Object.entries(counts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));
        };
        const userStatus = (user: typeof allUsers[number]) => {
          const metadata = metadataFor(user.metadata);
          return String(metadata.subscription_status ?? (user.isPremium ? "active" : "free"));
        };
        const statusCounts: Record<string, number> = {};
        allUsers.forEach((user) => increment(statusCounts, userStatus(user)));
        const completedOnboarding = allUsers.filter((user) => user.onboardingCompleted).length;
        const rangeEntries = allEntries.filter((entry) => inRange(entry.createdAt));
        const entryTypeCounts: Record<string, number> = {};
        const categoryCounts: Record<string, number> = {};
        allEntries.forEach((entry) => {
          increment(entryTypeCounts, entry.entryType);
          increment(categoryCounts, String(metadataFor(entry.metadata).category ?? "uncategorized"));
        });
        const libraryTypeCounts: Record<string, number> = {};
        allLibraryItems.forEach((item) => increment(libraryTypeCounts, item.contentType));
        const activeUserIds = new Set(rangeEntries.map((entry) => entry.userId));
        const activeSince = (milliseconds: number) =>
          new Set(allEntries.filter((entry) => entry.createdAt >= new Date(Date.now() - milliseconds)).map((entry) => entry.userId)).size;

        res.json({
          data: {
            users: {
              total: allUsers.length,
              new_signups: allUsers.filter((user) => inRange(user.createdAt)).length,
              by_status: statusCounts,
              onboarding_completion_rate: allUsers.length
                ? Math.round((completedOnboarding / allUsers.length) * 100)
                : 0,
              onboarding_completed: completedOnboarding,
              onboarding_not_completed: allUsers.length - completedOnboarding,
              signup_timeline: toTimeline(allUsers.filter((user) => inRange(user.createdAt)).map((user) => user.createdAt)),
            },
            engagement: {
              error: "Session, delivery, and retention analytics are not collected in this app yet.",
              active_users: activeUserIds.size,
              entries_created: rangeEntries.length,
              dau: activeSince(24 * 60 * 60 * 1000),
              wau: activeSince(7 * 24 * 60 * 60 * 1000),
              mau: activeSince(30 * 24 * 60 * 60 * 1000),
            },
            features: {
              total_entries: allEntries.length,
              total_library: allLibraryItems.length,
              entry_type_breakdown: Object.entries(entryTypeCounts).map(([type, count]) => ({ type, count })),
              category_breakdown: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })),
              library_distribution: Object.entries(libraryTypeCounts).map(([type, count]) => ({ type, count })),
            },
            sales: {
              error: "Subscription analytics are not available until native purchase data is connected.",
            },
            alerts: [
              {
                type: "info",
                message: "Engagement and revenue analytics will appear when their data sources are connected.",
              },
            ],
            user_list: allUsers.map((user) => {
              const metadata = metadataFor(user.metadata);
              return {
                id: String(user.id),
                email: user.email,
                full_name: user.fullName,
                role: user.isAdmin ? "admin" : "user",
                subscription_status: userStatus(user),
                created_date: user.createdAt.toISOString(),
                onboarding_completed: user.onboardingCompleted,
                phone_number: user.phone,
                sms_consent: Boolean(metadata.sms_consent),
                renewal_date: metadata.renewal_date ?? null,
                trial_end_date: metadata.trial_end_date ?? null,
                access_expires_at: metadata.access_expires_at ?? null,
                stripe_customer_id: metadata.stripe_customer_id ?? null,
              };
            }),
            date_range: { start: startDate.toISOString(), end: endDate.toISOString() },
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
        res.status(501).json({
          error: "In-app support requests are not available. Please email support directly.",
        });
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
