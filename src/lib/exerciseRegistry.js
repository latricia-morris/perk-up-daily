/**
 * Neural Training Exercise Registry
 * Central source of truth for all exercise definitions and Reset sequences.
 */

export const EXERCISE_TYPES = [
  { slug: 'breathing', label: 'Breathing', description: 'Guided breathing for calm, focus, and nervous-system regulation.' },
  { slug: 'perspective', label: 'Mindset Training', description: 'Question-based prompts to intentionally choose healthier thought patterns.' },
  { slug: 'cognitive_drill', label: 'Cognitive Drills', description: 'Structured brain-training drills for attention, memory, and mental flexibility.' },
  { slug: 'reframing', label: 'Reframing', description: 'Situation-focused reframe flows to reinterpret events in a healthier way.' },
];

export const BREATHING_EXERCISES = [
  {
    id: 'breathe',
    title: 'Breathe',
    description: 'A steady ocean-wave rhythm to settle the body.',
    route: '/exercises/breathe',
    rhythm: '5 · 5 wave',
    accent: '#5C3B8F',
  },
  {
    id: 'box-breath',
    title: 'Box Breath',
    description: 'The 4-4-4-4 steady rhythm for focus and control.',
    route: '/exercises/box-breath',
    rhythm: '4 · 4 · 4 · 4 box',
    accent: '#FFAD09',
  },
  {
    id: 'focus',
    title: 'Focus',
    description: 'An even box breath for clear, composed attention.',
    route: '/exercises/focus',
    rhythm: '4 · 4 · 4 · 4 box',
    accent: '#F95826',
  },
  {
    id: 'sigh',
    title: 'Sigh',
    description: 'The double-inhale physiological sigh for rapid reset.',
    route: '/exercises/sigh',
    rhythm: '4.5 · 1 · 8 sigh',
    accent: '#219EBC',
  },
  {
    id: 'smile',
    title: 'Smile',
    description: 'A comforting 4-7-8 breath that softens the whole body.',
    route: '/exercises/smile',
    rhythm: '4 · 7 · 8',
    accent: '#BA1650',
  },
];

export const COGNITIVE_DRILLS = [
  {
    id: 'rewire-in-60',
    title: 'Rewire in 60',
    description: 'A 60-second tap-only micro-game that reinforces a brain-affirming statement 5 times.',
    route: '/exercises/rewire-in-60',
    rhythm: '60 sec · 5 rounds',
    accent: '#FFAD09',
  },
  {
    id: 'instinct-vs-insight',
    title: 'Instinct vs Insight',
    description: 'Notice the gap between your fast reaction and your slower, deliberate judgment.',
    route: '/exercises/instinct-vs-insight',
    rhythm: '~60 sec · 5 scenarios',
    accent: '#F95826',
  },
  {
    id: 'neurocycle',
    title: 'Neurocycle',
    description: 'A 5-step cycle to gather, reflect, capture, reframe, and act on a thought pattern.',
    route: '/exercises/neurocycle',
    rhythm: '~3 min · 5 steps',
    accent: '#5C3B8F',
  },
];

export const RESET_OPTIONS = [
  {
    id: 'chill',
    label: 'Chill',
    description: 'Settle your nervous system',
    accent: '#5C3B8F',
    sequence: ['/exercises/breathe', '/exercises/sigh'],
  },
  {
    id: 'focus',
    label: 'Focus',
    description: 'Sharpen your attention',
    accent: '#F95826',
    sequence: ['/exercises/box-breath', '/exercises/focus'],
  },
  {
    id: 'smile',
    label: 'Smile',
    description: 'Soften and find comfort',
    accent: '#BA1650',
    sequence: ['/exercises/smile', '/exercises/breathe'],
  },
  {
    id: 'energize',
    label: 'Energize',
    description: 'Invigorate and wake up',
    accent: '#FFAD09',
    sequence: ['/exercises/sigh', '/exercises/box-breath'],
  },
  {
    id: 'recalibrate',
    label: 'Recalibrate',
    description: 'Quick physiological reset',
    accent: '#219EBC',
    sequence: ['/exercises/sigh', '/exercises/breathe'],
  },
  {
    id: 'wind-down',
    label: 'Wind Down',
    description: 'Prepare for deep rest',
    accent: '#8ECAE6',
    sequence: ['/exercises/smile', '/exercises/breathe'],
  },
];