import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import BreathingPhase from '@/components/exercises/BreathingPhase';
import { buildEnergizeSession } from '@/lib/energizeBank';

const PALETTE = {
  amber: '#FFAD09',
  ember: '#F95826',
  rose: '#BA1650',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

// Energize breath: 2s inhale, 1s hold, 2s exhale, 1s hold — 4 cycles
const ENERGIZE_PHASES = [
  { name: 'inhale', label: 'Inhale', duration: 2000, scaleFrom: 0.35, scaleTo: 1.15 },
  { name: 'hold-in', label: 'Hold', duration: 1000, scaleFrom: 1.15, scaleTo: 1.15 },
  { name: 'exhale', label: 'Exhale', duration: 2000, scaleFrom: 1.15, scaleTo: 0.35 },
  { name: 'hold-out', label: 'Hold', duration: 1000, scaleFrom: 0.35, scaleTo: 0.35 },
];

const ENERGIZE_GRADIENT = [
  { at: 0.0, rgb: [186, 22, 80] },
  { at: 0.5, rgb: [231, 161, 52] },
  { at: 1.0, rgb: [255, 213, 100] },
];

const MOVEMENT_HOLD_MS = 4500;
const TRANSITION_HOLD_MS = 3500;
const THOUGHT_HOLD_MS = 6000;

export default function EnergizeReset() {
  const navigate = useNavigate();
  const [session] = useState(() => buildEnergizeSession());
  const [phase, setPhase] = useState(0);
  // 0: opener, 1: breath intro, 2: breath, 3: breath-to-body, 4-6: movements, 7: thought transition, 8: charged thought, 9: charged close

  // Auto-advance for timed phases
  useEffect(() => {
    if (phase === 0) {
      const t = setTimeout(() => setPhase(1), 2200);
      return () => clearTimeout(t);
    }
    if (phase === 1) {
      const t = setTimeout(() => setPhase(2), 4000);
      return () => clearTimeout(t);
    }
    if (phase === 3) {
      const t = setTimeout(() => setPhase(4), TRANSITION_HOLD_MS);
      return () => clearTimeout(t);
    }
    if (phase === 4 || phase === 5) {
      const t = setTimeout(() => setPhase(phase + 1), MOVEMENT_HOLD_MS);
      return () => clearTimeout(t);
    }
    if (phase === 6) {
      const t = setTimeout(() => setPhase(7), MOVEMENT_HOLD_MS);
      return () => clearTimeout(t);
    }
    if (phase === 7) {
      const t = setTimeout(() => setPhase(8), TRANSITION_HOLD_MS);
      return () => clearTimeout(t);
    }
    if (phase === 8) {
      const t = setTimeout(() => setPhase(9), THOUGHT_HOLD_MS);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const renderTextPhase = (text, accent = PALETTE.ember) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, lineHeight: 1.4, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
        {text}
      </p>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, margin: '32px auto 0', opacity: 0.4 }} />
    </motion.div>
  );

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative"
      style={{
        background: `linear-gradient(160deg, ${PALETTE.page} 0%, #fff8ec 50%, #fbf3e8 100%)`,
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

      {/* Label */}
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: PALETTE.ember,
          marginBottom: 48,
          opacity: 0.6,
        }}
      >
        Energize
      </p>

      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div key="opener" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 500 }}>
                {session.opener}
              </h2>
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div key="breath-intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.6, opacity: 0.8 }}>
                {session.breathIntro}
              </p>
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div key="breath" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
              <BreathingPhase
                phases={ENERGIZE_PHASES}
                totalCycles={4}
                gradientStops={ENERGIZE_GRADIENT}
                accentColor={PALETTE.amber}
                onComplete={() => setPhase(3)}
              />
            </motion.div>
          )}

          {phase === 3 && renderTextPhase(session.breathToBody, PALETTE.amber)}

          {phase === 4 && renderTextPhase(session.movement1, PALETTE.ember)}

          {phase === 5 && renderTextPhase(session.movement2, PALETTE.ember)}

          {phase === 6 && renderTextPhase(session.movement3, PALETTE.ember)}

          {phase === 7 && renderTextPhase(session.thoughtTransition, PALETTE.amber)}

          {phase === 8 && (
            <motion.div key="thought" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: PALETTE.ember, marginBottom: 16, opacity: 0.6 }}>
                Charged thought
              </p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 500, lineHeight: 1.4, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
                {session.chargedThought}
              </p>
            </motion.div>
          )}

          {phase === 9 && (
            <motion.div key="close" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 600, marginBottom: 40, color: PALETTE.ember }}>
                {session.chargedClose}
              </h2>
              <button
                onClick={() => navigate('/reset')}
                style={{
                  background: PALETTE.ember,
                  color: PALETTE.cream,
                  border: 'none',
                  borderRadius: 24,
                  padding: '14px 40px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: `0 12px 30px -10px ${PALETTE.ember}99`,
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