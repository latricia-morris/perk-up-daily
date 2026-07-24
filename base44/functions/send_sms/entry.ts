import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { formatE164, sendTwilioSMS } from '../../shared/smsUtils.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const { to, body, broadcast, userId } = await req.json();

    if (!body || !body.trim()) {
      return Response.json({ error: 'Message body is required' }, { status: 400 });
    }

    let recipients = [];

    if (broadcast) {
      const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
      recipients = users
        .filter(u => u.sms_consent && u.phone_number)
        .map(u => ({
          phone: formatE164(u.phone_number, u.country_code || 'US'),
          name: u.full_name || u.email,
        }));
    } else if (userId) {
      const targetUser = await base44.asServiceRole.entities.User.get(userId);
      if (!targetUser || !targetUser.phone_number) {
        return Response.json({ error: 'User has no phone number on file' }, { status: 400 });
      }
      recipients = [{
        phone: formatE164(targetUser.phone_number, targetUser.country_code || 'US'),
        name: targetUser.full_name || targetUser.email,
      }];
    } else if (to) {
      recipients = [{ phone: formatE164(to, 'US'), name: 'Direct' }];
    } else {
      return Response.json({ error: 'No recipient specified' }, { status: 400 });
    }

    if (recipients.length === 0) {
      return Response.json({ error: 'No recipients with SMS consent and phone numbers found' }, { status: 400 });
    }

    const results = [];
    for (const recipient of recipients) {
      try {
        const smsResult = await sendTwilioSMS(recipient.phone, body);
        results.push({ ...recipient, success: true, sid: smsResult.sid });
        console.log(`SMS sent to ${recipient.phone} (${recipient.name}): ${smsResult.sid}`);
      } catch (err) {
        results.push({ ...recipient, success: false, error: err.message });
        console.error(`SMS failed for ${recipient.phone} (${recipient.name}): ${err.message}`);
      }
    }

    return Response.json({
      success: true,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error('SMS send error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});