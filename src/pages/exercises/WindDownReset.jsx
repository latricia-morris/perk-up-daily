import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import BreathingPhase from '@/components/exercises/BreathingPhase';

const PALETTE = {
  indigo: '#5C3B8F',
  twilight: '#8ECAE6',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

// Extended-Exhale Breathing: 4s inhale, 7s hold, 8s exhale — 3 cycles
const EXHALE_PHASES = [
  { name: 'inhale', label: 'Inhale', duration: 4000, scaleFrom: 0.35, scaleTo: 1.15 },
  { name: 'hold', label: 'Hold', duration: 7000, scaleFrom: 1.15, scaleTo: 1.15 },
  { name: 'exhale', label: 'Exhale', duration: 8000, scaleFrom: 1.15, scaleTo: 0.35 },
];

const EXHALE_GRADIENT = [
  { at: 0.0, rgb: [92, 59, 143] },
  { at: 0.5, rgb: [142, 202, 230] },
  { at: 1.0, rgb: [33, 80, 120] },
];

// Set the Day Down — guided release with guaranteed discard
const SET_DOWN_LINES = [
  'Think about everything that happened today.',
  'The wins. The misses. The unfinished things.',
  'Now imagine setting it all down. Right here. Right now.',
  'None of it follows you past this moment.',
  'Let it go. The day is done.',
];

// Progressive Release — body scan from head to toe
const RELEASE_LINES = [
  'Start at the top of your head. Let it be still.',
  'Soften your face. Release your jaw.',
  'Drop your shoulders. Let them fall away from your ears.',
  'Let your arms go heavy. Let your hands rest.',
  'Soften your chest. Let your breathing slow on its own.',
  'Let your stomach soften. Let it all go.',
  'Let your legs go heavy. Let your feet rest.',
  'Your whole body is at rest now.',
];

const LINE_HOLD_MS = 3000;

export default function WindDownReset() {
  const navigate = useNavigate();
  // 0: intro, 1-3: extended exhale breathing, 4-8: set the day down, 9-16: progressive release, 17: close
  const [phase, setPhase] = useState(0);

  // Intro auto-advance
  useEffect(() => {
    if (phase !== 0) return;
    const timer = setTimeout(() => setPhase(1), 2200);
    return () => clearTimeout(timer);
  }, [phase]);

  // Set the Day Down auto-advance (phases 4-8 map to SET_DOWN_LINES[0-4])
  useEffect(() => {
    if (phase < 4 || phase > 8) return;
    if (phase === 8) {
      const timer = setTimeout(() => setPhase(9), LINE_HOLD_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setPhase(phase + 1), LINE_HOLD_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  // Progressive Release auto-advance (phases 9-16 map to RELEASE_LINES[0-7])
  useEffect(() => {
    if (phase < 9 || phase > 16) return;
    if (phase === 16) {
      const timer = setTimeout(() => setPhase(17), LINE_HOLD_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setPhase(phase + 1), LINE_HOLD_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const renderTextLine = (text, accent = PALETTE.indigo) => (
    <motion.div
      key={phase}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45 }}
      className="text-center"
    >
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
        {text}
      </p>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, margin: '32px auto 0', opacity: 0.35 }} />
    </motion.div>
  );

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative"
      style={{
        background: `linear-gradient(160deg, ${PALETTE.page} 0%, #f0eef6 40%, #e8f0f8 100%)`,
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
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: PALETTE.indigo, marginBottom: 16 }}>
                Wind Down
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500 }}>
                Time to set it all down.
              </h2>
            </motion.div>
          )}

          {/* Phase 1-3: Extended-Exhale Breathing (single breathing component) */}
          {phase === 1 && (
            <motion.div
              key="exhale-breath"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: PALETTE.indigo, marginBottom: 24, opacity: 0.5 }}>
                Extended-Exhale Breath
              </p>
              <BreathingPhase
                phases={EXHALE_PHASES}
                totalCycles={3}
                gradientStops={EXHALE_GRADIENT}
                accentColor={PALETTE.indigo}
                onComplete={() => setPhase(4)}
              />
            </motion.div>
          )}

          {/* Phases 4-8: Set the Day Down */}
          {phase >= 4 && phase <= 8 && (
            <motion.div key="set-down" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: PALETTE.twilight, marginBottom: 32, opacity: 0.6, textAlign: 'center' }}>
                Set the Day Down
              </p>
              {renderTextLine(SET_DOWN_LINES[phase - 4], PALETTE.twilight)}
            </motion.div>
          )}

          {/* Phases 9-16: Progressive Release */}
          {phase >= 9 && phase <= 16 && (
            <motion.div key="release" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: PALETTE.indigo, marginBottom: 32, opacity: 0.6, textAlign: 'center' }}>
                Progressive Release
              </p>
              {renderTextLine(RELEASE_LINES[phase - 9], PALETTE.indigo)}
            </motion.div>
          )}

          {phase === 17 && (
            <motion.div
              key="close"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 500, marginBottom: 12, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
                Rest now.
              </h2>
              <p style={{ fontSize: 16, color: '#7a5c3a', marginBottom: 32, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
                Tomorrow is a fresh start. Whatever today held, it's behind you.
              </p>
              <button
                onClick={() => navigate('/reset')}
                style={{
                  background: PALETTE.indigo,
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