import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const PALETTE = {
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

const SENSE_PHASES = [
  { count: 5, sense: 'see', prompt: '5 things you can see right now.', hint: 'Look around. Colors, shapes, textures — be specific.' },
  { count: 4, sense: 'feel', prompt: '4 things you can feel or touch.', hint: 'Your clothes on your skin, the chair, the floor beneath you.' },
  { count: 3, sense: 'hear', prompt: '3 things you can hear.', hint: 'Both near and far. Even the subtle ones.' },
  { count: 2, sense: 'smell', prompt: '2 things you can smell.', hint: 'Even faint. The air, the room, something nearby.' },
  { count: 1, sense: 'taste', prompt: '1 thing you can taste.', hint: 'Whatever is there. Even just the inside of your mouth.' },
];

/**
 * Grounding54321 — Reusable 5-4-3-2-1 sensory grounding module.
 * Can run standalone (from Neural Training) or as a phase inside a reset flow.
 *
 * Props:
 * - onComplete: () => void
 * - accentColor: string
 */
export default function Grounding54321({ onComplete, accentColor = '#219EBC' }) {
  const [phase, setPhase] = useState(0);
  const [showNext, setShowNext] = useState(false);

  // Give the user time to actually notice before the Next button appears
  useEffect(() => {
    setShowNext(false);
    const timer = setTimeout(() => setShowNext(true), 2000);
    return () => clearTimeout(timer);
  }, [phase]);

  const current = SENSE_PHASES[phase];
  const isLast = phase === SENSE_PHASES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setPhase(phase + 1);
    }
  };

  return (
    <div className="text-center" style={{ fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 24,
        }}
      >
        {SENSE_PHASES.map((s, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i <= phase ? accentColor : `${PALETTE.ink}1A`,
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 48,
              fontWeight: 600,
              color: accentColor,
              marginBottom: 8,
            }}
          >
            {current.count}
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 500,
              marginBottom: 12,
              maxWidth: 320,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {current.prompt}
          </h2>
          <p style={{ fontSize: 14, opacity: 0.6, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
            {current.hint}
          </p>
        </motion.div>
      </AnimatePresence>

      <div style={{ marginTop: 40, height: 44 }}>
        {showNext && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            onClick={handleNext}
            style={{
              background: accentColor,
              color: PALETTE.cream,
              border: 'none',
              borderRadius: 24,
              padding: '12px 32px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {isLast ? 'Done' : 'Next'}
            <ChevronRight size={16} />
          </motion.button>
        )}
      </div>
    </div>
  );
}