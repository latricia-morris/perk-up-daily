import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import BreathingPhase from '@/components/exercises/BreathingPhase';

const PALETTE = {
  teal: '#219EBC',
  amber: '#FFAD09',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

// Physiological sigh: 4.5s double-kick inhale, 1s hold, 8s exhale
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

// Steady breath: 5-5 ocean wave
const STEADY_PHASES = [
  { name: 'inhale', label: 'Inhale', duration: 5000, scaleFrom: 0.35, scaleTo: 1.15 },
  { name: 'exhale', label: 'Exhale', duration: 5000, scaleFrom: 1.15, scaleTo: 0.35 },
];

const STEADY_GRADIENT = [
  { at: 0.0, rgb: [92, 59, 143] },
  { at: 0.5, rgb: [120, 80, 180] },
  { at: 1.0, rgb: [33, 158, 188] },
];

const PATTERN_BREAK_LINES = [
  'Stop right where you are.',
  'Notice your body in this moment.',
  'Notice the space around you.',
  'You are here. Not in your head — here.',
];

const REDIRECT_LINES = [
  'What had you keyed up a few minutes ago?',
  'Notice how different that feels now.',
  'Is there one small, good step you can take?',
  'Whatever it is, you can handle it from here.',
];

const LINE_HOLD_MS = 2800;

export default function RecalibrateReset() {
  const navigate = useNavigate();
  // 0: intro, 1-4: pattern break, 5: sigh, 6: steady breath, 7-10: redirect, 11: close
  const [phase, setPhase] = useState(0);

  // Intro auto-advance
  useEffect(() => {
    if (phase !== 0) return;
    const timer = setTimeout(() => setPhase(1), 2200);
    return () => clearTimeout(timer);
  }, [phase]);

  // Pattern break auto-advance (phases 1-4 map to PATTERN_BREAK_LINES[0-3])
  useEffect(() => {
    if (phase < 1 || phase > 4) return;
    if (phase === 4) {
      const timer = setTimeout(() => setPhase(5), LINE_HOLD_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setPhase(phase + 1), LINE_HOLD_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  // Redirect auto-advance (phases 7-10 map to REDIRECT_LINES[0-3])
  useEffect(() => {
    if (phase < 7 || phase > 10) return;
    if (phase === 10) {
      const timer = setTimeout(() => setPhase(11), LINE_HOLD_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setPhase(phase + 1), LINE_HOLD_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const renderTextLine = (text, accent = PALETTE.teal) => (
    <motion.div
      key={phase}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26,
          fontWeight: 500,
          lineHeight: 1.4,
          maxWidth: 320,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {text}
      </p>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, margin: '32px auto 0', opacity: 0.4 }} />
    </motion.div>
  );

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative"
      style={{
        background: `linear-gradient(160deg, ${PALETTE.page} 0%, #f0f6f8 50%, #fbf6ef 100%)`,
        fontFamily: "'DM Sans', sans-serif",
        color: PALETTE.ink,
        padding: 24,
      }}
    >
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
                Recalibrate
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500 }}>
                Let's hit pause and reset.
              </h2>
            </motion.div>
          )}

          {phase >= 1 && phase <= 4 && renderTextLine(PATTERN_BREAK_LINES[phase - 1])}

          {phase === 5 && (
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
                totalCycles={3}
                gradientStops={SIGH_GRADIENT}
                accentColor={PALETTE.teal}
                getScale={sighGetScale}
                onComplete={() => setPhase(6)}
              />
            </motion.div>
          )}

          {phase === 6 && (
            <motion.div
              key="steady"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <BreathingPhase
                phases={STEADY_PHASES}
                totalCycles={4}
                gradientStops={STEADY_GRADIENT}
                accentColor={PALETTE.teal}
                onComplete={() => setPhase(7)}
              />
            </motion.div>
          )}

          {phase >= 7 && phase <= 10 && renderTextLine(REDIRECT_LINES[phase - 7], PALETTE.amber)}

          {phase === 11 && (
            <motion.div
              key="close"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 500, marginBottom: 32, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
                You're back. Go from here.
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