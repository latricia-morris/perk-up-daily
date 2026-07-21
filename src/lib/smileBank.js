/**
 * Smile Reset — Facial Mechanics Bank
 * Source: Handoff-ready written copy. Use these lines directly.
 * Rule: Never use mystical, magical, spell, or universalist language.
 */

export const SMILE_SEQUENCES = [
  { opener: "Let's change the look on your face.", cues: ["Raise your right eyebrow.", "Now smirk to the left.", "Hold it."], close: "There you are." },
  { opener: "Come here. We're fixing your expression.", cues: ["Unclench your jaw.", "Give me just the corner of your mouth.", "Now add one eyebrow."], close: "Better." },
  { opener: "Give me ten seconds. We're not keeping that face.", cues: ["Make the most dramatic serious face you can.", "Hold it.", "Now ruin it with a grin."], close: "Yep. That one." },
  { opener: "Let's loosen this up.", cues: ["Lift one brow like you know something.", "Half smile.", "Eyes a little brighter."], close: "There it is." },
  { opener: "We're not wearing that look all day.", cues: ["Purse the lips.", "Let them go.", "Smirk to the right."], close: "That helped." },
  { opener: "Time for a better face.", cues: ["Give me your skeptical eyebrow.", "Now the smile you're trying not to smile.", "Hold it for a beat."], close: "That's more like it." },
  { opener: "Let's put a little life back in the room.", cues: ["Relax your jaw.", "Let the cheeks lift.", "Try a crooked grin."], close: "Good." },
  { opener: "Alright, give me your face for a second.", cues: ["Blink slow.", "Come back with a better look.", "Tiny smirk."], close: "We're back." },
  { opener: "Let's shake the stiffness off.", cues: ["Scrunch the whole face up.", "Release.", "Now give me that \u201Cmmhmm\u201D smile."], close: "Much better." },
  { opener: "We're changing the energy a bit.", cues: ["Raise both brows.", "Drop them slow.", "Now one corner of the mouth."], close: "Nice." },
  { opener: "Hold up. New expression.", cues: ["Make your best poker face.", "Hold it.", "Now let it crack."], close: "Exactly." },
  { opener: "No, no. We're not staying there.", cues: ["Give me a side-eye, but make it playful.", "Now add a smug little smile.", "Hold it."], close: "There we go." },
  { opener: "Let's break the tension a little.", cues: ["Open the eyes a touch wider.", "Soften the mouth.", "Now a half grin."], close: "That'll do." },
  { opener: "Give me a face reset.", cues: ["Drop the jaw.", "Reset.", "Smirk left.", "Hold."], close: "Better face." },
  { opener: "Let's bring some personality back online.", cues: ["Lift one brow.", "Try your \u201CI already know\u201D grin.", "Now brighter eyes."], close: "Yes." },
  { opener: "Alright, wake your face up.", cues: ["Puff the cheeks.", "Let them go.", "Give me a tiny grin."], close: "Back in business." },
  { opener: "New minute. New look.", cues: ["Make the face of someone pretending to be very important.", "Hold it.", "Now ruin it."], close: "That's the one." },
  { opener: "Let's unfreeze this whole thing.", cues: ["Unclench your jaw.", "Raise one eyebrow.", "Now the smile you'd never admit to."], close: "There it is." },
  { opener: "Come on. Give me something better than that.", cues: ["Skeptical eyebrow.", "Crooked grin.", "Hold it for a second."], close: "We've improved things." },
  { opener: "We're freshening the mood.", cues: ["Relax your mouth.", "Lift your cheeks.", "Give me a quiet smile."], close: "Good enough." },
  { opener: "Let's put a little spark back in it.", cues: ["Wide eyes.", "Now amused eyes.", "Now a side smirk."], close: "Now we're talking." },
  { opener: "Time to un-serious this situation.", cues: ["Fake royal portrait face.", "Hold.", "Break it with a grin."], close: "Perfect." },
  { opener: "Let's loosen the jaw, the face, all of it.", cues: ["Jaw loose.", "Lips soft.", "One corner up."], close: "That helped." },
  { opener: "Give me a quick expression switch.", cues: ["Straight face.", "Now \u201Creally?\u201D eyebrow.", "Now tiny grin."], close: "Good." },
  { opener: "Let's not be this stiff.", cues: ["Scrunch the nose and cheeks.", "Release.", "Try a smug half-smile."], close: "Better already." },
  { opener: "We're bringing the charm back.", cues: ["Raise one brow.", "Add a little side-eye.", "Now smile like you know something good."], close: "Lovely." },
  { opener: "New face. Right now.", cues: ["Drop the jaw.", "Blink slow.", "Crooked grin."], close: "That's your face." },
  { opener: "Let's wake the eyes up.", cues: ["Bright eyes.", "Mouth soft.", "Smirk right."], close: "Nice." },
  { opener: "Give me a little more life than that.", cues: ["Fake serious face.", "Hold it too long.", "Now break."], close: "There you go." },
  { opener: "We're not dulling out here.", cues: ["Lift the cheeks.", "One brow up.", "Give me the smile you're trying to hide."], close: "Yep." },
];

export function pickSmileSequence(lastIndex = -1) {
  if (SMILE_SEQUENCES.length <= 1) return SMILE_SEQUENCES[0];
  let idx;
  do {
    idx = Math.floor(Math.random() * SMILE_SEQUENCES.length);
  } while (idx === lastIndex);
  return { ...SMILE_SEQUENCES[idx], _index: idx };
}