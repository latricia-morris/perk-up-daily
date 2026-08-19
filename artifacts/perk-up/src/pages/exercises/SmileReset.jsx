import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { pickSmileSequence } from '@/lib/smileBank';

const PALETTE = {
  rose: '#BA1650',
  ember: '#F95826',
  amber: '#FFAD09',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

const LINE_HOLD_MS = 5000;

export default function SmileReset() {
  const navigate = useNavigate();
  const [sequence] = useState(() => pickSmileSequence());
  const [lineIndex, setLineIndex] = useState(0);
  const [showAdvance, setShowAdvance] = useState(false);

  // Build the full line list: opener, cues..., close
  const lines = [sequence.opener, ...sequence.cues, sequence.close];
  const isClose = lineIndex === lines.length - 1;

  // Auto-show the advance button after a brief delay
  useEffect(() => {
    setShowAdvance(false);
    const timer = setTimeout(() => setShowAdvance(true), 1200);
    return () => clearTimeout(timer);
  }, [lineIndex]);

  // Auto-advance for non-close lines
  useEffect(() => {
    if (isClose) return;
    const timer = setTimeout(() => {
      setLineIndex(prev => prev + 1);
    }, LINE_HOLD_MS);
    return () => clearTimeout(timer);
  }, [lineIndex, isClose]);

  const handleAdvance = () => {
    if (isClose) return; // Close screen stays until user taps Done
    setLineIndex(prev => prev + 1);
  };

  const currentLine = lines[lineIndex];

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative"
      style={{
        background: `linear-gradient(160deg, ${PALETTE.page} 0%, #fff5f0 50%, #fbf0f0 100%)`,
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
          color: PALETTE.rose,
          marginBottom: 48,
          opacity: 0.6,
        }}
      >
        Smile
      </p>

      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={lineIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="text-center"
          >
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 500,
                lineHeight: 1.4,
                minHeight: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {currentLine}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 40 }}>
          {lines.map((_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: i <= lineIndex ? PALETTE.rose : `${PALETTE.ink}1A`,
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Advance / Done */}
        <div style={{ marginTop: 40, height: 44 }}>
          {showAdvance && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {isClose ? (
                <button
                  onClick={() => navigate('/reset')}
                  style={{
                    background: PALETTE.rose,
                    color: PALETTE.cream,
                    border: 'none',
                    borderRadius: 24,
                    padding: '12px 36px',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              ) : (
                <button
                  onClick={handleAdvance}
                  style={{
                    background: 'transparent',
                    color: PALETTE.ink,
                    border: 'none',
                    fontSize: 14,
                    opacity: 0.4,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}