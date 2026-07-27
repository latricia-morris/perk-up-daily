import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { formatE164, sendTwilioSMS } from '../../shared/smsUtils.ts';

const APP_URL = Deno.env.get("BASE44_APP_URL") || "https://perkupdaily.com";

// ── CONTENT CONFIG ─────────────────────────────────────────────
const PERSONAL_TYPES = ['milestone', 'life_win', 'accomplishment', 'blessing', 'affirmation', 'experience'];
const PREVIEW_LIMIT = 500;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getFirstName(user) {
  if (user.full_name) return user.full_name.split(' ')[0];
  return null;
}

function truncate(text, limit) {
  if (!text) return '';
  return text.length > limit ? text.slice(0, limit - 1) + '…' : text;
}

// ── ORGANIC MESSAGE BUILDER ────────────────────────────────────
// No openers, no lead-ins, no separate CTA paragraphs.
// Flows like a human texting a human.
function buildMessage(user, content) {
  const name = getFirstName(user);

  // ── Reflection prompt ──
  if (content.type === 'reflection_prompt') {
    const promptText = content.prompt.prompt;
    return `${promptText}\n\nReply with whatever comes to mind and I'll tuck it into your vault 💛`;
  }

  // ── Personal entry ──
  if (content.type === 'personal') {
    const entry = content.entry;
    const entryText = entry.body || entry.title || '';
    const preview = truncate(entryText, PREVIEW_LIMIT);
    const isMilestone = ['milestone', 'life_win', 'accomplishment'].includes(entry.entry_type);

    if (isMilestone && entry.entry_date) {
      const date = new Date(entry.entry_date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      return `Looking back at ${monthYear} — "${preview}" 💛 still true today.`;
    }

    return `"${preview}" 💛 you captured this for a reason.`;
  }

  // ── Library content ──
  const item = content.item;
  const text = item.body || '';
  const attribution = item.author ? ` — ${item.author}` : '';
  const preview = truncate(text, PREVIEW_LIMIT);
  return `"${preview}"${attribution}`;
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
// Batch-send model: runs every 15 min via automation.
// Queries only users whose delivery time matches the CURRENT 15-min window.
// This keeps each run fast and prevents all-at-once delivery.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // ── Compute current time in Eastern Time ──
    const now = new Date();
    const etFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const etParts = etFormatter.formatToParts(now);
    const etHour = parseInt(etParts.find(p => p.type === 'hour').value);
    const etMin = parseInt(etParts.find(p => p.type === 'minute').value);

    // Round current minutes DOWN to the 15-min window
    const windowMin = Math.floor(etMin / 15) * 15;
    const currentTimeKey = `${String(etHour).padStart(2, '0')}:${String(windowMin).padStart(2, '0')}`;

    // Today's date in ET (not UTC — this was the previous bug)
    const etYear = etParts.find(p => p.type === 'year').value;
    const etMonth = etParts.find(p => p.type === 'month').value;
    const etDay = etParts.find(p => p.type === 'day').value;
    const today = `${etYear}-${etMonth}-${etDay}`;

    // ── Fetch library + prompts once ──
    const libraryItems = await base44.asServiceRole.entities.AppLibrary.filter({ status: 'active' });
    const reflectionPrompts = await base44.asServiceRole.entities.ReflectionPrompt.filter({ status: 'active' });

    // ── Fetch delivery logs for today (to skip already-delivered) ──
    const todayLogs = await base44.asServiceRole.entities.DeliveryLog.filter({ delivery_date: today });
    const deliveredKeys = new Set(todayLogs.map(l => `${l.user_id}_${l.session_type}`));

    // ── For each session, query only users whose time matches the current window ──
    const sessions = [
      { key: 'morning', timeKey: 'morning_time', enabledKey: 'morning_enabled' },
      { key: 'midday', timeKey: 'midday_time', enabledKey: 'midday_enabled' },
      { key: 'evening', timeKey: 'evening_time', enabledKey: 'evening_enabled' },
    ];

    let sentCount = 0;
    let failedCount = 0;
    let processedCount = 0;

    for (const session of sessions) {
      // Query users whose delivery time for this session matches the current window
      const sessionUsers = await base44.asServiceRole.entities.User.filter({
        [session.timeKey]: currentTimeKey,
        [session.enabledKey]: true,
        sms_consent: true,
      });

      // Filter to eligible (has phone + active subscription)
      const eligible = sessionUsers.filter(u =>
        u.phone_number &&
        u.subscription_status !== 'expired' &&
        u.subscription_status !== 'cancelled'
      );

      for (const user of eligible) {
        processedCount++;
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
          if (content.type === 'reflection_prompt') {
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

    console.log(`Daily uplifts [window ${currentTimeKey} ET, ${today}]: ${processedCount} processed, ${sentCount} sent, ${failedCount} failed`);
    return Response.json({ sent: sentCount, failed: failedCount, window: currentTimeKey, date: today });
  } catch (error) {
    console.error('sendDailyUplifts error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}