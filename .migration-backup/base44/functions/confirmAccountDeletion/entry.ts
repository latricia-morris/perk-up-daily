import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Parse the request body for the token
    let token = null;
    try {
      const body = await req.json();
      token = body.token;
    } catch {
      // Body might be empty or not JSON
    }

    if (!token) return Response.json({ error: 'Token required' }, { status: 400 });

    // Find the deletion request by token
    const requests = await base44.asServiceRole.entities.AccountDeletionRequest.filter({ token, status: 'pending' });
    if (requests.length === 0) {
      return Response.json({ error: 'Invalid or already used token' }, { status: 400 });
    }

    const deletionRequest = requests[0];

    // Check expiry (24 hours)
    const createdDate = new Date(deletionRequest.created_date);
    const expiresAt = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
    if (new Date() > expiresAt) {
      await base44.asServiceRole.entities.AccountDeletionRequest.update(deletionRequest.id, { status: 'expired' });
      return Response.json({ error: 'Token expired. Please request deletion again.' }, { status: 400 });
    }

    const userId = deletionRequest.user_id;
    const userEmail = deletionRequest.email;

    // Delete user's data across all entities
    await base44.asServiceRole.entities.UserEntry.deleteMany({ created_by_id: userId });
    await base44.asServiceRole.entities.SentUplifts.deleteMany({ sender_id: userId });
    await base44.asServiceRole.entities.DeliveryLog.deleteMany({ user_id: userId });

    // Mark deletion request as confirmed (audit trail)
    await base44.asServiceRole.entities.AccountDeletionRequest.update(deletionRequest.id, { status: 'confirmed' });

    // Send final confirmation email
    await base44.integrations.Core.SendEmail({
      to: userEmail,
      subject: 'Your Account Has Been Deleted',
      body: "Your Perk Up Daily account and all associated data have been permanently deleted. We're sorry to see you go. If you ever want to come back, we'll be here.",
    });

    return Response.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('confirmAccountDeletion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});