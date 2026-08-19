/**
 * NOTIFICATION MESSAGE LIBRARY
 * Pre-written prompt messages for Morning and Midday push notifications.
 * 40 messages that rotate and shuffle to avoid repetition.
 *
 * Each message is a short encouragement line.
 * The system pairs one message with a content highlight and a CTA.
 */

export const NOTIFICATION_MESSAGES = [
  // Morning
  "Your morning pick-me-up is waiting.",
  "Good things are already lined up for you today.",
  "Start today anchored in what's true about you.",
  "Your Perk Up for this morning is ready.",
  "Before the noise begins — here's something worth holding onto.",
  "Your wins haven't gone anywhere. Come see them.",
  "This morning's encouragement was made for a day like today.",
  "Something in your vault is speaking to right now.",
  "You've already overcome more than you remember. Good morning.",
  "Today's reminder is waiting for you inside.",
  "You're more than your to-do list. Here's proof.",
  "Start your day from a place of strength, not hustle.",
  "One truth. One breath. One moment. Open Perk Up.",
  "Your morning delivery just dropped.",
  "There's something worth smiling about. Come see it.",
  "A few words that might shift your whole morning.",
  "Your daily encouragement is ready when you are.",
  "Check in with the best version of yourself this morning.",
  "The best days start on purpose. Yours just did.",
  "A quick reminder of who you actually are.",

  // Midday
  "Mid-day check: How are you doing? Here's a boost.",
  "A midday moment to reset and refocus.",
  "Your afternoon encouragement just arrived.",
  "Halfway through — let's make the second half count.",
  "Take 30 seconds. Your Perk Up is waiting.",
  "Sometimes all it takes is one sentence. Here's yours.",
  "You've been working hard. Here's something to carry with you.",
  "A reminder in the middle of your day that you matter.",
  "Pause. Breathe. This was made for right now.",
  "Your midday delivery is ready. One good thing is all it takes.",
  "Refuel for the rest of your day.",
  "Don't let the afternoon grind wear you down. Open this.",
  "One truth can change the temperature of a whole afternoon.",
  "Your daily Perk Up is live — check in for a second.",
  "A moment of clarity in the middle of the day.",
  "Keep going. Here's your midday dose of encouragement.",
  "Something from your vault is right on time.",
  "Quick reset. Big impact. Open Perk Up.",
  "You've collected some real wisdom. Time to use it.",
  "One good thought for the rest of your day.",
];

const STORAGE_KEY = 'perkup-notif-rotation';
const WINDOW_SIZE = 10; // don't repeat within last 10 messages

/**
 * Get the next notification message, avoiding recent repeats.
 * Tracks used messages in localStorage.
 */
export function getNextNotificationMessage() {
  let state = { queue: [], recentIndexes: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}

  // Build available pool (exclude recently used indexes)
  const recent = new Set(state.recentIndexes || []);
  const available = NOTIFICATION_MESSAGES
    .map((_, i) => i)
    .filter(i => !recent.has(i));

  // If somehow all are recent, reset
  const pool = available.length > 0 ? available : NOTIFICATION_MESSAGES.map((_, i) => i);

  // Pick random from pool
  const idx = pool[Math.floor(Math.random() * pool.length)];

  // Update recent window
  const newRecent = [...(state.recentIndexes || []), idx].slice(-WINDOW_SIZE);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ recentIndexes: newRecent }));
  } catch {}

  return NOTIFICATION_MESSAGES[idx];
}

/**
 * Build the full notification text for a time block highlight item.
 * Uses canonical field map per content type.
 */
export function buildNotificationText(promptMessage, highlightItem, session = 'morning') {
  const entryType = highlightItem?.entry_type || highlightItem?.content_type || '';
  const body = highlightItem?.body || '';
  const author = highlightItem?.author || null;
  const reference = highlightItem?.reference || null;
  const category = highlightItem?.category || '';

  // Power Ups label rule
  const isPowerUp = entryType === 'quote' && category === 'strong_body';
  const typeLabel = isPowerUp ? 'Power Up'
    : entryType === 'quote' ? 'Quote'
    : entryType === 'scripture' ? 'Scripture'
    : entryType === 'affirmation' ? 'Affirmation'
    : entryType === 'identity_swap' ? 'Identity Upgrade'
    : entryType === 'experience' ? 'Memory'
    : entryType === 'blessing' ? 'Blessing'
    : entryType === 'life_win' ? 'Life Win'
    : entryType === 'personal_note' ? 'Note'
    : 'Perk Up';

  // Build content preview (keep short for lock screen)
  let preview = '';
  if (entryType === 'quote' || entryType === 'scripture') {
    const short = body.length > 80 ? body.slice(0, 77) + '…' : body;
    const attribution = entryType === 'quote' && author ? ` — ${author}`
      : entryType === 'scripture' && reference ? ` (${reference})`
      : '';
    preview = `${typeLabel}: "${short}"${attribution}`;
  } else if (entryType === 'affirmation') {
    const short = body.length > 80 ? body.slice(0, 77) + '…' : body;
    preview = `${typeLabel}: "${short}"`;
  } else if (entryType === 'identity_swap') {
    const short = body.length > 70 ? body.slice(0, 67) + '…' : body;
    preview = `${typeLabel}: "${short}"`;
  } else {
    const short = body.length > 80 ? body.slice(0, 77) + '…' : body;
    preview = `${typeLabel}: ${short}`;
  }

  const cta = session === 'morning'
    ? 'Tap to open Perk Up and see your full morning set.'
    : 'Tap to open Perk Up and see your full midday set.';

  return `${promptMessage}\n\n${preview}\n\n${cta}`;
}