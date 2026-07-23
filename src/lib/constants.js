export const CATEGORIES = [
  { slug: 'deep_faith', label: 'Deep Faith', emoji: '✝️', color: '#5C3B8F', requiresChristian: true },
  { slug: 'rich_relationships', label: 'Rich Relationships', emoji: '💛', color: '#BA1650' },
  { slug: 'strong_body', label: 'Strong Body', emoji: '💪', color: '#F95826' },
  { slug: 'clear_mind', label: 'Healthy Mind', emoji: '🧠', color: '#219EBC' },
  { slug: 'strong_business', label: 'Legacy Business', emoji: '🚀', color: '#FFAD09' },
  { slug: 'sound_money', label: 'Financial Freedom', emoji: '💰', color: '#006D5B' },
];

// ENTRY_TYPES is kept for legacy callers. The canonical source is lib/contentSchema.js
export const ENTRY_TYPES = [
  { slug: 'experience', label: 'Micro-Story', allowPhoto: true },
  { slug: 'blessing', label: 'Blessing', allowPhoto: true },
  { slug: 'life_win', label: 'Life Win', allowPhoto: true },
  { slug: 'affirmation', label: 'Affirmation', allowPhoto: false },
  { slug: 'power_up', label: 'Power-Up', allowPhoto: false },
  { slug: 'identity_swap', label: 'Identity Upgrade', allowPhoto: false },
  { slug: 'scripture', label: 'Scripture', requiresChristian: true, allowPhoto: false },
  { slug: 'vision_goal', label: 'Vision & Goals', allowPhoto: true },
];

export const CONTENT_TYPES = [
  { slug: 'power_up', label: 'Power-Up' },
  { slug: 'affirmation', label: 'Affirmation' },
  { slug: 'scripture', label: 'Scripture', requiresChristian: true },
];

export function getCategoryLabel(slug) {
  return CATEGORIES.find(c => c.slug === slug)?.label || slug;
}

export function getEntryTypeLabel(slug) {
  // Legacy slug support — 'quote' is now 'power_up'
  if (slug === 'accomplishment' || slug === 'milestone') return 'Life Win';
  if (slug === 'quote') return 'Power-Up';
  return ENTRY_TYPES.find(t => t.slug === slug)?.label || slug;
}

export function isIdentitySwap(entry) {
  return entry?.entry_type === 'identity_swap';
}

export function getContentTypeLabel(slug) {
  if (slug === 'quote') return 'Power-Up';
  return CONTENT_TYPES.find(t => t.slug === slug)?.label || slug;
}

const GREETING_BANK = [
  { greeting_text: 'Hello, Sunshine!', time_of_day: 'morning' },
  { greeting_text: 'Top of the morning to you.', time_of_day: 'morning' },
  { greeting_text: 'Good morning, Goal Getter.', time_of_day: 'morning' },
  { greeting_text: 'Morning, Bright One.', time_of_day: 'morning' },
  { greeting_text: 'Rise and shine, Rockstar.', time_of_day: 'morning' },
  { greeting_text: 'Good morning, Big Dreamer.', time_of_day: 'morning' },
  { greeting_text: 'Morning, Dream Chaser.', time_of_day: 'morning' },
  { greeting_text: 'Hey there, Early Bird.', time_of_day: 'morning' },
  { greeting_text: 'Good morning, Go-Getter.', time_of_day: 'morning' },
  { greeting_text: 'Morning, Light Bringer.', time_of_day: 'morning' },
  { greeting_text: 'Hello, Fresh Start.', time_of_day: 'morning' },
  { greeting_text: 'Good morning, Momentum Maker.', time_of_day: 'morning' },
  { greeting_text: 'Morning, Joy Bringer.', time_of_day: 'morning' },
  { greeting_text: 'Hello, New Day.', time_of_day: 'morning' },
  { greeting_text: 'Morning, Ready for More.', time_of_day: 'morning' },
  { greeting_text: 'Good morning, Still Showing Up.', time_of_day: 'morning' },
  { greeting_text: 'Morning, Built for This.', time_of_day: 'morning' },
  { greeting_text: 'Hello, New Chapter.', time_of_day: 'morning' },
  { greeting_text: 'Good morning, Small Steps Legend.', time_of_day: 'morning' },
  { greeting_text: 'Morning, Let\u2019s Do Some Good.', time_of_day: 'morning' },
  { greeting_text: 'Good morning, Trailblazer.', time_of_day: 'morning' },
  { greeting_text: 'Morning, Bright Start.', time_of_day: 'morning' },
  { greeting_text: 'Hello, Day Maker.', time_of_day: 'morning' },
  { greeting_text: 'Good morning, Change Bringer.', time_of_day: 'morning' },
  { greeting_text: 'Morning, Momentum in Motion.', time_of_day: 'morning' },
  { greeting_text: 'Hello, Fresh Energy.', time_of_day: 'morning' },
  { greeting_text: 'Good morning, Faithful One.', time_of_day: 'morning' },
  { greeting_text: 'Morning, Built for Big Things.', time_of_day: 'morning' },
  { greeting_text: 'Hello, Hope in Motion.', time_of_day: 'morning' },
  { greeting_text: 'Good morning, Brave Heart.', time_of_day: 'morning' },
  { greeting_text: 'Morning, Ready to Build.', time_of_day: 'morning' },
  { greeting_text: 'Hello, New Chances.', time_of_day: 'morning' },
  { greeting_text: 'Good morning, Light in the Room.', time_of_day: 'morning' },
  { greeting_text: 'Morning, Quiet Strength.', time_of_day: 'morning' },
  { greeting_text: 'Hello, Joy in Progress.', time_of_day: 'morning' },
  { greeting_text: 'Good morning, Everyday Hero.', time_of_day: 'morning' },
  { greeting_text: 'Morning, Purpose in Motion.', time_of_day: 'morning' },
  { greeting_text: 'Hello, New Mercy Morning.', time_of_day: 'morning' },
  { greeting_text: 'Good morning, One Step at a Time.', time_of_day: 'morning' },
  { greeting_text: 'Morning, You\u2019ve Got Good Ahead.', time_of_day: 'morning' },
  { greeting_text: 'Welcome back, Goal Getter.', time_of_day: 'midday' },
  { greeting_text: 'Hey, Sunshine\u2014still shining.', time_of_day: 'midday' },
  { greeting_text: 'Hello again, Bright One.', time_of_day: 'midday' },
  { greeting_text: 'Midday, still moving.', time_of_day: 'midday' },
  { greeting_text: 'Hey there, Dream Chaser.', time_of_day: 'midday' },
  { greeting_text: 'Good afternoon, Go-Getter.', time_of_day: 'midday' },
  { greeting_text: 'Back again\u2014love to see it.', time_of_day: 'midday' },
  { greeting_text: 'Midday check-in, Champ.', time_of_day: 'midday' },
  { greeting_text: 'Hello, Second-Wind Hero.', time_of_day: 'midday' },
  { greeting_text: 'Hey, still here and still strong.', time_of_day: 'midday' },
  { greeting_text: 'Good afternoon, Big Dreamer.', time_of_day: 'midday' },
  { greeting_text: 'Midday, Joy Bringer.', time_of_day: 'midday' },
  { greeting_text: 'Hey there, Momentum Maker.', time_of_day: 'midday' },
  { greeting_text: 'Look at you, still showing up.', time_of_day: 'midday' },
  { greeting_text: 'Midday, Let\u2019s Add a Win.', time_of_day: 'midday' },
  { greeting_text: 'Hello, reset button in human form.', time_of_day: 'midday' },
  { greeting_text: 'Hey, another lap around the sun.', time_of_day: 'midday' },
  { greeting_text: 'Midday, we meet again.', time_of_day: 'midday' },
  { greeting_text: 'Hello, break-time legend.', time_of_day: 'midday' },
  { greeting_text: 'Good afternoon, built for the long game.', time_of_day: 'midday' },
  { greeting_text: 'Midday, still in the game.', time_of_day: 'midday' },
  { greeting_text: 'Hey, steady and strong.', time_of_day: 'midday' },
  { greeting_text: 'Hello, midday spark.', time_of_day: 'midday' },
  { greeting_text: 'Good afternoon, quiet powerhouse.', time_of_day: 'midday' },
  { greeting_text: 'Midday, you\u2019re doing more than you think.', time_of_day: 'midday' },
  { greeting_text: 'Hey, stamina in human form.', time_of_day: 'midday' },
  { greeting_text: 'Hello again, everyday hero.', time_of_day: 'midday' },
  { greeting_text: 'Midday, small wins count.', time_of_day: 'midday' },
  { greeting_text: 'Good afternoon, progress maker.', time_of_day: 'midday' },
  { greeting_text: 'Hey, you keep showing up.', time_of_day: 'midday' },
  { greeting_text: 'Hello, mid-shift legend.', time_of_day: 'midday' },
  { greeting_text: 'Midday, you\u2019re still on track.', time_of_day: 'midday' },
  { greeting_text: 'Good afternoon, heart in the work.', time_of_day: 'midday' },
  { greeting_text: 'Hey, you\u2019re building something real.', time_of_day: 'midday' },
  { greeting_text: 'Hello, effort that matters.', time_of_day: 'midday' },
  { greeting_text: 'Midday, you\u2019re stronger than you feel.', time_of_day: 'midday' },
  { greeting_text: 'Good afternoon, still becoming.', time_of_day: 'midday' },
  { greeting_text: 'Hey, you\u2019re writing a good story today.', time_of_day: 'midday' },
  { greeting_text: 'Hello again, bright steady soul.', time_of_day: 'midday' },
  { greeting_text: 'Midday, you\u2019re allowed to feel proud.', time_of_day: 'midday' },
  { greeting_text: 'Good evening, Sunshine.', time_of_day: 'evening' },
  { greeting_text: 'Evening, Bright One.', time_of_day: 'evening' },
  { greeting_text: 'Hey, you made it through today.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, Joy Bringer.', time_of_day: 'evening' },
  { greeting_text: 'Evening, time to exhale.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, one step closer.', time_of_day: 'evening' },
  { greeting_text: 'Evening, you did something good today.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, heart that showed up.', time_of_day: 'evening' },
  { greeting_text: 'Evening, your effort counts.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, still becoming.', time_of_day: 'evening' },
  { greeting_text: 'Evening, it\u2019s okay to rest now.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, you kept going.', time_of_day: 'evening' },
  { greeting_text: 'Evening, today added up more than you know.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, you did your part.', time_of_day: 'evening' },
  { greeting_text: 'Evening, today doesn\u2019t have to be perfect to be good.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, time to let the day land.', time_of_day: 'evening' },
  { greeting_text: 'Evening, you earned this moment.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, Quiet Strength.', time_of_day: 'evening' },
  { greeting_text: 'Evening, the day is done. You can set it down.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, you showed up and that matters.', time_of_day: 'evening' },
  { greeting_text: 'Evening, a good day doesn\u2019t have to be a big day.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, Momentum Maker.', time_of_day: 'evening' },
  { greeting_text: 'Evening, small steps got you here.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, you\u2019re building something good.', time_of_day: 'evening' },
  { greeting_text: 'Evening, rest is productive too.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, Tomorrow Starter.', time_of_day: 'evening' },
  { greeting_text: 'Evening, you get to start fresh tomorrow.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, Day Maker.', time_of_day: 'evening' },
  { greeting_text: 'Evening, the good parts count too.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, you stayed in it.', time_of_day: 'evening' },
  { greeting_text: 'Evening, let the good sink in.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, Purpose in Motion.', time_of_day: 'evening' },
  { greeting_text: 'Evening, you planted good seeds today.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, the work you did matters.', time_of_day: 'evening' },
  { greeting_text: 'Evening, be proud of showing up.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, the rest is yours now.', time_of_day: 'evening' },
  { greeting_text: 'Evening, you\u2019re doing better than you think.', time_of_day: 'evening' },
  { greeting_text: 'Good evening, Faithful One.', time_of_day: 'evening' },
];

export function getGreeting() {
  const hour = new Date().getHours();
  let session;
  if (hour < 12) session = 'morning';
  else if (hour < 17) session = 'midday';
  else session = 'evening';
  const pool = GREETING_BANK.filter(g => g.time_of_day === session);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { text: pick.greeting_text, session };
}

export function getFilteredCategories(christianEnabled) {
  if (christianEnabled) return CATEGORIES;
  return CATEGORIES.filter(c => !c.requiresChristian);
}

export function getFilteredEntryTypes(christianEnabled) {
  if (christianEnabled) return ENTRY_TYPES;
  return ENTRY_TYPES.filter(t => !t.requiresChristian);
}