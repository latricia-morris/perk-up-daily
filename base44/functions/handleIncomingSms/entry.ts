import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { formatE164, sendTwilioSMS } from '../../shared/smsUtils.ts';

// ── KEYWORD MAPS (for direct parsing — avoids LLM) ─────────────
const ENTRY_TYPE_KEYWORDS = {
  'blessing': 'blessing',
  'life win': 'life_win',
  'win': 'life_win',
  'micro story': 'micro_story',
  'story': 'micro_story',
  'affirmation': 'affirmation',
  'declaration': 'affirmation',
  'power up': 'power_up',
  'quote': 'quote',
  'scripture': 'scripture',
  'milestone': 'milestone',
  'accomplishment': 'accomplishment',
  'experience': 'experience',
  'note': 'personal_note',
  'reflection': 'reflection',
  'goal': 'vision_goal',
  'vision': 'vision_goal',
};

const CATEGORY_KEYWORDS = {
  'faith': 'deep_faith',
  'relationship': 'rich_relationships',
  'relationships': 'rich_relationships',
  'body': 'strong_body',
  'health': 'strong_body',
  'mind': 'clear_mind',
  'business': 'strong_business',
  'money': 'sound_money',
  'finance': 'sound_money',
};

const VALID_ENTRY_TYPES = [
  'experience', 'blessing', 'life_win', 'affirmation', 'power_up',
  'quote', 'personal_note', 'identity_swap', 'scripture',
  'accomplishment', 'milestone', 'reflection', 'vision_goal'
];

const VALID_CATEGORIES = [
  'deep_faith', 'rich_relationships', 'strong_body', 'clear_mind',
  'strong_business', 'sound_money'
];

// ── RESPONSE TEMPLATES ──────────────────────────────────────────
const CONFIRMATIONS = [
  "Saved to your vault 💛",
  "Got it — added to your vault ✨",
  "Done! That's in your vault now 💛",
  "Saved! You can always find it in your vault.",
];

const CLARIFICATION_QUESTION =
  "I'd love to save that to your vault! Is it a Blessing, Life Win, Micro-story, or Affirmation? Just reply with the type 💛";

const HELP_FALLBACK =
  "I can save your thoughts to your vault! Text 'Blessing:' or 'Life Win:' followed by your message 💛";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Parse messages that start with a type keyword (e.g. "Blessing: I'm grateful for...")
function parseDirectIntent(text) {
  const lower = text.toLowerCase().trim();

  for (const [keyword, entryType] of Object.entries(ENTRY_TYPE_KEYWORDS)) {
    if (lower.startsWith(keyword + ':') || lower.startsWith(keyword + ' -')) {
      const body = text.slice(text.indexOf(':') >= 0 ? text.indexOf(':') + 1 : keyword.length).trim();
      if (body.length < 3) continue;

      // Try to extract category from the body
      let category = null;
      for (const [catKeyword, catValue] of Object.entries(CATEGORY_KEYWORDS)) {
        if (lower.includes(catKeyword)) {
          category = catValue;
          break;
        }
      }

      return { entry_type: entryType, body, category, confidence: 0.95 };
    }
  }

  return null;
}

// Resolve a type keyword from a short reply (for clarification flow)
function resolveTypeFromReply(text) {
  const lower = text.toLowerCase().trim();
  for (const [keyword, entryType] of Object.entries(ENTRY_TYPE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return entryType;
    }
  }
  return null;
}

function extractCategory(text) {
  const lower = text.toLowerCase();
  for (const [catKeyword, catValue] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(catKeyword)) {
      return catValue;
    }
  }
  return 'clear_mind';
}

// ── MAIN HANDLER ───────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Parse Twilio webhook — handles both form-encoded (production) and JSON (testing)
    let body = '';
    let fromPhone = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const jsonData = await req.json();
      body = jsonData.Body || jsonData.body || '';
      fromPhone = jsonData.From || jsonData.from || '';
    } else {
      const formData = await req.formData();
      body = (formData.get('Body') || '').toString();
      fromPhone = (formData.get('From') || '').toString();
    }

    if (!body || !fromPhone) {
      return Response.json({ error: 'Missing Body or From' }, { status: 400 });
    }

    const messageText = body.trim();
    console.log(`Incoming SMS from ${fromPhone}: ${messageText}`);

    // Find user by phone number
    const allUsers = await base44.asServiceRole.entities.User.list();
    const user = allUsers.find(u => {
      if (!u.phone_number) return false;
      const userPhone = formatE164(u.phone_number, u.country_code || 'US');
      return userPhone === fromPhone;
    });

    if (!user) {
      console.log(`No user found for phone ${fromPhone}`);
      return Response.json({ status: 'no_user' });
    }

    const phone = formatE164(user.phone_number, user.country_code || 'US');
    const now = new Date();

    // Check for active SMS context
    const activeContexts = await base44.asServiceRole.entities.ActiveSmsContext.filter({
      user_id: user.id,
      status: 'active',
    });

    // Filter to non-expired
    const validContexts = activeContexts.filter(c =>
      !c.expires_at || new Date(c.expires_at) > now
    );
    const activeContext = validContexts[0];

    // ── ROUTE 1: Reflection prompt reply ──
    if (activeContext && activeContext.context_type === 'reflection_prompt') {
      if (messageText.length < 3) {
        await sendTwilioSMS(phone, "Take your time — reply whenever you're ready and I'll save it 💛");
        return Response.json({ status: 'prompt_too_short' });
      }

      await base44.asServiceRole.entities.UserEntry.create({
        entry_type: 'reflection',
        title: activeContext.prompt_text || '',
        body: messageText,
        category: 'clear_mind',
        prompt_id: activeContext.prompt_id || null,
        status: 'active',
      });

      await base44.asServiceRole.entities.ActiveSmsContext.update(activeContext.id, {
        status: 'resolved',
      });

      await sendTwilioSMS(phone, pick(CONFIRMATIONS));
      console.log(`Reflection saved for ${user.email || user.id}`);
      return Response.json({ status: 'reflection_saved' });
    }

    // ── ROUTE 2: Entry clarification reply ──
    if (activeContext && activeContext.context_type === 'entry_clarification') {
      const resolvedType = resolveTypeFromReply(messageText);
      const pendingBody = activeContext.pending_body || '';

      if (resolvedType && pendingBody) {
        const category = extractCategory(pendingBody);

        await base44.asServiceRole.entities.UserEntry.create({
          entry_type: resolvedType,
          body: pendingBody,
          category: category,
          status: 'active',
        });

        await base44.asServiceRole.entities.ActiveSmsContext.update(activeContext.id, {
          status: 'resolved',
        });

        await sendTwilioSMS(phone, pick(CONFIRMATIONS));
        console.log(`Entry saved after clarification for ${user.email || user.id}: ${resolvedType}`);
        return Response.json({ status: 'entry_saved_after_clarification' });
      }

      // Couldn't resolve type
      await sendTwilioSMS(phone, "I didn't catch that. Is it a Blessing, Life Win, Micro-story, or Affirmation?");
      return Response.json({ status: 'clarification_retry' });
    }

    // ── ROUTE 3: Direct keyword parsing (no LLM) ──
    const directResult = parseDirectIntent(messageText);
    if (directResult) {
      const category = directResult.category || 'clear_mind';

      await base44.asServiceRole.entities.UserEntry.create({
        entry_type: directResult.entry_type,
        body: directResult.body,
        category: category,
        status: 'active',
      });

      await sendTwilioSMS(phone, pick(CONFIRMATIONS));
      console.log(`Entry saved directly for ${user.email || user.id}: ${directResult.entry_type}`);
      return Response.json({ status: 'entry_saved_direct' });
    }

    // ── Guard: too short to be meaningful ──
    if (messageText.length < 5) {
      await sendTwilioSMS(phone, HELP_FALLBACK);
      return Response.json({ status: 'too_short' });
    }

    // ── ROUTE 4: LLM extraction (last resort) ──
    try {
      const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a content classifier for a personal growth app called Perk Up Daily. Analyze this SMS message and extract structured data.

Message: "${messageText}"

Return a JSON object with:
- entry_type: one of ${JSON.stringify(VALID_ENTRY_TYPES)} (empty string if unsure)
- category: one of ${JSON.stringify(VALID_CATEGORIES)}
- body: the cleaned-up content text
- confidence: 0.0 to 1.0

Rules:
- Personal story or memory → "experience"
- Expresses gratitude → "blessing"
- Describes an achievement → "life_win" or "accomplishment"
- Positive statement about oneself → "affirmation"
- Short inspirational thought → "power_up"
- Goal or aspiration → "vision_goal"
- If confidence < 0.8, set entry_type to empty string
- Map casual words: faith→deep_faith, relationship→rich_relationships, body/health→strong_body, mind→clear_mind, business→strong_business, money/finance→sound_money
- If no category is determinable, use "clear_mind"`,
        response_json_schema: {
          type: 'object',
          properties: {
            entry_type: { type: 'string' },
            category: { type: 'string' },
            body: { type: 'string' },
            confidence: { type: 'number' },
          },
        },
      });

      console.log(`LLM extraction: ${JSON.stringify(llmResult)}`);

      if (llmResult.entry_type && llmResult.confidence >= 0.8) {
        // Save directly
        await base44.asServiceRole.entities.UserEntry.create({
          entry_type: llmResult.entry_type,
          body: llmResult.body || messageText,
          category: llmResult.category || 'clear_mind',
          status: 'active',
        });

        await sendTwilioSMS(phone, pick(CONFIRMATIONS));
        console.log(`Entry saved via LLM for ${user.email || user.id}: ${llmResult.entry_type}`);
        return Response.json({ status: 'entry_saved_llm' });
      }

      // Ask for clarification — store pending body for the next reply
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      await base44.asServiceRole.entities.ActiveSmsContext.create({
        user_id: user.id,
        phone_number: phone,
        context_type: 'entry_clarification',
        pending_body: llmResult.body || messageText,
        status: 'active',
        expires_at: expiresAt,
      });

      await sendTwilioSMS(phone, CLARIFICATION_QUESTION);
      return Response.json({ status: 'clarification_requested' });
    } catch (llmErr) {
      console.error(`LLM extraction failed: ${llmErr.message}`);

      // Fallback: store pending body and ask for clarification
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      await base44.asServiceRole.entities.ActiveSmsContext.create({
        user_id: user.id,
        phone_number: phone,
        context_type: 'entry_clarification',
        pending_body: messageText,
        status: 'active',
        expires_at: expiresAt,
      });

      await sendTwilioSMS(phone, CLARIFICATION_QUESTION);
      return Response.json({ status: 'clarification_fallback' });
    }
  } catch (error) {
    console.error('handleIncomingSms error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});