import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const COUNTRY_DIAL_CODES = {
  US: '1', CA: '1', GB: '44', AU: '61', NZ: '64', IE: '353', ZA: '27',
  MX: '52', BR: '55', DE: '49', FR: '33', IT: '39', ES: '34', NL: '31',
  SG: '65', HK: '852', JP: '81', KR: '82', IN: '91', AE: '971',
};

function formatE164(phone, countryCode) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('1') && digits.length === 11) return '+' + digits;
  const dial = COUNTRY_DIAL_CODES[countryCode] || '1';
  return '+' + dial + digits;
}

async function sendTwilioSMS(to, body) {
  const accountSid = Deno.env.get("TwilioAccountSID");
  const apiKey = Deno.env.get("TwilioSID");
  const apiSecret = Deno.env.get("TwilioClientSecret");
  const fromNumber = Deno.env.get("TwilioFromNumber");

  if (!accountSid || !apiKey || !apiSecret || !fromNumber) {
    throw new Error('Twilio secrets not configured');
  }

  const auth = btoa(`${apiKey}:${apiSecret}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams();
  params.append("To", to);
  params.append("From", fromNumber);
  params.append("Body", body);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Twilio error: ${response.status}`);
  }
  return { sid: result.sid, status: result.status };
}

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