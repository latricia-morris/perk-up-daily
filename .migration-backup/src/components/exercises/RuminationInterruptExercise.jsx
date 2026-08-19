import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';

const PALETTE = {
  amber: '#FFAD09',
  ember: '#F95826',
  teal: '#219EBC',
  purple: '#5C3B8F',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

const SINGLE_STEP_LINES = [
  "Good — when this thought loops again, that's your cue to go do that, not to keep thinking about it.",
  "That's a real step. Let it be the thing you do instead of the thing you keep replaying.",
  "You don't need to solve this by thinking about it more. You already know the move.",
  "Next time this comes back around, that's your signal — go do the thing, not the thinking.",
];

const NEEDS_BREAKDOWN_LINES = [
  "You don't have to do all of it at once. When this loops again, that's your cue to go do just the first piece.",
  "One piece at a time is still real progress. Let the first step be enough for now.",
  "This doesn't need to be solved today. It needs a first move — and you've got one.",
  "You broke it down instead of staying stuck in it. That's the actual work.",
];

const lastLineRef = { single_step: null, needs_breakdown: null };

function pickRandomLine(bank) {
  const lines = bank === 'single_step' ? SINGLE_STEP_LINES : NEEDS_BREAKDOWN_LINES;
  let available = lines;
  if (lines.length > 1 && lastLineRef[bank] !== null) {
    available = lines.filter(l => l !== lastLineRef[bank]);
  }
  const chosen = available[Math.floor(Math.random() * available.length)];
  lastLineRef[bank] = chosen;
  return chosen;
}

// One-cycle breathing pacer for A3b-4-ii
function SingleBreathCycle({ onComplete }) {
  const [phase, setPhase] = useState('inhale');
  const [scale, setScale] = useState(0.4);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  const INHALE_MS = 4000;
  const EXHALE_MS = 6000;
  const TOTAL_MS = INHALE_MS + EXHALE_MS;

  useEffect(() => {
    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      if (elapsed >= TOTAL_MS) {
        setScale(0.4);
        onComplete();
        return;
      }
      if (elapsed < INHALE_MS) {
        const t = elapsed / INHALE_MS;
        setScale(0.4 + 0.7 * t);
        setPhase('inhale');
      } else {
        const t = (elapsed - INHALE_MS) / EXHALE_MS;
        setScale(1.1 - 0.7 * t);
        setPhase('exhale');
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 mb-4 flex items-center justify-center">
        <div className="rounded-full flex items-center justify-center"
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${scale})`,
            background: `radial-gradient(circle, ${PALETTE.teal}40 0%, ${PALETTE.teal}15 70%, transparent 100%)`,
            border: `2px solid ${PALETTE.teal}40`,
          }}>
        </div>
        <div className="absolute text-sm font-medium" style={{ color: PALETTE.ink }}>
          {phase === 'inhale' ? 'Breathe in' : 'Let it out'}
        </div>
      </div>
    </div>
  );
}

export default function RuminationInterruptExercise() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('A1');
  const [loopThought, setLoopThought] = useState('');
  const [actionSize, setActionSize] = useState(null);
  const [redirectAction, setRedirectAction] = useState('');
  const [redirectSteps, setRedirectSteps] = useState(['', '', '']);
  const [closingLine, setClosingLine] = useState('');
  const [weightCheck, setWeightCheck] = useState(null);
  const [betterUseText, setBetterUseText] = useState('');
  const [stillStuck, setStillStuck] = useState(null);
  const [opportunityCost, setOpportunityCost] = useState('');
  const [betterEnergy, setBetterEnergy] = useState('');
  const [groundingObjects, setGroundingObjects] = useState('');
  const [breathComplete, setBreathComplete] = useState(false);
  const [releasePath, setReleasePath] = useState(null);

  const goA4a = () => {
    setClosingLine(pickRandomLine(actionSize));
    setScreen('A4a');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-5 pt-16 pb-32"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${PALETTE.ink}60` }}>
          Rumination Interrupt
        </span>
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* A1: Name the Loop */}
          {screen === 'A1' && (
            <motion.div key="a1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-center" style={{ color: '#C97F0E' }}>Rumination Interrupt</p>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600 }}>
                What's the thought that keeps circling back?
              </h2>
              <textarea
                value={loopThought}
                onChange={e => setLoopThought(e.target.value)}
                placeholder="Type it out…"
                rows={3}
                maxLength={280}
                autoFocus
                className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6 text-center"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
              />
              <button onClick={() => setScreen('A2')} className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* A2: Productivity Check */}
          {screen === 'A2' && (
            <motion.div key="a2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                Is there an actual next action you can take on this right now?
              </h2>
              <div className="space-y-3 mb-6">
                <button onClick={() => setScreen('A3a')}
                  className="w-full rounded-xl p-4 text-left text-sm font-medium transition-all active:scale-95"
                  style={{ background: `${PALETTE.teal}14`, border: `1px solid ${PALETTE.teal}33` }}>
                  Yes, there's something I can do
                </button>
                <button onClick={() => setScreen('A3b')}
                  className="w-full rounded-xl p-4 text-left text-sm font-medium transition-all active:scale-95"
                  style={{ background: `${PALETTE.purple}14`, border: `1px solid ${PALETTE.purple}33` }}>
                  No, there's nothing to actually do right now
                </button>
              </div>
              <button onClick={() => setScreen('A1')} className="text-xs flex items-center gap-1 mx-auto" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* A3a: Sizing Check */}
          {screen === 'A3a' && (
            <motion.div key="a3a" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                Is this something you can do in one move, or does it need to be broken down first?
              </h2>
              <div className="space-y-3 mb-6">
                <button onClick={() => { setActionSize('single_step'); setScreen('A3a-i'); }}
                  className="w-full rounded-xl p-4 text-left text-sm font-medium transition-all active:scale-95"
                  style={{ background: `${PALETTE.teal}14`, border: `1px solid ${PALETTE.teal}33` }}>
                  It's one clear step
                </button>
                <button onClick={() => { setActionSize('needs_breakdown'); setScreen('A3a-ii'); }}
                  className="w-full rounded-xl p-4 text-left text-sm font-medium transition-all active:scale-95"
                  style={{ background: `${PALETTE.amber}14`, border: `1px solid ${PALETTE.amber}33` }}>
                  It's too big for just one step
                </button>
              </div>
              <button onClick={() => setScreen('A2')} className="text-xs flex items-center gap-1 mx-auto" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* A3a-i: Single Step Entry */}
          {screen === 'A3a-i' && (
            <motion.div key="a3ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                What's that one step?
              </h2>
              <input
                type="text"
                value={redirectAction}
                onChange={e => setRedirectAction(e.target.value)}
                placeholder="Name the step…"
                maxLength={280}
                autoFocus
                className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-6 text-center"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
              />
              <div className="flex gap-3">
                <button onClick={() => setScreen('A3a')} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={goA4a} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: PALETTE.teal, color: PALETTE.cream }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* A3a-ii: Breakdown Entry */}
          {screen === 'A3a-ii' && (
            <motion.div key="a3aii" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600 }}>
                Let's break it into pieces. What are up to 3 smaller steps that would move this forward?
              </h2>
              <div className="space-y-3 mb-6">
                {redirectSteps.map((stepVal, i) => (
                  <div key={i}>
                    <label className="text-xs font-medium block mb-1" style={{ color: `${PALETTE.ink}80` }}>Step {i + 1}</label>
                    <input
                      type="text"
                      value={stepVal}
                      onChange={e => { const next = [...redirectSteps]; next[i] = e.target.value; setRedirectSteps(next); }}
                      placeholder={i === 0 ? 'Start with just the very first piece…' : ''}
                      maxLength={280}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setScreen('A3a')} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={goA4a} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: PALETTE.teal, color: PALETTE.cream }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* A4a: Redirect Confirmation */}
          {screen === 'A4a' && (
            <motion.div key="a4a" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${PALETTE.teal}26` }}>
                <p className="text-base leading-relaxed" style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500 }}>
                  {closingLine}
                </p>
              </div>
              <button onClick={() => setScreen('A5')} className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95"
                style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                Done
              </button>
              <button onClick={() => setScreen(actionSize === 'single_step' ? 'A3a-i' : 'A3a-ii')} className="text-xs flex items-center gap-1 mx-auto mt-3" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* A3b: Empathy Beat */}
          {screen === 'A3b' && (
            <motion.div key="a3b" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <h2 className="mb-8" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                I know you're carrying a lot right now. Let's see if we can switch gears here.
              </h2>
              <button onClick={() => setScreen('A3b-1')} className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95"
                style={{ background: PALETTE.purple, color: PALETTE.cream }}>
                Okay
              </button>
              <button onClick={() => setScreen('A2')} className="text-xs flex items-center gap-1 mx-auto mt-3" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* A3b-1: Weight Check */}
          {screen === 'A3b-1' && (
            <motion.div key="a3b1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600 }}>
                Before we do anything else — how much weight does this thought actually deserve to be carrying right now?
              </h2>
              <div className="space-y-3 mb-6">
                {[
                  { id: 'deserves_a_lot', label: 'It deserves a lot of my attention right now' },
                  { id: 'deserves_some', label: 'It deserves some, but not all of this' },
                  { id: 'deserves_less', label: 'Less than it currently getting' },
                ].map(opt => (
                  <button key={opt.id} onClick={() => { setWeightCheck(opt.id); setScreen('A3b-2'); }}
                    className="w-full rounded-xl p-4 text-left text-sm font-medium transition-all active:scale-95"
                    style={{
                      background: weightCheck === opt.id ? `${PALETTE.purple}14` : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${weightCheck === opt.id ? PALETTE.purple : 'rgba(212,131,10,0.12)'}`,
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setScreen('A3b')} className="text-xs flex items-center gap-1 mx-auto" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* A3b-2: What Else Deserves This */}
          {screen === 'A3b-2' && (
            <motion.div key="a3b2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600 }}>
                {weightCheck === 'deserves_a_lot'
                  ? 'Even so — is there anyone or anything right now that could use this same attention more than this thought can use it?'
                  : "What's one person or thing around you right now that could actually use this attention more than this thought can?"}
              </h2>
              <textarea
                value={betterUseText}
                onChange={e => setBetterUseText(e.target.value)}
                placeholder="A person, a task, a moment happening right now…"
                rows={3}
                maxLength={280}
                autoFocus
                className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
              />
              <div className="flex gap-3">
                <button onClick={() => setScreen('A3b-1')} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setScreen('A3b-3')} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: PALETTE.purple, color: PALETTE.cream }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* A3b-3: Still Stuck Check */}
          {screen === 'A3b-3' && (
            <motion.div key="a3b3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                Does it feel any easier to let this go now, or is it still stuck?
              </h2>
              <div className="space-y-3 mb-6">
                <button onClick={() => { setStillStuck('easier'); setReleasePath('easier'); setScreen('A3b-4-i'); }}
                  className="w-full rounded-xl p-4 text-left text-sm font-medium transition-all active:scale-95"
                  style={{ background: `${PALETTE.teal}14`, border: `1px solid ${PALETTE.teal}33` }}>
                  A little easier
                </button>
                <button onClick={() => { setStillStuck('still_stuck'); setScreen('A3b-3a'); }}
                  className="w-full rounded-xl p-4 text-left text-sm font-medium transition-all active:scale-95"
                  style={{ background: `${PALETTE.amber}14`, border: `1px solid ${PALETTE.amber}33` }}>
                  Still stuck
                </button>
              </div>
              <button onClick={() => setScreen('A3b-2')} className="text-xs flex items-center gap-1 mx-auto" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* A3b-3a: Opportunity Cost Reframe */}
          {screen === 'A3b-3a' && (
            <motion.div key="a3b3a" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600 }}>
                Saying yes to thinking about this over and over means saying no to something else. What are you saying no to by letting this thought keep running?
              </h2>
              <textarea
                value={opportunityCost}
                onChange={e => setOpportunityCost(e.target.value)}
                placeholder="What's it costing you to keep replaying this…"
                rows={3}
                maxLength={280}
                autoFocus
                className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
              />
              <div className="flex gap-3">
                <button onClick={() => setScreen('A3b-3')} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setScreen('A3b-3b')} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: PALETTE.amber, color: PALETTE.ink }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* A3b-3b: Better Use of Energy */}
          {screen === 'A3b-3b' && (
            <motion.div key="a3b3b" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600 }}>
                If not this — what's something you could give that same energy to instead, that you'd actually feel good about?
              </h2>
              <textarea
                value={betterEnergy}
                onChange={e => setBetterEnergy(e.target.value)}
                placeholder="Something that would feel like a better use of it…"
                rows={3}
                maxLength={280}
                autoFocus
                className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
              />
              <div className="flex gap-3">
                <button onClick={() => setScreen('A3b-3a')} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => { setReleasePath('still_stuck'); setScreen('A3b-4-i'); }} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: PALETTE.amber, color: PALETTE.ink }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* A3b-4-i: Release Drill - Name 3 Things */}
          {screen === 'A3b-4-i' && (
            <motion.div key="a3b4i" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                Name 3 things you can see right now.
              </h2>
              <textarea
                value={groundingObjects}
                onChange={e => setGroundingObjects(e.target.value)}
                placeholder="Look around and name them…"
                rows={3}
                maxLength={280}
                autoFocus
                className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
              />
              <div className="flex gap-3">
                <button onClick={() => setScreen(releasePath === 'still_stuck' ? 'A3b-3b' : 'A3b-3')} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => { setBreathComplete(false); setScreen('A3b-4-ii'); }} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: PALETTE.teal, color: PALETTE.cream }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* A3b-4-ii: Release Drill - Breath */}
          {screen === 'A3b-4-ii' && (
            <motion.div key="a3b4ii" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="text-center">
              <h2 className="mb-8" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                Take one slow breath in, and let it out slower than it came in.
              </h2>
              <SingleBreathCycle onComplete={() => setBreathComplete(true)} />
              {breathComplete ? (
                <button onClick={() => setScreen('A3b-4-iii')} className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2 mt-6"
                  style={{ background: PALETTE.teal, color: PALETTE.cream }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="text-xs mt-6" style={{ color: `${PALETTE.ink}40` }}>
                  …one slow breath
                </div>
              )}
              <button onClick={() => setScreen('A3b-4-i')} className="text-xs flex items-center gap-1 mx-auto mt-3" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* A3b-4-iii: Release Drill - Stated Release */}
          {screen === 'A3b-4-iii' && (
            <motion.div key="a3b4iii" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${PALETTE.teal}26` }}>
                <p className="text-base leading-relaxed" style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500 }}>
                  Say this, out loud or in your head: "I've noticed this thought, and I've given it the attention it needed. I can let it rest now."
                </p>
              </div>
              <button onClick={() => setScreen('A5')} className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95"
                style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                Done
              </button>
              <button onClick={() => setScreen('A3b-4-ii')} className="text-xs flex items-center gap-1 mx-auto mt-3" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* A5: Close (shared) */}
          {screen === 'A5' && (
            <motion.div key="a5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <h2 className="mb-8" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                The thought may come back, and that's okay — you know what to do when it does.
              </h2>
              <button onClick={() => navigate('/neural-training')} className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95"
                style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                Back to Reset menu
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}