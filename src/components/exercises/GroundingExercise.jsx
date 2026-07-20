import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Check } from 'lucide-react';

const PALETTE = {
  amber: '#FFAD09',
  rose: '#BA1650',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

export default function GroundingExercise() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('G1');
  const [task, setTask] = useState('');
  const [showContinue, setShowContinue] = useState(false);

  // G1: Stillness beat — 2s delay before Continue button appears
  useEffect(() => {
    if (screen !== 'G1') return;
    setShowContinue(false);
    const timer = setTimeout(() => setShowContinue(true), 2000);
    return () => clearTimeout(timer);
  }, [screen]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-5 pt-16 pb-32"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${PALETTE.ink}60` }}>
          Grounding Reset
        </span>
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* G1: Stillness Beat */}
          {screen === 'G1' && (
            <motion.div key="g1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#C97F0E' }}>Grounding Reset</p>
              <h2 className="mb-12" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600 }}>
                Take a moment. Just be here.
              </h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showContinue ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ pointerEvents: showContinue ? 'auto' : 'none' }}
              >
                <button onClick={() => setScreen('G2')}
                  className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: PALETTE.rose, color: PALETTE.cream }}>
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
              {!showContinue && (
                <div className="w-8 h-8 mx-auto mt-4">
                  <div className="w-2 h-2 rounded-full mx-auto animate-pulse" style={{ background: PALETTE.rose }} />
                </div>
              )}
            </motion.div>
          )}

          {/* G2: Name the one thing */}
          {screen === 'G2' && (
            <motion.div key="g2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                What's the one thing you want to bring your attention to right now?
              </h2>
              <input type="text" value={task} onChange={e => setTask(e.target.value)}
                placeholder="Just one thing..." maxLength={280} autoFocus
                className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-6 text-center"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }} />
              <button onClick={() => setScreen('G3')} className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* G3: Commit to this */}
          {screen === 'G3' && (
            <motion.div key="g3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${PALETTE.rose}33` }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: PALETTE.rose }}>
                  Your one thing
                </p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500 }}>
                  {task || '—'}
                </p>
              </div>
              <p className="text-sm mb-8" style={{ color: `${PALETTE.ink}A6` }}>
                Give it your full attention. Nothing else right now.
              </p>
              <button onClick={() => setScreen('G4')}
                className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: PALETTE.rose, color: PALETTE.cream, boxShadow: `0 12px 30px -10px ${PALETTE.rose}66` }}>
                Commit to this <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setScreen('G2')} className="text-xs flex items-center gap-1 mx-auto mt-3" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* G4: Close */}
          {screen === 'G4' && (
            <motion.div key="g4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <h2 className="mb-8" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                One thing, fully here. That's enough.
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