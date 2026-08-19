import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const DELETION_THRESHOLD_DAYS = 14; // 7 days warning + 7 days buffer

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // Find all cancelled users
    const cancelledUsers = await base44.asServiceRole.entities.User.filter({ subscription_status: 'cancelled' });

    if (!cancelledUsers || cancelledUsers.length === 0) {
      console.log('No cancelled users found');
      return Response.json({ processed: 0 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let deletedCount = 0;

    for (const user of cancelledUsers) {
      if (!user.cancelled_date) continue;

      const cancelledDate = new Date(user.cancelled_date);
      cancelledDate.setHours(0, 0, 0, 0);

      const daysSinceCancellation = Math.floor((today - cancelledDate) / (1000 * 60 * 60 * 24));

      // Only delete after the threshold (7-day warning + buffer)
      if (daysSinceCancellation >= DELETION_THRESHOLD_DAYS) {
        try {
          // Delete all user entries
          const userEntries = await base44.asServiceRole.entities.UserEntry.filter({ created_by_id: user.id });
          for (const entry of userEntries) {
            await base44.asServiceRole.entities.UserEntry.delete(entry.id);
          }
          console.log(`Deleted ${userEntries.length} entries for user ${user.id}`);

          // Delete delivery logs
          const deliveryLogs = await base44.asServiceRole.entities.DeliveryLog.filter({ user_id: user.id });
          for (const log of deliveryLogs) {
            await base44.asServiceRole.entities.DeliveryLog.delete(log.id);
          }

          // Delete sent uplifts
          const sentUplifts = await base44.asServiceRole.entities.SentUplifts.filter({ sender_id: user.id });
          for (const uplift of sentUplifts) {
            await base44.asServiceRole.entities.SentUplifts.delete(uplift.id);
          }

          // Finally, delete the user account
          await base44.asServiceRole.entities.User.delete(user.id);
          deletedCount++;
          console.log(`Permanently deleted user ${user.id} (${user.email})`);
        } catch (delErr) {
          console.error(`Failed to delete user ${user.id}:`, delErr.message);
        }
      }
    }

    console.log(`Cleanup complete. ${deletedCount} users permanently deleted.`);
    return Response.json({ processed: deletedCount });
  } catch (error) {
    console.error('Cleanup error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}