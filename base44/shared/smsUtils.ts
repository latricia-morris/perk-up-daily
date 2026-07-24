const COUNTRY_DIAL_CODES = {
  US: '1', CA: '1', GB: '44', AU: '61', NZ: '64', IE: '353', ZA: '27',
  MX: '52', BR: '55', DE: '49', FR: '33', IT: '39', ES: '34', NL: '31',
  SG: '65', HK: '852', JP: '81', KR: '82', IN: '91', AE: '971',
};

export function formatE164(phone, countryCode) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('1') && digits.length === 11) return '+' + digits;
  const dial = COUNTRY_DIAL_CODES[countryCode] || '1';
  return '+' + dial + digits;
}

export async function sendTwilioSMS(to, body) {
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