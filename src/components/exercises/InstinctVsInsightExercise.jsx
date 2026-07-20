import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Check, Plus } from 'lucide-react';
import { getRandomScenario } from '@/lib/instinctScenarios';
import TeachItBack from '@/components/exercises/TeachItBack';

const PALETTE = {
  amber: "#FFAD09",
  ember: "#F95826",
  teal: "#219EBC",
  cream: "#FFFCF2",
  ink: "#2F2C29",
  page: "#fbf6ef",
};

const STEPS = {
  SITUATION: 'situation',
  PAUSE: 'pause',
  INSTINCT: 'instinct',
  INSTINCT_REFLECT: 'instinct_reflect',
  INSIGHT: 'insight',
  ROOT_THOUGHT: 'root_thought',
  ROOT_FEELING: 'root_feeling',
  ROOT_BEHAVIOR: 'root_behavior',
  REROUTE: 'reroute',
  COMPLETE: 'complete',
};

const SITUATION_DURATION = 12000;
const PAUSE_DURATION = 12000;
const INSTINCT_REFLECT_DURATION = 8000;

export default function InstinctVsInsightExercise() {
  const navigate = useNavigate();
  const [scenario] = useState(() => getRandomScenario());
  const [step, setStep] = useState(STEPS.SITUATION);
  const [timeLeft, setTimeLeft] = useState(SITUATION_DURATION / 1000);
  const [selectedInstinct, setSelectedInstinct] = useState(null);
  const [customInstinct, setCustomInstinct] = useState('');
  const [showCustomInstinct, setShowCustomInstinct] = useState(false);
  const [instinctText, setInstinctText] = useState('');
  const [insightText, setInsightText] = useState('');
  const [rootThought, setRootThought] = useState('');
  const [rootFeeling, setRootFeeling] = useState(null);
  const [customFeeling, setCustomFeeling] = useState('');
  const [rootBehavior, setRootBehavior] = useState('');
  const [rerouteText, setRerouteText] = useState('');
  const [showCustomFeeling, setShowCustomFeeling] = useState(false);
  const startTimeRef = useRef(null);

  // Situation countdown (12s, advances on tap or timeout)
  useEffect(() => {
    if (step !== STEPS.SITUATION) return;
    startTimeRef.current = performance.now();
    setTimeLeft(SITUATION_DURATION / 1000);
    let raf;
    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const remaining = Math.max(0, Math.ceil((SITUATION_DURATION - elapsed) / 1000));
      setTimeLeft(remaining);
      if (elapsed >= SITUATION_DURATION) {
        setStep(STEPS.PAUSE);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  // Pause auto-transition (12s)
  useEffect(() => {
    if (step !== STEPS.PAUSE) return;
    const timer = setTimeout(() => setStep(STEPS.INSTINCT), PAUSE_DURATION);
    return () => clearTimeout(timer);
  }, [step]);

  // Instinct reflect auto-transition (8s)
  useEffect(() => {
    if (step !== STEPS.INSTINCT_REFLECT) return;
    const timer = setTimeout(() => setStep(STEPS.INSIGHT), INSTINCT_REFLECT_DURATION);
    return () => clearTimeout(timer);
  }, [step]);

  const situationProgress = Math.round((timeLeft / (SITUATION_DURATION / 1000)) * 100);

  const stepOrder = [STEPS.SITUATION, STEPS.PAUSE, STEPS.INSTINCT, STEPS.INSTINCT_REFLECT, STEPS.INSIGHT, STEPS.ROOT_THOUGHT, STEPS.ROOT_FEELING, STEPS.ROOT_BEHAVIOR, STEPS.REROUTE, STEPS.COMPLETE];
  const stepNum = stepOrder.indexOf(step) + 1;

  const finalInstinct = showCustomInstinct ? customInstinct.trim() : selectedInstinct;

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center px-5"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>

      {/* Step indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${PALETTE.ink}60` }}>
          {step !== STEPS.COMPLETE ? `Step ${stepNum} of 9` : 'Complete'}
        </span>
      </div>

      {/* Back button for pause + reflect screens */}
      {(step === STEPS.PAUSE || step === STEPS.INSTINCT_REFLECT) && (
        <button onClick={() => setStep(step === STEPS.INSTINCT_REFLECT ? STEPS.INSTINCT : STEPS.SITUATION)}
          className="absolute bottom-6 left-6 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium backdrop-blur-md transition-all active:scale-95"
          style={{ background: 'rgba(255,252,242,0.7)', color: PALETTE.ink, border: '1px solid rgba(47,44,41,0.12)' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      )}

      {/* STEP 1: Situation */}
      {step === STEPS.SITUATION && (
        <div className="text-center max-w-md w-full">
          <div className="mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: `${PALETTE.ember}1A`, color: PALETTE.ember }}>
              {scenario.category.replace('/', ' / ')}
            </span>
          </div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, lineHeight: 1.4, marginBottom: 20, color: PALETTE.ink }}>
            {scenario.situation}
          </p>
          <div className="w-full h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: `${PALETTE.ink}0F` }}>
            <div className="h-full transition-all duration-100" style={{ width: `${situationProgress}%`, background: `linear-gradient(90deg, ${PALETTE.ember}, ${PALETTE.amber})` }} />
          </div>
          <p className="text-xs" style={{ color: `${PALETTE.ink}60` }}>
            {timeLeft}s — tap when you've read it
          </p>
          <button onClick={() => setStep(STEPS.PAUSE)}
            className="mt-6 w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}>
            Continue
          </button>
        </div>
      )}

      {/* STEP 2: Pause */}
      {step === STEPS.PAUSE && (
        <div className="text-center max-w-md">
          <div className="rounded-full mx-auto mb-4"
            style={{
              width: 80, height: 80,
              background: `radial-gradient(circle, ${PALETTE.teal}44 0%, ${PALETTE.teal}11 60%, transparent 100%)`,
              animation: 'pause-breathe 3s ease-in-out infinite'
            }}
          />
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, marginBottom: 8, color: PALETTE.ink }}>
            Take a moment to really picture this.
          </p>
          <p className="text-sm" style={{ color: `${PALETTE.ink}A6` }}>
            Imagine it happening — the setting, the people, how it actually feels in your body.
          </p>
          <style>{`@keyframes pause-breathe { 0%,100% { transform: scale(0.85); opacity: 0.7; } 50% { transform: scale(1.05); opacity: 1; } }`}</style>
        </div>
      )}

      {/* STEP 3: Name Your Instinct — options + "Something else" */}
      {step === STEPS.INSTINCT && (
        <div className="max-w-md w-full">
          <p className="text-sm font-medium mb-2" style={{ color: PALETTE.ink }}>
            What's your gut reaction to this?
          </p>
          <p className="text-xs mb-4" style={{ color: `${PALETTE.ink}60` }}>
            {scenario.situation}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {scenario.instincts.map((instinct, idx) => (
              <button key={idx}
                onClick={() => { setSelectedInstinct(instinct); setShowCustomInstinct(false); setInstinctText(instinct); }}
                className="w-full text-left rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-95"
                style={{
                  background: selectedInstinct === instinct && !showCustomInstinct ? `${PALETTE.ember}1A` : `${PALETTE.ink}0A`,
                  border: `1px solid ${selectedInstinct === instinct && !showCustomInstinct ? PALETTE.ember : 'transparent'}`,
                  color: PALETTE.ink
                }}>
                {instinct}
              </button>
            ))}
            <button
              onClick={() => { setShowCustomInstinct(true); setSelectedInstinct(null); }}
              className="w-full text-left rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-95 flex items-center gap-2"
              style={{
                background: showCustomInstinct ? `${PALETTE.ember}1A` : `${PALETTE.ink}0A`,
                border: `1px solid ${showCustomInstinct ? PALETTE.ember : 'transparent'}`,
                color: PALETTE.ink
              }}>
              <Plus className="w-4 h-4 shrink-0" /> Something else
            </button>
          </div>
          {showCustomInstinct && (
            <input
              value={customInstinct}
              onChange={e => { setCustomInstinct(e.target.value); setInstinctText(e.target.value); }}
              placeholder="Name your gut reaction…"
              maxLength={120}
              autoFocus
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none mb-4"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(249,88,38,0.18)', color: PALETTE.ink }}
            />
          )}
          <button onClick={() => setStep(STEPS.INSTINCT_REFLECT)} disabled={!finalInstinct}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 3.5: Instinct Reflect — "think" pause */}
      {step === STEPS.INSTINCT_REFLECT && (
        <div className="text-center max-w-md">
          <div className="rounded-full mx-auto mb-4"
            style={{
              width: 80, height: 80,
              background: `radial-gradient(circle, ${PALETTE.ember}33 0%, ${PALETTE.ember}11 60%, transparent 100%)`,
              animation: 'pause-breathe 3s ease-in-out infinite'
            }}
          />
          <p className="text-xs mb-2" style={{ color: `${PALETTE.ink}60` }}>
            Your instinct:
          </p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, marginBottom: 8, color: PALETTE.ink }}>
            "{instinctText}"
          </p>
          <p className="text-sm" style={{ color: `${PALETTE.ink}A6` }}>
            Sit with that for a moment. Where does it come from?
          </p>
          <style>{`@keyframes pause-breathe { 0%,100% { transform: scale(0.85); opacity: 0.7; } 50% { transform: scale(1.05); opacity: 1; } }`}</style>
        </div>
      )}

      {/* STEP 4: Name the Insight */}
      {step === STEPS.INSIGHT && (
        <div className="max-w-md w-full">
          <p className="text-sm font-medium mb-2" style={{ color: PALETTE.ink }}>
            Now, what would a more grounded, thought-through response look like instead?
          </p>
          <p className="text-xs mb-4" style={{ color: `${PALETTE.ink}60` }}>
            {scenario.situation}
          </p>
          <textarea
            value={insightText}
            onChange={e => setInsightText(e.target.value)}
            placeholder="Your own insight-driven alternative…"
            rows={4}
            maxLength={500}
            autoFocus
            className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-4"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(33,158,188,0.18)', color: PALETTE.ink }}
          />
          <p className="text-xs mb-2" style={{ color: `${PALETTE.ink}60` }}>Stuck? Tap a starter to unstick:</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {scenario.starters.map((starter, idx) => (
              <button key={idx}
                onClick={() => setInsightText(prev => (prev ? prev + ' ' : '') + starter)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95"
                style={{ background: `${PALETTE.teal}0A`, border: `1px solid ${PALETTE.teal}33`, color: PALETTE.ink }}>
                {starter}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(STEPS.ROOT_THOUGHT)} disabled={!insightText.trim()}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 5a: Root in Thought */}
      {step === STEPS.ROOT_THOUGHT && (
        <div className="max-w-md w-full">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: PALETTE.teal }}>Root in Thought</p>
          <p className="text-sm font-medium mb-4" style={{ color: PALETTE.ink }}>
            Where do you think this instinct actually comes from? What belief or assumption might be underneath it?
          </p>
          <textarea
            value={rootThought}
            onChange={e => setRootThought(e.target.value)}
            placeholder="e.g. I assume silence means rejection…"
            rows={4}
            maxLength={500}
            autoFocus
            className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-4"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(33,158,188,0.18)', color: PALETTE.ink }}
          />
          <div className="flex gap-3">
            <button onClick={() => setStep(STEPS.ROOT_FEELING)}
              className="rounded-full px-4 py-3 text-sm transition-all active:scale-95"
              style={{ background: 'transparent', color: `${PALETTE.ink}80`, border: `1px solid ${PALETTE.ink}20` }}>
              Not sure yet
            </button>
            <button onClick={() => setStep(STEPS.ROOT_FEELING)} disabled={!rootThought.trim()}
              className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: PALETTE.ink, color: PALETTE.cream }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5b: Root in Feeling — with "Something else" option */}
      {step === STEPS.ROOT_FEELING && (
        <div className="max-w-md w-full">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: PALETTE.teal }}>Root in Feeling</p>
          <p className="text-sm font-medium mb-4" style={{ color: PALETTE.ink }}>
            What feeling shows up first, right before the instinct kicks in?
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {scenario.feelings.map((feeling, idx) => (
              <button key={idx} onClick={() => { setRootFeeling(feeling); setShowCustomFeeling(false); }}
                className="rounded-full px-4 py-2.5 text-sm font-medium transition-all active:scale-95"
                style={{
                  background: rootFeeling === feeling && !showCustomFeeling ? `${PALETTE.teal}1A` : `${PALETTE.ink}0A`,
                  border: `1px solid ${rootFeeling === feeling && !showCustomFeeling ? PALETTE.teal : 'transparent'}`,
                  color: PALETTE.ink
                }}>
                {feeling}
              </button>
            ))}
            <button onClick={() => { setShowCustomFeeling(true); setRootFeeling(null); }}
              className="rounded-full px-4 py-2.5 text-sm font-medium transition-all active:scale-95 flex items-center gap-1.5"
              style={{
                background: showCustomFeeling ? `${PALETTE.teal}1A` : `${PALETTE.ink}0A`,
                border: `1px solid ${showCustomFeeling ? PALETTE.teal : 'transparent'}`,
                color: PALETTE.ink
              }}>
              <Plus className="w-3.5 h-3.5" /> Something else
            </button>
          </div>
          {showCustomFeeling && (
            <input
              value={customFeeling}
              onChange={e => setCustomFeeling(e.target.value)}
              placeholder="Name the feeling…"
              maxLength={50}
              autoFocus
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none mb-4"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(33,158,188,0.18)', color: PALETTE.ink }}
            />
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(STEPS.ROOT_BEHAVIOR)}
              className="rounded-full px-4 py-3 text-sm transition-all active:scale-95"
              style={{ background: 'transparent', color: `${PALETTE.ink}80`, border: `1px solid ${PALETTE.ink}20` }}>
              Not sure yet
            </button>
            <button onClick={() => setStep(STEPS.ROOT_BEHAVIOR)} disabled={!rootFeeling && !customFeeling.trim()}
              className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: PALETTE.ink, color: PALETTE.cream }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5c: Root in Behavior */}
      {step === STEPS.ROOT_BEHAVIOR && (
        <div className="max-w-md w-full">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: PALETTE.teal }}>Root in Behavior</p>
          <p className="text-sm font-medium mb-4" style={{ color: PALETTE.ink }}>
            What do you typically DO when this instinct takes over — what's the actual behavior pattern?
          </p>
          <textarea
            value={rootBehavior}
            onChange={e => setRootBehavior(e.target.value)}
            placeholder="e.g. I send a follow-up text and then spiral if there's still no reply…"
            rows={4}
            maxLength={500}
            autoFocus
            className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-4"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(33,158,188,0.18)', color: PALETTE.ink }}
          />
          <div className="flex gap-3">
            <button onClick={() => setStep(STEPS.REROUTE)}
              className="rounded-full px-4 py-3 text-sm transition-all active:scale-95"
              style={{ background: 'transparent', color: `${PALETTE.ink}80`, border: `1px solid ${PALETTE.ink}20` }}>
              Not sure yet
            </button>
            <button onClick={() => setStep(STEPS.REROUTE)} disabled={!rootBehavior.trim()}
              className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: PALETTE.ink, color: PALETTE.cream }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: The Reroute */}
      {step === STEPS.REROUTE && (
        <div className="max-w-md w-full">
          <p className="text-sm font-medium mb-4" style={{ color: PALETTE.ink }}>
            Now that you can see where this comes from, what's ONE small thing you'll do differently the next time this situation shows up?
          </p>
          <textarea
            value={rerouteText}
            onChange={e => setRerouteText(e.target.value)}
            placeholder="Your specific, concrete reroute plan…"
            rows={4}
            maxLength={500}
            autoFocus
            className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)', color: PALETTE.ink }}
          />
          <button onClick={() => setStep(STEPS.COMPLETE)} disabled={!rerouteText.trim()}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}>
            Complete <Check className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 7: Teach-It-Back */}
      {step === STEPS.COMPLETE && (
        <div className="max-w-md w-full">
          <div className="mb-4 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: `linear-gradient(135deg, ${PALETTE.teal} 0%, ${PALETTE.amber} 100%)` }}>
              <Check className="w-7 h-7" style={{ color: PALETTE.cream }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: PALETTE.ink }}>
              You traced it to the root.
            </h2>
          </div>
          <TeachItBack exerciseType="instinct-vs-insight" onClose={() => navigate('/neural-training')} />
        </div>
      )}
    </div>
  );
}