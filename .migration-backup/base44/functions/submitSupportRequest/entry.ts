import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const SUPPORT_EMAIL = 'perkupdaily@gmail.com';

const TYPE_LABELS = {
  content: 'Content',
  functions_features: 'Functions & Features',
  questions: 'Questions',
  account_billing: 'Account & Billing',
  other: 'Other',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { name, email, support_type, subject, message } = body;

    if (!email || !support_type || !subject || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Store the support request
    await base44.asServiceRole.entities.SupportRequest.create({
      name: name || '',
      email,
      support_type,
      subject,
      message,
      status: 'pending',
    });

    // Send email notification to admin
    const typeLabel = TYPE_LABELS[support_type] || support_type;
    const emailBody = [
      'New support request received.',
      '',
      'Type: ' + typeLabel,
      'From: ' + (name || 'Anonymous') + ' (' + email + ')',
      'Subject: ' + subject,
      '',
      'Message:',
      message,
      '',
      '— Perk Up Daily Support',
    ].join('\n');

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: SUPPORT_EMAIL,
        subject: '[Support] ' + typeLabel + ': ' + subject,
        body: emailBody,
        from_name: 'Perk Up Daily Support',
      });
    } catch (emailErr) {
      console.error('Email send failed (recipient may not be registered):', emailErr.message);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('submitSupportRequest error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});