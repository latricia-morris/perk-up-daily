import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { formatE164, sendTwilioSMS } from '../../shared/smsUtils.ts';

const APP_URL = Deno.env.get("BASE44_APP_URL") || "https://perkupdaily.com";

// ── MESSAGE TEMPLATES (conversational, not commercial) ─────────
const NAME_OPENERS = [
  "Hey {name} 💛",
  "{name},",
  "Hi {name} —",
  "{name}, real quick:",
];

const GENERIC_OPENERS = [
  "Just thinking about you 💛",
  "Quick one:",
  "Don't forget this:",
  "Found this and had to share:",
  "Remember this?",
  "Saw this and thought of you:",
];

const PERSONAL_LEAD_INS = [
  "Remember this? You showed up and did this.",
  "Found this in your vault — worth holding onto today.",
  "You captured this for a reason. Today's a good day to revisit it.",
  "Look at what you've already done:",
];

const LIBRARY_LEAD_INS = [
  "Sit with this today:",
  "Here's something worth holding onto:",
  "Let this land:",
];

// Subtle CTAs — friendly nudge, not a sales pitch
const CTAS = [
  `💛`,
  `— Perk Up`,
  `Tap in when you're ready 💛`,
  `More waiting for you on Perk Up 💛`,
  `Open Perk Up when you need a reset 💛`,
];

const PERSONAL_TYPES = ['milestone', 'life_win', 'accomplishment', 'blessing', 'affirmation', 'experience'];

// Higher preview limit — user requested no truncation
const PREVIEW_LIMIT = 500;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getFirstName(user) {
  if (user.full_name) return user.full_name.split(' ')[0];
  return null;
}

function buildOpener(user) {
  const name = getFirstName(user);
  if (name && Math.random() < 0.5) {
    return pick(NAME_OPENERS).replace('{name}', name);
  }
  return pick(GENERIC_OPENERS);
}

function truncate(text, limit) {
  if (!text) return '';
  return text.length > limit ? text.slice(0, limit - 1) + '…' : text;
}

function buildMessage(user, content) {
  const opener = buildOpener(user);

  // ── Reflection prompt ──
  if (content.type === 'reflection_prompt') {
    const prompt = content.prompt;
    return `${opener}\n\nHere's something to sit with today:\n\n"${prompt.prompt}"\n\nReply with your thoughts and I'll save it to your vault 💛`;
  }

  // ── Personal entry ──
  if (content.type === 'personal') {
    const entry = content.entry;
    const entryText = entry.body || entry.title || '';
    const isMilestone = ['milestone', 'life_win', 'accomplishment'].includes(entry.entry_type);

    let leadIn;
    if (isMilestone && entry.entry_date) {
      const date = new Date(entry.entry_date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      leadIn = `I was looking back at where you accomplished this in ${monthYear}. Hope you're still proud of yourself 💛`;
    } else {
      leadIn = pick(PERSONAL_LEAD_INS);
    }

    const preview = truncate(entryText, PREVIEW_LIMIT);
    const cta = pick(CTAS);
    return `${opener}\n\n${leadIn}\n\n"${preview}"\n\n${cta}`;
  }

  // ── Library content ──
  const item = content.item;
  const text = item.body || '';
  const attribution = item.author ? ` — ${item.author}` : '';
  const preview = truncate(text, PREVIEW_LIMIT);
  const leadIn = pick(LIBRARY_LEAD_INS);
  const cta = pick(CTAS);
  return `${opener}\n\n${leadIn}\n\n"${preview}"${attribution}\n\n${cta}`;
}

// ── CONTENT SELECTION (weighted rotation) ──────────────────────
// ~15% reflection prompt → naturally yields 2-3 per week
// ~35% personal entry
// ~50% library content
async function selectContent(base44, user, libraryItems, reflectionPrompts) {
  const roll = Math.random();

  // Try reflection prompt (~15% chance, only if prompts exist)
  if (reflectionPrompts.length > 0 && roll < 0.15) {
    return { type: 'reflection_prompt', prompt: pick(reflectionPrompts) };
  }

  // Try personal entry (~35% chance)
  if (roll < 0.50) {
    try {
      const entries = await base44.asServiceRole.entities.UserEntry.filter({
        created_by_id: user.id,
        status: 'active',
      });
      const personal = entries.filter(e => PERSONAL_TYPES.includes(e.entry_type));
      const withPhotos = personal.filter(e => e.photo_url);
      if (withPhotos.length > 0) return { type: 'personal', entry: pick(withPhotos) };
      if (personal.length > 0) return { type: 'personal', entry: pick(personal) };
    } catch (err) {
      console.log(`Failed to fetch personal entries for ${user.id}: ${err.message}`);
    }
  }

  // Fall back to library content
  let userCats = [];
  try { userCats = JSON.parse(user.selected_categories || '[]'); } catch {}

  const christianEnabled = user.christian_content;
  let filtered = libraryItems.filter(item => {
    if (!christianEnabled && item.is_christian) return false;
    if (userCats.length > 0 && !userCats.includes(item.category)) return false;
    return true;
  });

  if (filtered.length === 0) {
    filtered = libraryItems.filter(item => !item.is_christian || christianEnabled);
  }
  if (filtered.length === 0) return null;
  return { type: 'library', item: pick(filtered) };
}

// ── MAIN HANDLER ───────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const etFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const etTime = etFormatter.format(now);
    const [etHour, etMin] = etTime.split(':').map(Number);
    const currentMinutes = etHour * 60 + etMin;

    const today = now.toISOString().split('T')[0];

    // Get all users with SMS consent + phone + active subscription
    const allUsers = await base44.asServiceRole.entities.User.list();
    const eligibleUsers = allUsers.filter(u =>
      u.sms_consent && u.phone_number &&
      u.subscription_status !== 'expired' && u.subscription_status !== 'cancelled'
    );

    if (eligibleUsers.length === 0) {
      console.log('No eligible users for SMS delivery');
      return Response.json({ sent: 0, failed: 0, reason: 'no_eligible_users' });
    }

    // Get existing delivery logs for today to avoid duplicates
    const todayLogs = await base44.asServiceRole.entities.DeliveryLog.filter({ delivery_date: today });
    const deliveredKeys = new Set(todayLogs.map(l => `${l.user_id}_${l.session_type}`));

    // Fetch library content and reflection prompts once
    const libraryItems = await base44.asServiceRole.entities.AppLibrary.filter({ status: 'active' });
    const reflectionPrompts = await base44.asServiceRole.entities.ReflectionPrompt.filter({ status: 'active' });

    const sessions = [
      { key: 'morning', timeKey: 'morning_time', enabledKey: 'morning_enabled' },
      { key: 'midday', timeKey: 'midday_time', enabledKey: 'midday_enabled' },
      { key: 'evening', timeKey: 'evening_time', enabledKey: 'evening_enabled' },
    ];

    let sentCount = 0;
    let failedCount = 0;

    for (const user of eligibleUsers) {
      for (const session of sessions) {
        if (!user[session.enabledKey]) continue;

        const deliveryTime = user[session.timeKey];
        if (!deliveryTime) continue;

        const [h, m] = deliveryTime.split(':').map(Number);
        const slotMinutes = h * 60 + m;

        // Skip if this delivery time hasn't passed yet
        if (slotMinutes > currentMinutes) continue;

        // Skip if already delivered today
        const logKey = `${user.id}_${session.key}`;
        if (deliveredKeys.has(logKey)) continue;

        try {
          const content = await selectContent(base44, user, libraryItems, reflectionPrompts);
          if (!content) {
            console.log(`No content available for user ${user.id} (${session.key})`);
            continue;
          }

          const message = buildMessage(user, content);
          const phone = formatE164(user.phone_number, user.country_code || 'US');
          const result = await sendTwilioSMS(phone, message);

          // Log delivery
          const cardSource = content.type === 'personal' ? 'user_entry'
            : content.type === 'reflection_prompt' ? 'reflection_prompt'
            : 'library';
          const cardId = content.type === 'personal' ? content.entry.id
            : content.type === 'reflection_prompt' ? content.prompt.id
            : content.item.id;

          await base44.asServiceRole.entities.DeliveryLog.create({
            user_id: user.id,
            session_type: session.key,
            featured_item_id: cardId,
            featured_source: cardSource,
            delivery_date: today,
          });

          // If we sent a reflection prompt, create an active SMS context
          // so incoming replies are saved as reflections
          if (content.type === 'reflection_prompt') {
            // Expire any existing active contexts for this user
            const existingContexts = await base44.asServiceRole.entities.ActiveSmsContext.filter({
              user_id: user.id,
              status: 'active',
            });
            for (const ctx of existingContexts) {
              await base44.asServiceRole.entities.ActiveSmsContext.update(ctx.id, { status: 'expired' });
            }

            const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
            await base44.asServiceRole.entities.ActiveSmsContext.create({
              user_id: user.id,
              phone_number: phone,
              context_type: 'reflection_prompt',
              prompt_id: content.prompt.id,
              prompt_text: content.prompt.prompt,
              status: 'active',
              expires_at: expiresAt,
            });
          }

          sentCount++;
          console.log(`Daily uplift sent to ${user.email || user.id} (${session.key}): ${result.sid}`);
        } catch (err) {
          failedCount++;
          console.error(`Failed to send to ${user.email || user.id} (${session.key}): ${err.message}`);
        }
      }
    }

    console.log(`Daily uplifts complete: ${sentCount} sent, ${failedCount} failed`);
    return Response.json({ sent: sentCount, failed: failedCount });
  } catch (error) {
    console.error('sendDailyUplifts error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});