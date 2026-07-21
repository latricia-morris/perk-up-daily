/**
 * Energize Reset — Movement & Transition Banks
 * Source: Handoff-ready written copy.
 * Architecture: 3 body segments, pick one from each per session, in order.
 */

export const ENERGIZE_OPENERS = [
  "Let's wake things up.",
  "Time to come online.",
  "Let's get some life moving.",
  "Wake the system up.",
];

export const ENERGIZE_BREATH_INTRO = [
  "Get tall. Breathe with me. Quick in. Hold. Quick out. Hold.",
];

export const BREATH_TO_BODY_TRANSITIONS = [
  "Good. Keep that energy moving.",
  "There you go. Now bring it into the body.",
  "Good. Don't stop there.",
  "Alright. Let's move that through.",
  "Good. Now wake up the rest of you.",
  "There you go. Bring the body with you.",
  "Nice. Now move like you mean it.",
  "Good. Let's carry that into your posture.",
];

export const MOVEMENT_SEGMENT_1 = [
  "Roll your shoulders back.",
  "Pull your shoulders back.",
  "Drop your shoulders down.",
  "Sit taller.",
  "Stand taller.",
  "Straighten your back.",
  "Lift your chest.",
  "Open your chest.",
  "Pull your chest up.",
  "Stretch up taller.",
  "Push your shoulders down and back.",
  "Stop slouching.",
  "Open up through the front of your body.",
  "Bring your shoulders into place.",
  "Make your posture taller.",
  "Bring your chest up and open.",
  "Sit up like you're awake.",
  "Stand up like you're ready.",
];

export const MOVEMENT_SEGMENT_2 = [
  "Shake your hands out.",
  "Shake your arms out.",
  "Loosen your wrists.",
  "Move your fingers.",
  "Open and close your hands.",
  "Give your arms a quick shake.",
  "Swing your arms once.",
  "Roll your shoulders once more.",
  "Tap your fingers fast.",
  "Squeeze your hands, then release.",
  "Step in place twice.",
  "Take two quick steps.",
  "Press your feet into the floor.",
  "Push up through your legs.",
  "Wake your hands up.",
  "Get some motion into your arms.",
  "Move your shoulders once more.",
  "Give your body a quick shake.",
];

export const MOVEMENT_SEGMENT_3 = [
  "Lift your head up.",
  "Face forward.",
  "Look straight ahead.",
  "Plant your feet.",
  "Set your stance.",
  "Stand like you're ready.",
  "Hold that posture.",
  "Stay right there.",
  "Keep your chest up.",
  "Keep your head up.",
  "Put both feet under you.",
  "Stand still for a beat.",
  "Settle into that stance.",
  "Hold that position.",
  "Stay tall.",
  "Keep that shape.",
  "Square yourself up.",
  "Lock that in.",
];

export const SEGMENT_TRANSITIONS_1_TO_2 = ["Good.", "Nice.", "There you go.", "Keep it moving."];
export const SEGMENT_TRANSITIONS_2_TO_3 = ["Good.", "Set it.", "Now hold that.", "There it is."];

export const MOVEMENT_TO_THOUGHT_TRANSITIONS = [
  "Good. Now point that somewhere.",
  "There you go. Put that energy on something.",
  "Good. Let's aim it.",
  "Alright. What's it for?",
  "Good. Now bring intention into it.",
  "There you go. Give it a direction.",
  "Good. Point that toward the day.",
  "Nice. Now put that charge somewhere useful.",
];

export const CHARGED_THOUGHTS = [
  "What are you most excited to build today?",
  "In what ways will your future self thank you for how you show up today?",
  "Who are you most excited to sow into today?",
  "What part of today deserves your fire?",
  "What gets your best energy today?",
];

export const CHARGED_CLOSES = [
  "There you go!",
  "Yes. That's it.",
  "Good. Go use it.",
  "Bring that into the day.",
  "There it is. Move with it.",
  "Good. Carry that forward.",
  "That's your edge.",
  "Keep that charge on.",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function buildEnergizeSession() {
  return {
    opener: pick(ENERGIZE_OPENERS),
    breathIntro: ENERGIZE_BREATH_INTRO[0],
    breathToBody: pick(BREATH_TO_BODY_TRANSITIONS),
    movement1: pick(MOVEMENT_SEGMENT_1),
    transition1to2: pick(SEGMENT_TRANSITIONS_1_TO_2),
    movement2: pick(MOVEMENT_SEGMENT_2),
    transition2to3: pick(SEGMENT_TRANSITIONS_2_TO_3),
    movement3: pick(MOVEMENT_SEGMENT_3),
    thoughtTransition: pick(MOVEMENT_TO_THOUGHT_TRANSITIONS),
    chargedThought: pick(CHARGED_THOUGHTS),
    chargedClose: pick(CHARGED_CLOSES),
  };
}