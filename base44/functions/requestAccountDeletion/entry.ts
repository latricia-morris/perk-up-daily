import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Generate a random verification token
    const token = crypto.randomUUID();

    // Store the deletion request
    await base44.asServiceRole.entities.AccountDeletionRequest.create({
      user_id: user.id,
      email: user.email,
      token,
      status: 'pending',
    });

    // Send confirmation email
    const appUrl = Deno.env.get('BASE44_APP_URL') || 'https://perkupdaily.app';
    const confirmUrl = `${appUrl}/delete-account?token=${token}`;

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: 'Confirm Your Account Deletion',
      body: `We received a request to delete your Perk Up Daily account.\n\nTo confirm, click this link: ${confirmUrl}\n\nThis link expires in 24 hours. If you didn't request this, you can safely ignore this email and your account will not be deleted.`,
    });

    return Response.json({ success: true, message: 'Confirmation email sent' });
  } catch (error) {
    console.error('requestAccountDeletion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});