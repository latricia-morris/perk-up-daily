import { useState, useEffect, useRef, useCallback } from 'react';
import BreathingOrb from './BreathingOrb';

const defaultEase = (t) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)));

const defaultGetScale = (phase, t) => {
  const eased = defaultEase(t);
  return phase.scaleFrom + (phase.scaleTo - phase.scaleFrom) * eased;
};

/**
 * BreathingPhase — Auto-starting breathing phase for use inside reset flows.
 * Runs through all cycles automatically, then calls onComplete.
 * No Begin/Pause button — just a small skip link.
 *
 * Props:
 * - phases: [{ name, label, duration, scaleFrom, scaleTo }]
 * - totalCycles: number
 * - gradientStops: [{ at, rgb }]
 * - accentColor: string
 * - onComplete: () => void
 * - getScale: (phase, t) => number  (optional, for custom easing like sigh)
 * - size: number (optional, default 280)
 */
export default function BreathingPhase({
  phases,
  totalCycles,
  gradientStops,
  accentColor = '#5C3B8F',
  onComplete,
  getScale = defaultGetScale,
  size = 280,
}) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [remaining, setRemaining] = useState(Math.ceil(phases[0].duration / 1000));
  const [complete, setComplete] = useState(false);

  const scaleRef = useRef(phases[0].scaleFrom);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const completedRef = useRef(false);

  const PHASE_CYCLE_MS = phases.reduce((s, p) => s + p.duration, 0);
  const CYCLE_MS = PHASE_CYCLE_MS * totalCycles;

  const tick = useCallback(() => {
    const now = performance.now();
    const totalElapsed = now - startRef.current;

    if (totalElapsed >= CYCLE_MS) {
      if (!completedRef.current) {
        completedRef.current = true;
        setComplete(true);
        cancelAnimationFrame(rafRef.current);
        setTimeout(() => onComplete(), 900);
      }
      return;
    }

    const cycleIdx = Math.min(totalCycles - 1, Math.floor(totalElapsed / PHASE_CYCLE_MS));
    const elapsed = totalElapsed % PHASE_CYCLE_MS;
    let acc = 0;
    for (let i = 0; i < phases.length; i++) {
      const p = phases[i];
      if (elapsed < acc + p.duration) {
        const t = (elapsed - acc) / p.duration;
        scaleRef.current = getScale(p, t);
        setPhaseIndex(i);
        setCycle(cycleIdx);
        setRemaining(Math.max(1, Math.ceil((p.duration - (elapsed - acc)) / 1000)));
        break;
      }
      acc += p.duration;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [phases, totalCycles, PHASE_CYCLE_MS, CYCLE_MS, onComplete, getScale]);

  useEffect(() => {
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  const phase = phases[phaseIndex];

  return (
    <div className="flex flex-col items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 14, opacity: 0.7 }}>
          {complete ? 'Complete' : `Cycle ${cycle + 1} of ${totalCycles}`}
        </div>
      </div>

      <BreathingOrb scaleRef={scaleRef} gradientStops={gradientStops} size={size} />

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: 0.5 }}>
          {complete ? 'Complete' : phase.label}
        </div>
        {!complete && <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>{remaining}</div>}
      </div>

      {!complete && (
        <button
          onClick={onComplete}
          style={{
            marginTop: 16,
            background: 'transparent',
            border: 'none',
            color: accentColor,
            fontSize: 13,
            opacity: 0.5,
            cursor: 'pointer',
          }}
        >
          Skip
        </button>
      )}
    </div>
  );
}