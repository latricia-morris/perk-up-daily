export const CATEGORIES = [
  { slug: 'deep_faith', label: 'Deep Faith', emoji: '✝️', requiresChristian: true },
  { slug: 'rich_relationships', label: 'Rich Relationships', emoji: '💛' },
  { slug: 'strong_body', label: 'Strong Body', emoji: '💪' },
  { slug: 'clear_mind', label: 'Clear Mind', emoji: '🧠' },
  { slug: 'strong_business', label: 'Strong Business', emoji: '🚀' },
  { slug: 'sound_money', label: 'Sound Money', emoji: '💰' },
];

export const ENTRY_TYPES = [
  { slug: 'experience', label: 'Experience / Memory', allowPhoto: true },
  { slug: 'blessing', label: 'Blessing', allowPhoto: false },
  { slug: 'accomplishment', label: 'Accomplishment', allowPhoto: false },
  { slug: 'milestone', label: 'Milestone', allowPhoto: true },
  { slug: 'affirmation', label: 'Affirmation', allowPhoto: false },
  { slug: 'quote', label: 'Quote', allowPhoto: false },
  { slug: 'personal_note', label: 'Personal Note', allowPhoto: false },
  { slug: 'scripture', label: 'Scripture', requiresChristian: true, allowPhoto: false },
];

export const CONTENT_TYPES = [
  { slug: 'quote', label: 'Quote' },
  { slug: 'affirmation', label: 'Affirmation' },
  { slug: 'scripture', label: 'Scripture', requiresChristian: true },
  { slug: 'encouragement_note', label: 'Encouragement Note' },
];

export function getCategoryLabel(slug) {
  return CATEGORIES.find(c => c.slug === slug)?.label || slug;
}

export function getEntryTypeLabel(slug) {
  return ENTRY_TYPES.find(t => t.slug === slug)?.label || slug;
}

export function getContentTypeLabel(slug) {
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