/**
 * Teach-It-Back — Prompt Bank
 * 15 prompt variations tied to exercise type for post-exercise reinforcement.
 */

export const TEACH_IT_BACK_PROMPTS = {
  breathing: [
    "If a friend was overwhelmed right now, how would you explain what you just did to help them?",
    "What did you notice in your body during that — and how would you describe it to someone who's never tried it?",
    "In one sentence, what would you tell someone this exercise is actually for?",
    "How would you explain the difference between how you felt before and after, to someone else?",
    "If you had 10 seconds to convince a skeptical friend to try this, what would you say?",
  ],
  smile_focus: [
    "What would you tell someone who thinks this is 'just a smile' or 'just staring at a dot'?",
    "How would you explain why this small action actually shifts something?",
  ],
  rewire: [
    "What was the statement you reinforced, and why did it matter to hear it again and again?",
    "How would you explain to someone why repeating a belief on purpose actually changes something?",
    "If someone said 'that's just positive thinking,' how would you explain what's actually happening in the brain?",
  ],
  instinct: [
    "What's the difference between your instinct and your insight, in your own words?",
    "How would you explain to someone why pausing before reacting actually matters?",
    "What's one default setting you noticed today, and how would you describe where it might have come from?",
    "If a friend said 'I just am who I am, I can't change how I react' — what would you say back to them?",
  ],
  general: [
    "Explain what you just practiced like you're teaching a friend who's never heard of it.",
  ],
};

export function getPromptForExercise(exerciseType) {
  let category = 'general';
  if (exerciseType === 'breathe' || exerciseType === 'box-breath' || exerciseType === 'sigh') {
    category = 'breathing';
  } else if (exerciseType === 'smile' || exerciseType === 'focus') {
    category = 'smile_focus';
  } else if (exerciseType === 'rewire-in-60') {
    category = 'rewire';
  } else if (exerciseType === 'instinct-vs-insight') {
    category = 'instinct';
  }
  const prompts = TEACH_IT_BACK_PROMPTS[category] || TEACH_IT_BACK_PROMPTS.general;
  return prompts[Math.floor(Math.random() * prompts.length)];
}