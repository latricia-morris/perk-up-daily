import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { formatE164, sendTwilioSMS } from '../../shared/smsUtils.ts';

const APP_URL = Deno.env.get("BASE44_APP_URL") || "https://perkupdaily.com";

// ── MESSAGE TEMPLATES ──────────────────────────────────────────
const NAME_OPENERS = [
  "Hey {name}! 💛",
  "Hey {name},",
  "Hi {name}! Just dropping a smile in your texts.",
  "{name} —",
];

const GENERIC_OPENERS = [
  "Quick reminder:",
  "Don't forget this:",
  "Saw this and thought of you:",
  "Just dropping a smile in your texts 💛",
  "Remember this?",
  "Found this and had to share:",
];

const PERSONAL_LEAD_INS = [
  "Remember this? You showed up and did this. Don't forget it. 💛",
  "Found this in your vault — it's worth holding onto today.",
  "You captured this for a reason. Today's a good day to revisit it.",
];

const CTAS = [
  `Tap to check in on Perk Up for more → ${APP_URL}`,
  `Open Perk Up for your full daily set → ${APP_URL}`,
  `More positivity waiting on Perk Up → ${APP_URL}`,
  `Need a brain break? Open Perk Up → ${APP_URL}`,
  `Come get your perk up → ${APP_URL}`,
];

const PERSONAL_TYPES = ['milestone', 'life_win', 'accomplishment', 'blessing', 'affirmation', 'experience'];

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

function buildMessage(user, content) {
  const opener = buildOpener(user);
  const cta = pick(CTAS);

  if (content.type === 'personal') {
    const entry = content.entry;
    const entryText = entry.body || entry.title || '';
    const isMilestone = ['milestone', 'life_win', 'accomplishment'].includes(entry.entry_type);

    let leadIn;
    if (isMilestone && entry.entry_date) {
      const date = new Date(entry.entry_date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      leadIn = `I was looking back at where you accomplished this in ${monthYear}. I hope you're still proud of yourself! 💛`;
    } else {
      leadIn = pick(PERSONAL_LEAD_INS);
    }

    const preview = entryText.length > 120 ? entryText.slice(0, 117) + '…' : entryText;
    return `${opener}\n\n${leadIn}\n\n"${preview}"\n\n${cta}`;
  } else {
    const item = content.item;
    const text = item.body || '';
    const attribution = item.author ? ` — ${item.author}` : '';
    const preview = text.length > 120 ? text.slice(0, 117) + '…' : text;
    return `${opener}\n\n"${preview}"${attribution}\n\n${cta}`;
  }
}

async function selectContent(base44, user, libraryItems) {
  // 50% chance to try personal entries
  if (Math.random() < 0.5) {
    try {
      const entries = await base44.asServiceRole.entities.UserEntry.filter({
        created_by_id: user.id,
        status: 'active',
      });
      const personal = entries.filter(e => PERSONAL_TYPES.includes(e.entry_type));
      // Prioritize entries with photos
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

    // Get current time in America/New_York (app timezone)
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

    // Fetch library content once
    const libraryItems = await base44.asServiceRole.entities.AppLibrary.filter({ status: 'active' });

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
          const content = await selectContent(base44, user, libraryItems);
          if (!content) {
            console.log(`No content available for user ${user.id} (${session.key})`);
            continue;
          }

          const message = buildMessage(user, content);
          const phone = formatE164(user.phone_number, user.country_code || 'US');
          const result = await sendTwilioSMS(phone, message);

          const cardSource = content.type === 'personal' ? 'user_entry' : 'library';
          const cardId = content.type === 'personal' ? content.entry.id : content.item.id;

          await base44.asServiceRole.entities.DeliveryLog.create({
            user_id: user.id,
            session_type: session.key,
            featured_item_id: cardId,
            featured_source: cardSource,
            delivery_date: today,
          });

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