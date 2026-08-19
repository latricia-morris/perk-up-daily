/**
 * Vision & Goals — progress stages, check-in messages, and helpers.
 * Keeps all vision-goal-specific logic in one place so it doesn't
 * leak into other content types.
 */

export const PROGRESS_STAGES = [
  { value: 'looking_ahead',   label: 'Looking ahead' },
  { value: 'in_process',      label: 'In process' },
  { value: 'making_progress', label: 'Making progress' },
  { value: 'almost_there',    label: 'Almost there' },
  { value: 'crushed_it',      label: 'Crushed it' },
];

export function getStageLabel(value) {
  return PROGRESS_STAGES.find(s => s.value === value)?.label || 'Looking ahead';
}

export function getStageOrder(value) {
  const idx = PROGRESS_STAGES.findIndex(s => s.value === value);
  return idx === -1 ? 0 : idx;
}

export const STAGE_COLOR = '#2D6A4F';

const STAGE_MESSAGES = {
  looking_ahead: [
    'Your future self is so gonna thank you for sticking with this.',
    "You won't regret keeping this promise to yourself.",
    'Still feeling pulled toward this? Keep it in your line of sight.',
    "Keep this one in your line of sight — it's gonna be worth it.",
  ],
  in_process: [
    'Look at you out here doing the dang thing.',
    "Love that you have vision. Now let's make it your reality!",
    'This is how goals go from stepping stones to milestones.',
    'One step still counts. Did you take one today?',
  ],
  making_progress: [
    'Your future self is so gonna thank you for sticking to this goal.',
    "You won't regret keeping the promise you made to yourself.",
    'Look at you go with your goal-getter self.',
    'This is progress. Be proud of that!',
  ],
  almost_there: [
    'OOoooey! SO CLOSE!',
    'Home stretch, baby! LET’S GO! 🔥',
    'Looks like the countdown is ON!',
    'Look at you go with your goal-getter self! 🫰🏼',
  ],
  crushed_it: [
    "You did it! You feelin' perky or what?!",
    'Time to plan a little celebration!',
    'Way to go! Make sure you treat yourself to some downtime or fun time. You earned it!',
    'You locked in and now you get to save this win!',
    'Look at you go, Champ! 👊🏼',
  ],
};

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Pick a check-in message for a vision_goal entry.
 * Selection is deterministic per entry per day so it doesn't
 * change on every render but rotates daily.
 */
export function getCheckInMessage(entry) {
  const stage = entry.progress_stage || 'looking_ahead';
  const messages = STAGE_MESSAGES[stage] || STAGE_MESSAGES.looking_ahead;
  const seed = hashString((entry.id || '') + new Date().toDateString());
  return messages[seed % messages.length];
}

/**
 * Sort vision_goal entries by target_date with nearest upcoming first.
 * Entries without a target_date sink to the bottom.
 * crushed_it entries are excluded (they should have been moved to Life Wins).
 */
export function sortByTargetDate(entries) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return entries
    .filter(e => e.progress_stage !== 'crushed_it')
    .sort((a, b) => {
      const ad = a.target_date ? new Date(a.target_date) : null;
      const bd = b.target_date ? new Date(b.target_date) : null;

      // No target date → bottom
      if (!ad && !bd) return 0;
      if (!ad) return 1;
      if (!bd) return -1;

      ad.setHours(0, 0, 0, 0);
      bd.setHours(0, 0, 0, 0);

      // Both in the future → nearest first
      // Both in the past → most recent first (closest to today)
      // One past, one future → future first
      const aFuture = ad >= today;
      const bFuture = bd >= today;
      if (aFuture && !bFuture) return -1;
      if (!aFuture && bFuture) return 1;

      return ad - bd;
    });
}