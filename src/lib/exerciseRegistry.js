/**
 * Neural Training Exercise Registry
 * Central source of truth for all exercise definitions and Reset sequences.
 * Each exercise has a `categories` array so it can appear in multiple Neural Training tabs.
 */

export const EXERCISE_TYPES = [
  { slug: 'breathing', label: 'Breathing', description: 'Guided breathing for calm, focus, and nervous-system regulation.' },
  { slug: 'perspective', label: 'Mindset Training', description: 'Question-based prompts to intentionally choose healthier thought patterns.' },
  { slug: 'cognitive_drill', label: 'Cognitive Drills', description: 'Structured brain-training drills for attention, memory, and mental flexibility.' },
  { slug: 'reframing', label: 'Reframing', description: 'Choose how you\'re going to view a thing — catch, check, and redirect thought patterns.' },
];

export const BREATHING_EXERCISES = [
  { id: 'breathe', title: 'Breathe', description: 'A steady ocean-wave rhythm to settle the body.', route: '/exercises/breathe', rhythm: '5 · 5 wave', accent: '#5C3B8F', categories: ['breathing'] },
  { id: 'box-breath', title: 'Box Breath', description: 'The 4-4-4-4 steady rhythm for focus and control.', route: '/exercises/box-breath', rhythm: '4 · 4 · 4 · 4 box', accent: '#FFAD09', categories: ['breathing'] },
  { id: 'focus', title: 'Focus', description: 'An even box breath for clear, composed attention.', route: '/exercises/focus', rhythm: '4 · 4 · 4 · 4 box', accent: '#F95826', categories: ['breathing'] },
  { id: 'sigh', title: 'Sigh', description: 'The double-inhale physiological sigh for rapid reset.', route: '/exercises/sigh', rhythm: '4.5 · 1 · 8 sigh', accent: '#219EBC', categories: ['breathing'] },
  { id: 'smile', title: 'Smile', description: 'A comforting 4-7-8 breath that softens the whole body.', route: '/exercises/smile', rhythm: '4 · 7 · 8', accent: '#BA1650', categories: ['breathing'] },
];

export const COGNITIVE_DRILLS = [
  { id: 'rewire-in-60', title: 'Rewire in 60', description: 'A 60-second tap-only micro-game that reinforces a brain-affirming statement 5 times.', route: '/exercises/rewire-in-60', rhythm: '60 sec · 5 rounds', accent: '#FFAD09', categories: ['cognitive_drill'] },
  { id: 'instinct-vs-insight', title: 'Instinct vs Insight', description: 'Notice the gap between your fast reaction and your slower, deliberate judgment.', route: '/exercises/instinct-vs-insight', rhythm: '~60 sec · 5 scenarios', accent: '#F95826', categories: ['cognitive_drill'] },
  { id: 'neurocycle', title: 'Neurocycle', description: 'A 5-step cycle to gather, reflect, capture, reframe, and act on a thought pattern.', route: '/exercises/neurocycle', rhythm: '~3 min · 5 steps', accent: '#5C3B8F', categories: ['cognitive_drill', 'reframing'] },
  { id: 'intention-timer', title: 'Intention Timer', description: 'Set a single intention, then hold your focus on it with a timed countdown.', route: '/exercises/intention-timer', rhythm: '1–5 min · 4 steps', accent: '#219EBC', categories: ['cognitive_drill'] },
  { id: 'impact-prioritization', title: 'Impact Prioritization', description: 'Brain dump, sort into Important / Urgent / Extra, and pick your top 3 for today.', route: '/exercises/impact-prioritization', rhythm: '~3 min · 5 steps', accent: '#219EBC', categories: ['cognitive_drill'] },
  { id: 'rumination-interrupt', title: 'Rumination Interrupt', description: 'Catch a looping thought and redirect — toward action, or toward letting it rest.', route: '/exercises/rumination-interrupt', rhythm: '~2 min · branching', accent: '#5C3B8F', categories: ['cognitive_drill', 'reframing'] },
  { id: 'worry-blocks', title: 'Worry-Blocks', description: 'Give a pulling thought full, undistracted attention for a set window — then set it down.', route: '/exercises/worry-blocks', rhythm: '5–10 min · 4 steps', accent: '#F95826', categories: ['cognitive_drill', 'reframing'] },
  { id: 'evidence-check', title: 'Evidence-Check Drill', description: 'Check a thought against real evidence — both its accuracy and the space it deserves.', route: '/exercises/evidence-check', rhythm: '~3 min · 6 steps', accent: '#FFAD09', categories: ['cognitive_drill', 'reframing'] },
  { id: 'task-initiation', title: 'Task Initiation', description: 'Name the task you\'re avoiding, shrink it to one tiny move, and commit to 5 powerhouse minutes.', route: '/exercises/task-initiation', rhythm: '5+ min · looping', accent: '#FFAD09', categories: ['cognitive_drill'] },
  { id: 'time-blocking', title: 'Time Blocking', description: 'Dump everything, slot it into morning / afternoon / evening / gap, and shape your day.', route: '/exercises/time-blocking', rhythm: '~3 min · 5 steps', accent: '#219EBC', categories: ['cognitive_drill'] },
  { id: 'focus-reset', title: 'Focus Reset', description: 'Pick one thing, set a timer, and give it your full attention — then check in on how it went.', route: '/exercises/focus-reset', rhythm: '15–45 min · 5 steps', accent: '#5C3B8F', categories: ['cognitive_drill'] },
  { id: 'grounding', title: 'Grounding Reset', description: 'A stillness beat, one task, full presence — for when your mind feels scattered.', route: '/exercises/grounding', rhythm: '~2 min · 4 steps', accent: '#BA1650', categories: ['cognitive_drill'] },
  { id: 'sensory-grounding', title: '5-4-3-2-1 Grounding', description: 'Use your senses to come back to the present — 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.', route: '/exercises/sensory-grounding', rhythm: '~2 min · 5 senses', accent: '#219EBC', categories: ['cognitive_drill'] },
];

export const ALL_STATIC_EXERCISES = [...BREATHING_EXERCISES, ...COGNITIVE_DRILLS];

export const RESET_OPTIONS = [
  { id: 'chill', label: 'Chill', description: 'Settle your nervous system', accent: '#5C3B8F', flow: '/exercises/chill-reset' },
  { id: 'focus', label: 'Focus', description: 'Sharpen your attention', accent: '#F95826', sequence: ['/exercises/box-breath', '/exercises/focus'] },
  { id: 'smile', label: 'Smile', description: 'Soften and find comfort', accent: '#BA1650', flow: '/exercises/smile-reset' },
  { id: 'energize', label: 'Energize', description: 'Invigorate and wake up', accent: '#FFAD09', flow: '/exercises/energize-reset' },
  { id: 'recalibrate', label: 'Recalibrate', description: 'Quick physiological reset', accent: '#219EBC', flow: '/exercises/recalibrate-reset' },
  { id: 'wind-down', label: 'Wind Down', description: 'Prepare for deep rest', accent: '#8ECAE6', flow: '/exercises/wind-down-reset' },
];