/**
 * CANONICAL CONTENT TYPE SCHEMA REGISTRY
 * Single source of truth for all entry/content types across:
 * - Add entry form
 * - Edit entry form
 * - Save/create/update serialization
 * - Dashboard tile rendering
 * - Social graphic export
 */

export const CONTENT_SCHEMA = {
  experience: {
    label: 'Micro-Story',
    slug: 'experience',
    allowPhoto: true,
    requiresChristian: false,
    color: '#F2584D',
    descriptor: 'Something you saw or experienced cracked you up, caught you by surprise, or just hit you in all the right ways. Let\'s capture that story.',
    fields: {
      body:     { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'What happened?',      placeholder: 'Tell the story...' },
      location: { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Location',            placeholder: 'e.g. Yosemite, our kitchen', optional: true },
      date:     { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Date',                optional: true },
      photo:    { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Photo',               optional: true },
      category: { show: { form: true,  edit: true,  tile: false, social: false } },
    },
  },
  blessing: {
    label: 'Blessing',
    slug: 'blessing',
    allowPhoto: true,
    requiresChristian: false,
    color: '#FF8559',
    descriptor: 'What was something good that came your way? Name it.',
    fields: {
      body:     { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Describe the blessing', placeholder: 'What are you grateful for?' },
      date:     { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Date',                  optional: true },
      photo:    { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Photo',                 optional: true },
      category: { show: { form: true,  edit: true,  tile: false, social: false } },
    },
  },
  life_win: {
    label: 'Life Win',
    slug: 'life_win',
    allowPhoto: true,
    requiresChristian: false,
    color: '#FFAD09',
    descriptor: 'Be it a goal hit, a habit kept, a fear faced, your wins deserve to be celebrated.',
    fields: {
      body:     { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'What was the win?', placeholder: 'Describe your win...' },
      date:     { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Date',              optional: true },
      photo:    { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Photo',             optional: true },
      category: { show: { form: true,  edit: true,  tile: false, social: false } },
    },
  },
  affirmation: {
    label: 'Affirmation',
    slug: 'affirmation',
    allowPhoto: false,
    requiresChristian: false,
    color: '#219EBC',
    descriptor: 'Choose what you\'re going to believe about yourself today. Say it with your chest.',
    fields: {
      body:     { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Affirmation', placeholder: 'I am...' },
      category: { show: { form: true,  edit: true,  tile: false, social: false } },
    },
  },
  quote: {
    label: 'Quote',
    slug: 'quote',
    allowPhoto: false,
    requiresChristian: false,
    color: '#8ECAE6',
    descriptor: 'Someone said it and you needed to hear it. Let\'s hold onto that.',
    fields: {
      body:     { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Quote',  placeholder: 'The quote text...' },
      author:   { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Author', placeholder: 'Who said it?', optional: true },
      category: { show: { form: true,  edit: true,  tile: false, social: false } },
    },
  },

  identity_swap: {
    label: 'Identity Upgrade',
    slug: 'identity_swap',
    allowPhoto: false,
    requiresChristian: false,
    color: '#5C3B8F',
    descriptor: 'Who are you? Who will you choose to be?',
    fields: {
      old_belief: { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'My Old Lie-dentity', placeholder: 'I used to believe that I...' },
      body:       { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'My True Identity',   placeholder: 'The truth is, I am...' },
      category:   { show: { form: true,  edit: true,  tile: false, social: false } },
    },
  },
  reflection: {
    label: 'Reflection',
    slug: 'reflection',
    allowPhoto: false,
    requiresChristian: false,
    color: '#BA1650',
    descriptor: 'Growth lives in the pause. Take a brief moment to process, then drop your straightest answer here.',
    fields: {
      title:    { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Reflection prompt', placeholder: 'What question are you sitting with?' },
      body:     { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Your answer',        placeholder: 'Write your honest answer...' },
      category: { show: { form: true,  edit: true,  tile: false, social: false } },
    },
  },
  scripture: {
    label: 'Scripture',
    slug: 'scripture',
    allowPhoto: false,
    requiresChristian: true,
    color: '#006D5B',
    descriptor: 'Drop the verse that\'s speaking to you right now so we can add it to your daily dose.',
    fields: {
      body:      { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Scripture',  placeholder: 'The scripture text...' },
      reference: { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Reference',  placeholder: 'e.g. Jeremiah 29:11 NIV', optional: true },
      category:  { show: { form: true,  edit: true,  tile: false, social: false } },
    },
  },
  power_up: {
    label: 'Power-Up',
    slug: 'power_up',
    allowPhoto: false,
    requiresChristian: false,
    color: '#F98426',
    descriptor: 'A curated collection of wisdom, encouragement, and insight. These are here to help you power up your day and level up your life.',
    fields: {
      body:     { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Power-Up', placeholder: 'The insight...' },
      author:   { show: { form: true,  edit: true,  tile: true,  social: true  }, label: 'Author',   placeholder: 'Who shared this?', optional: true },
      category: { show: { form: true,  edit: true,  tile: false, social: false } },
    },
  },
};

/** Get schema for a single entry type */
export function getSchema(entryType) {
  // Legacy slug mapping
  if (entryType === 'accomplishment' || entryType === 'milestone') return CONTENT_SCHEMA['life_win'];
  if (entryType === 'encouragement_note') return CONTENT_SCHEMA['power_up'];
  if (entryType === 'personal_note') return CONTENT_SCHEMA['power_up'];
  return CONTENT_SCHEMA[entryType] || null;
}

/** Get all entry types as array, optionally filtered by christianEnabled */
export function getSchemaEntryTypes(christianEnabled = true) {
  return Object.values(CONTENT_SCHEMA).filter(s => christianEnabled || !s.requiresChristian);
}

/** Build a blank form state for a given entry type */
export function buildEmptyForm(entryType) {
  const schema = getSchema(entryType);
  if (!schema) return { body: '', category: '' };
  const form = { category: '' };
  const fieldKeys = Object.keys(schema.fields);
  fieldKeys.forEach(f => {
    if (f === 'date') form.entry_date = '';
    else if (f === 'photo') form.photo_url = '';
    else form[f] = '';
  });
  return form;
}

/** Build a form state pre-populated from an existing entry record */
export function buildFormFromEntry(entry) {
  const schema = getSchema(entry.entry_type);
  if (!schema) return { body: entry.body || '', category: entry.category || '' };
  const form = { category: entry.category || '' };
  const fieldKeys = Object.keys(schema.fields);
  fieldKeys.forEach(f => {
    if (f === 'date') form.entry_date = entry.entry_date || '';
    else if (f === 'photo') form.photo_url = entry.photo_url || '';
    else if (f === 'reference') form.reference = entry.reference || entry.title || ''; // migrate old title→reference
    else if (f === 'author') form.author = entry.author || entry.title || ''; // migrate old title→author
    else form[f] = entry[f] || '';
  });
  return form;
}

/** Serialize form state into a canonical save payload */
export function serializeEntry(entryType, form) {
  const schema = getSchema(entryType);
  if (!schema) return { entry_type: entryType, body: form.body, category: form.category };

  const payload = { entry_type: entryType, category: form.category };
  const fieldKeys = Object.keys(schema.fields);
  fieldKeys.forEach(f => {
    if (f === 'category') return; // already added
    if (f === 'date') { if (form.entry_date) payload.entry_date = form.entry_date; }
    else if (f === 'photo') { if (form.photo_url) payload.photo_url = form.photo_url; }
    else if (form[f] !== undefined && form[f] !== '') payload[f] = form[f];
  });

  // For reflections, title stores the prompt — preserve it.
  // For all other types, title is never used as a surrogate.
  if (entryType !== 'reflection') payload.title = null;
  return payload;
}

/** Check if a field is shown for a given surface */
export function fieldVisible(entryType, fieldKey, surface) {
  const schema = getSchema(entryType);
  if (!schema) return false;
  return schema.fields[fieldKey]?.show?.[surface] === true;
}

/**
 * "Power Ups" display label rule:
 * When type === 'quote' AND category === 'strong_body' (Healthy Body),
 * render label as "Power Ups" everywhere a type label appears.
 * The underlying content type field stays as 'quote' in the data.
 */
export function getDisplayLabel(entryType, category) {
  const normalized = entryType || '';
  const legacy = normalized === 'accomplishment' || normalized === 'milestone' ? 'life_win'
    : (normalized === 'encouragement_note' || normalized === 'personal_note') ? 'power_up'
    : normalized;
  if (legacy === 'quote' && category === 'strong_body') return 'Power Ups';
  return getSchema(legacy)?.label || legacy;
}