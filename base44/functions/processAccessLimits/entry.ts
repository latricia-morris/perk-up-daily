import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const DAY_MS = 86400000;
const ACCESS_DURATION_DAYS = 30;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all users once — build email lookup and check expiry in one pass
    const allUsers = await base44.asServiceRole.entities.User.list();
    const usersByEmail = {};
    for (const u of allUsers) {
      if (u.email) usersByEmail[u.email.toLowerCase()] = u;
    }

    // 1. Process pending access limit invites — assign access_expires_at to newly joined users
    const pendingInvites = await base44.asServiceRole.entities.AccessLimitInvite.filter({ processed: false });

    let assignedCount = 0;
    for (const invite of pendingInvites) {
      const user = usersByEmail[(invite.email || '').toLowerCase()];
      if (user && !user.access_expires_at) {
        const createdDate = new Date(user.created_date);
        const expiresAt = new Date(createdDate.getTime() + ACCESS_DURATION_DAYS * DAY_MS);
        await base44.asServiceRole.entities.User.update(user.id, {
          access_expires_at: expiresAt.toISOString(),
        });
        assignedCount++;
        console.log(`Set access_expires_at for ${user.email}: ${expiresAt.toISOString()}`);
      }
      // Mark as processed whether or not user was found yet
      // (if user hasn't joined, we'll keep it unprocessed — actually mark processed to avoid 
      // re-checking forever; if they join later admin can set it manually)
      await base44.asServiceRole.entities.AccessLimitInvite.update(invite.id, { processed: true });
    }

    // 2. Revoke access for users whose access_expires_at has passed
    let revokedCount = 0;
    const now = new Date();

    for (const user of allUsers) {
      if (user.access_expires_at && user.subscription_status !== 'expired' && user.subscription_status !== 'cancelled') {
        const expiresAt = new Date(user.access_expires_at);
        if (expiresAt < now) {
          await base44.asServiceRole.entities.User.update(user.id, {
            subscription_status: 'expired',
          });
          revokedCount++;
          console.log(`Access expired for ${user.email}`);
        }
      }
    }

    console.log(`Access limits: ${assignedCount} assigned, ${revokedCount} revoked, ${pendingInvites.length} pending invites processed`);
    return Response.json({
      assigned: assignedCount,
      revoked: revokedCount,
      pending_invites: pendingInvites.length,
    });
  } catch (error) {
    console.error('processAccessLimits error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});