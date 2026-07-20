import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { pickRandomScenarios } from '@/lib/instinctScenarios';

const PALETTE = {
  amber: "#FFAD09",
  ember: "#F95826",
  rose: "#BA1650",
  teal: "#219EBC",
  violet: "#5C3B8F",
  cream: "#FFFCF2",
  ink: "#2F2C29",
  page: "#fbf6ef",
};

const STEPS = {
  INSTINCT: 'instinct',
  PAUSE: 'pause',
  INSIGHT: 'insight',
  REFLECTION: 'reflection',
  COMPLETE: 'complete',
};

const INSTINCT_DURATION = 3000; // 3 seconds
const PAUSE_DURATION = 3500; // 3.5 seconds

export default function InstinctVsInsightExercise() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [step, setStep] = useState(STEPS.INSTINCT);
  const [instinctAnswer, setInstinctAnswer] = useState(null);
  const [insightAnswer, setInsightAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(INSTINCT_DURATION / 1000);
  const [changedCount, setChangedCount] = useState(0);

  useEffect(() => {
    setScenarios(pickRandomScenarios(5));
  }, []);

  const currentScenario = scenarios[currentIdx];

  // Instinct countdown
  useEffect(() => {
    if (step !== STEPS.INSTINCT || !currentScenario) return;
    setTimeLeft(INSTINCT_DURATION / 1000);
    const startTime = performance.now();
    let raf;
    const tick = () => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, Math.ceil((INSTINCT_DURATION - elapsed) / 1000));
      setTimeLeft(remaining);
      if (elapsed >= INSTINCT_DURATION) {
        if (!instinctAnswer) {
          setInstinctAnswer(-1); // no instinct captured
        }
        setStep(STEPS.PAUSE);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step, currentScenario]);

  // Pause auto-transition
  useEffect(() => {
    if (step !== STEPS.PAUSE) return;
    const timer = setTimeout(() => setStep(STEPS.INSIGHT), PAUSE_DURATION);
    return () => clearTimeout(timer);
  }, [step]);

  const handleInstinctTap = (idx) => {
    if (instinctAnswer !== null) return;
    setInstinctAnswer(idx);
    setStep(STEPS.PAUSE);
  };

  const handleInsightTap = (idx) => {
    setInsightAnswer(idx);
    if (instinctAnswer !== idx && instinctAnswer !== -1) {
      setChangedCount(c => c + 1);
    }
    setStep(STEPS.REFLECTION);
  };

  const handleNext = () => {
    if (currentIdx + 1 < scenarios.length) {
      setCurrentIdx(prev => prev + 1);
      setStep(STEPS.INSTINCT);
      setInstinctAnswer(null);
      setInsightAnswer(null);
    } else {
      setStep(STEPS.COMPLETE);
    }
  };

  if (!currentScenario && step !== STEPS.COMPLETE) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: PALETTE.page, color: PALETTE.ink }}>
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const progress = Math.round((timeLeft / (INSTINCT_DURATION / 1000)) * 100);

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center px-5" style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>
      {/* Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600 }}>
          Instinct vs Insight
        </div>
        {step !== STEPS.COMPLETE && (
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            Scenario {currentIdx + 1} of {scenarios.length}
          </div>
        )}
      </div>

      {/* INSTINCT STEP */}
      {step === STEPS.INSTINCT && (
        <div className="text-center max-w-md w-full">
          <div className="mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: `${PALETTE.ember}1A`, color: PALETTE.ember }}>
              {currentScenario.category}
            </span>
          </div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, lineHeight: 1.4, marginBottom: 20, color: PALETTE.ink }}>
            {currentScenario.text}
          </p>
          {/* Countdown bar */}
          <div className="w-full h-1.5 rounded-full mb-6 overflow-hidden" style={{ background: `${PALETTE.ink}0F` }}>
            <div className="h-full transition-all duration-100" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${PALETTE.ember}, ${PALETTE.amber})` }} />
          </div>
          <div className="space-y-2.5">
            {currentScenario.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleInstinctTap(idx)}
                className="w-full rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-95"
                style={{ background: `${PALETTE.ink}0A`, border: `1px solid ${PALETTE.ink}15`, color: PALETTE.ink }}
              >
                {opt}
              </button>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: `${PALETTE.ink}60` }}>Tap your first instinct — quickly!</p>
        </div>
      )}

      {/* PAUSE STEP */}
      {step === STEPS.PAUSE && (
        <div className="text-center">
          <div
            className="rounded-full mx-auto mb-4 animate-pulse"
            style={{
              width: 80, height: 80,
              background: `radial-gradient(circle, ${PALETTE.teal}44 0%, ${PALETTE.violet}22 60%, transparent 100%)`,
              animation: 'breathe-pulse 3.5s ease-in-out',
            }}
          />
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, color: PALETTE.ink }}>
            Pause.
          </p>
          <style>{`@keyframes breathe-pulse { 0%,100% { transform: scale(0.8); opacity: 0.6; } 50% { transform: scale(1.1); opacity: 1; } }`}</style>
        </div>
      )}

      {/* INSIGHT STEP */}
      {step === STEPS.INSIGHT && (
        <div className="text-center max-w-md w-full">
          <p className="text-sm mb-3" style={{ color: PALETTE.teal, fontWeight: 600 }}>
            Now that you've paused — what's true here?
          </p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, lineHeight: 1.4, marginBottom: 20, color: PALETTE.ink }}>
            {currentScenario.text}
          </p>
          <div className="space-y-2.5">
            {currentScenario.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleInsightTap(idx)}
                className="w-full rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-95"
                style={{ background: `${PALETTE.teal}0A`, border: `1px solid ${PALETTE.teal}33`, color: PALETTE.ink }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* REFLECTION STEP */}
      {step === STEPS.REFLECTION && (
        <div className="text-center max-w-md w-full">
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, marginBottom: 16, color: PALETTE.ink }}>
            {currentScenario.text}
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-xl p-4" style={{ background: `${PALETTE.ember}0A`, border: `1px solid ${PALETTE.ember}33` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: PALETTE.ember }}>Instinct</p>
              <p className="text-sm" style={{ color: PALETTE.ink }}>
                {instinctAnswer === -1 ? 'No instinct captured' : currentScenario.options[instinctAnswer]}
              </p>
            </div>
            <div className="rounded-xl p-4" style={{ background: `${PALETTE.teal}0A`, border: `1px solid ${PALETTE.teal}33` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: PALETTE.teal }}>Insight</p>
              <p className="text-sm" style={{ color: PALETTE.ink }}>
                {currentScenario.options[insightAnswer]}
              </p>
            </div>
          </div>
          <p className="text-sm mb-6" style={{ color: `${PALETTE.ink}A6` }}>
            {instinctAnswer === insightAnswer
              ? "Your instinct and insight agree. That's clarity."
              : instinctAnswer === -1
                ? "You took a moment to pause before answering. That's power."
                : "Your pause changed your answer. That's power."}
          </p>
          <button
            onClick={handleNext}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}
          >
            {currentIdx + 1 >= scenarios.length ? 'See your results' : 'Next scenario'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* COMPLETE STEP */}
      {step === STEPS.COMPLETE && (
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `linear-gradient(135deg, ${PALETTE.teal} 0%, ${PALETTE.violet} 100%)` }}>
            <Check className="w-8 h-8" style={{ color: PALETTE.cream }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, marginBottom: 8, color: PALETTE.ink }}>
            Session Complete
          </h2>
          <p className="text-sm mb-8" style={{ color: `${PALETTE.ink}A6` }}>
            You paused and changed your answer {changedCount} out of {scenarios.length} times today.
            <br />
            That's {changedCount === 0 ? 'remarkable clarity' : changedCount <= 2 ? 'genuine self-awareness' : 'real growth in action'}.
          </p>
          <button
            onClick={() => { setScenarios(pickRandomScenarios(5)); setCurrentIdx(0); setStep(STEPS.INSTINCT); setInstinctAnswer(null); setInsightAnswer(null); setChangedCount(0); }}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 mb-3"
            style={{ background: PALETTE.teal, color: PALETTE.cream }}
          >
            Try another round
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95"
            style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}
          >
            Done for today
          </button>
        </div>
      )}
    </div>
  );
}