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

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning, Sunshine.', session: 'morning' };
  if (hour < 17) return { text: 'The future is bright.', session: 'midday' };
  return { text: 'Look how far you\'ve come.', session: 'evening' };
}

export function getFilteredCategories(christianEnabled) {
  if (christianEnabled) return CATEGORIES;
  return CATEGORIES.filter(c => !c.requiresChristian);
}

export function getFilteredEntryTypes(christianEnabled) {
  if (christianEnabled) return ENTRY_TYPES;
  return ENTRY_TYPES.filter(t => !t.requiresChristian);
}