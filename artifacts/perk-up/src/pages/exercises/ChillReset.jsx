import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import BreathingPhase from '@/components/exercises/BreathingPhase';
import Grounding54321 from '@/components/exercises/Grounding54321';

const PALETTE = {
  teal: '#219EBC',
  amber: '#FFAD09',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

// Sigh config (physiological sigh: 4.5s double-kick inhale, 1s hold, 8s exhale)
const SIGH_KICK_POINT = 0.85;
const SIGH_MID_RATIO = 0.7;

const sighKick = (t) => {
  if (t < SIGH_KICK_POINT) {
    const localT = t / SIGH_KICK_POINT;
    const eased = localT * localT * (3 - 2 * localT);
    return SIGH_MID_RATIO * eased;
  }
  const localT = (t - SIGH_KICK_POINT) / (1 - SIGH_KICK_POINT);
  const eased = 1 - Math.pow(1 - localT, 2);
  return SIGH_MID_RATIO + (1 - SIGH_MID_RATIO) * eased;
};
const easeInSlow = (t) => Math.pow(t, 3);
const flatEase = () => 1;

const sighGetScale = (phase, t) => {
  const easeFns = { sighKick, easeInSlow, flat: flatEase };
  const fn = easeFns[phase.easing] || ((tt) => 0.5 - 0.5 * Math.cos(Math.PI * tt));
  const raw = fn(Math.min(1, Math.max(0, t)));
  return phase.scaleFrom + (phase.scaleTo - phase.scaleFrom) * raw;
};

const SIGH_PHASES = [
  { name: 'inhale', label: 'Inhale', duration: 4500, scaleFrom: 0.35, scaleTo: 1.15, easing: 'sighKick' },
  { name: 'hold', label: 'Hold', duration: 1000, scaleFrom: 1.15, scaleTo: 1.15, easing: 'flat' },
  { name: 'exhale', label: 'Exhale', duration: 8000, scaleFrom: 1.15, scaleTo: 0.35, easing: 'easeInSlow' },
];

const SIGH_GRADIENT = [
  { at: 0.0, rgb: [17, 133, 183] },
  { at: 0.5, rgb: [41, 170, 226] },
  { at: 1.0, rgb: [231, 161, 52] },
];

const BOX_PHASES = [
  { name: 'inhale', label: 'Inhale', duration: 4000, scaleFrom: 0.35, scaleTo: 1.15 },
  { name: 'hold-in', label: 'Hold', duration: 4000, scaleFrom: 1.15, scaleTo: 1.15 },
  { name: 'exhale', label: 'Exhale', duration: 4000, scaleFrom: 1.15, scaleTo: 0.35 },
  { name: 'hold-out', label: 'Hold', duration: 4000, scaleFrom: 0.35, scaleTo: 0.35 },
];

const BOX_GRADIENT = [
  { at: 0.0, rgb: [186, 22, 80] },
  { at: 0.5, rgb: [231, 161, 52] },
  { at: 1.0, rgb: [255, 213, 100] },
];

export default function ChillReset() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  // 0: intro, 1: sigh, 2: box, 3: grounding, 4: stillness, 5-7: redirect, 8: close

  const REDIRECT_LINES = [
    'What had you keyed up a few minutes ago?',
    'Notice how different that feels now.',
    'Is there one small, good step you can take from here?',
  ];

  const REDIRECT_HOLD_MS = 5000;

  // Intro auto-advance
  useEffect(() => {
    if (phase !== 0) return;
    const timer = setTimeout(() => setPhase(1), 2200);
    return () => clearTimeout(timer);
  }, [phase]);

  // Stillness auto-advance
  useEffect(() => {
    if (phase !== 4) return;
    const timer = setTimeout(() => setPhase(5), 3000);
    return () => clearTimeout(timer);
  }, [phase]);

  // Redirect auto-advance (phases 5-7)
  useEffect(() => {
    if (phase < 5 || phase > 7) return;
    if (phase === 7) {
      const timer = setTimeout(() => setPhase(8), REDIRECT_HOLD_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setPhase(phase + 1), REDIRECT_HOLD_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative"
      style={{
        background: `linear-gradient(160deg, ${PALETTE.page} 0%, #fffdf8 50%, #f0f6f8 100%)`,
        fontFamily: "'DM Sans', sans-serif",
        color: PALETTE.ink,
        padding: 24,
      }}
    >
      {/* Close/exit */}
      <button
        onClick={() => navigate('/reset')}
        className="absolute top-6 right-6 z-50"
        style={{
          background: 'rgba(255,252,242,0.8)',
          border: '1px solid rgba(47,44,41,0.1)',
          borderRadius: 20,
          padding: 8,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        <X size={18} style={{ color: PALETTE.ink, opacity: 0.6 }} />
      </button>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* Phase 0: Intro */}
          {phase === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: PALETTE.teal, marginBottom: 16 }}>
                Chill
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500 }}>
                Let's first reset your breathing.
              </h2>
            </motion.div>
          )}

          {/* Phase 1: Physiological Sigh */}
          {phase === 1 && (
            <motion.div
              key="sigh"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <BreathingPhase
                phases={SIGH_PHASES}
                totalCycles={4}
                gradientStops={SIGH_GRADIENT}
                accentColor={PALETTE.teal}
                getScale={sighGetScale}
                onComplete={() => setPhase(2)}
              />
            </motion.div>
          )}

          {/* Phase 2: Box Breathing */}
          {phase === 2 && (
            <motion.div
              key="box"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <BreathingPhase
                phases={BOX_PHASES}
                totalCycles={4}
                gradientStops={BOX_GRADIENT}
                accentColor={PALETTE.amber}
                onComplete={() => setPhase(3)}
              />
            </motion.div>
          )}

          {/* Phase 3: 5-4-3-2-1 Grounding */}
          {phase === 3 && (
            <motion.div
              key="grounding"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <Grounding54321
                accentColor={PALETTE.teal}
                onComplete={() => setPhase(4)}
              />
            </motion.div>
          )}

          {/* Phase 4: Stillness beat */}
          {phase === 4 && (
            <motion.div
              key="stillness"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: PALETTE.teal,
                  margin: '0 auto 24px',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              <p style={{ fontSize: 14, opacity: 0.5 }}>Take a moment.</p>
            </motion.div>
          )}

          {/* Phases 5-7: Redirect — bring them back to what they were keyed up about */}
          {phase >= 5 && phase <= 7 && (
            <motion.div
              key={`redirect-${phase}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: PALETTE.teal, marginBottom: 32, opacity: 0.5 }}>
                Reset
              </p>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  maxWidth: 320,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                {REDIRECT_LINES[phase - 5]}
              </p>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: PALETTE.teal, margin: '32px auto 0', opacity: 0.35 }} />
            </motion.div>
          )}

          {/* Phase 8: Closing handoff */}
          {phase === 8 && (
            <motion.div
              key="close"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 500, marginBottom: 32, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
                You're here now. Go from here.
              </h2>
              <button
                onClick={() => navigate('/reset')}
                style={{
                  background: PALETTE.ink,
                  color: PALETTE.cream,
                  border: 'none',
                  borderRadius: 24,
                  padding: '14px 40px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back to Reset menu
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}