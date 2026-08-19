import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

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

    let notifiedCount = 0;

    for (const user of cancelledUsers) {
      if (!user.cancelled_date) {
        console.log(`User ${user.id} has no cancelled_date, skipping`);
        continue;
      }

      const cancelledDate = new Date(user.cancelled_date);
      cancelledDate.setHours(0, 0, 0, 0);

      const daysSinceCancellation = Math.floor((today - cancelledDate) / (1000 * 60 * 60 * 24));

      // Send warning on day 7
      if (daysSinceCancellation === 7) {
        const exportUrl = `${Deno.env.get('BASE44_APP_URL') || 'https://perkupdaily.app'}/settings`;

        const emailBody = `Hi ${user.full_name || 'there'},

Your Perk Up Daily subscription was cancelled 7 days ago. Your account — including all your saved entries, reflections, and life wins — is scheduled for permanent deletion soon.

To prevent losing your content, please export your data by visiting your Settings page:

${exportUrl}

If you'd like to keep your account active, you can resubscribe at any time.

With love,
The Perk Up Daily Team`;

        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: user.email,
            subject: 'Your Perk Up Daily account is scheduled for deletion',
            body: emailBody,
          });
          notifiedCount++;
          console.log(`Sent deletion warning to ${user.email}`);
        } catch (emailErr) {
          console.error(`Failed to email ${user.email}:`, emailErr.message);
        }
      }
    }

    console.log(`Deletion warning complete. ${notifiedCount} users notified.`);
    return Response.json({ processed: notifiedCount });
  } catch (error) {
    console.error('Deletion warning error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}