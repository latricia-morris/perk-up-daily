/**
 * STORAGE LIMITS — single source of truth
 * soft: show warning, allow typing up to hard
 * hard: block further input
 */
export const STORAGE_LIMITS = {
  // body limits by entry type
  affirmation_body:    { soft: 300,  hard: 500  },
  quote_body:          { soft: 500,  hard: 900  },
  scripture_body:      { soft: 900,  hard: 1500 },
  experience_body:     { soft: 900,  hard: 2000 },
  blessing_body:       { soft: 900,  hard: 2000 },
  life_win_body:       { soft: 900,  hard: 2000 },
  personal_note_body:  { soft: 900,  hard: 2000 },
  identity_swap_body:  { soft: 500,  hard: 900  },
  // special fields
  identity_swap_old_belief: { soft: 300, hard: 500 },
  quote_author:             { soft: 100, hard: 160 },
  scripture_reference:      { soft: 100, hard: 160 },
  location:                 { soft: 100, hard: 160 },
};

/** Resolve the limit key for a given entry type + field */
export function getLimitKey(entryType, fieldKey) {
  if (fieldKey === 'old_belief') return 'identity_swap_old_belief';
  if (fieldKey === 'author')    return 'quote_author';
  if (fieldKey === 'reference') return 'scripture_reference';
  if (fieldKey === 'location')  return 'location';
  return `${entryType}_body`;
}

/** Get the limit object {soft, hard} for a type+field. Falls back to body default. */
export function getLimit(entryType, fieldKey) {
  const key = getLimitKey(entryType, fieldKey);
  return STORAGE_LIMITS[key] || { soft: 900, hard: 2000 };
}

/** Enforce hard limit on a string */
export function enforceHardLimit(value, limit) {
  return value.slice(0, limit.hard);
}