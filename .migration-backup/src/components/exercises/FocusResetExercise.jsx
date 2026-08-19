import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Pause, Play } from 'lucide-react';

const PALETTE = {
  amber: '#FFAD09',
  ember: '#F95826',
  teal: '#219EBC',
  purple: '#5C3B8F',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 25, label: '25 minutes', recommended: true },
  { value: 45, label: '45 minutes' },
];

const RATING_OPTIONS = [
  { id: 'really_focused', label: 'Really focused' },
  { id: 'focused_in_parts', label: 'Focused in parts' },
  { id: 'still_distracted', label: 'Still pretty distracted' },
];

const CLOSE_COPY = {
  really_focused: 'You showed up and gave it your full attention. That\'s the whole thing.',
  focused_in_parts: 'Parts of that were real focus. That\'s enough to build on.',
  still_distracted: 'You sat down and tried. That\'s not nothing — that\'s the first rep.',
};

export default function FocusResetExercise() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('F1');
  const [focusTask, setFocusTask] = useState('');
  const [duration, setDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [completedNaturally, setCompletedNaturally] = useState(null);
  const [rating, setRating] = useState(null);
  const completedRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  // Timer
  useEffect(() => {
    if (screen !== 'F3') return;
    startTimeRef.current = Date.now();
    setIsRunning(true);
    setTimeLeft(duration);
    completedRef.current = false;
  }, [screen, duration]);

  useEffect(() => {
    if (screen !== 'F3' || !isRunning) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        clearInterval(interval);
        setIsRunning(false);
        setCompletedNaturally(true);
        setTimeout(() => setScreen('F4'), 500);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [screen, isRunning, duration]);

  const handleEndEarly = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsRunning(false);
    setCompletedNaturally(false);
    setScreen('F4');
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (1 - timeLeft / duration) * 100;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-5 pt-16 pb-32"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${PALETTE.ink}60` }}>
          Focus Reset
        </span>
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* F1: Name the focus task */}
          {screen === 'F1' && (
            <motion.div key="f1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-center" style={{ color: '#C97F0E' }}>Focus Reset</p>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600 }}>
                What do you want to focus on right now?
              </h2>
              <input type="text" value={focusTask} onChange={e => setFocusTask(e.target.value)}
                placeholder="Name it..." maxLength={280} autoFocus
                className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-6 text-center"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }} />
              <button onClick={() => setScreen('F2')} className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* F2: Duration picker */}
          {screen === 'F2' && (
            <motion.div key="f2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                How long do you want to focus?
              </h2>
              <div className="space-y-3 mb-6">
                {DURATION_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setDuration(opt.value * 60); setTimeLeft(opt.value * 60); setScreen('F3'); }}
                    className="w-full rounded-xl p-4 text-left text-sm font-medium transition-all active:scale-95 flex items-center justify-between"
                    style={{ background: `${PALETTE.purple}14`, border: `1px solid ${PALETTE.purple}33` }}>
                    <span>{opt.label}</span>
                    {opt.recommended && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ background: `${PALETTE.purple}1A`, color: PALETTE.purple }}>
                        Suggested
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <button onClick={() => setScreen('F1')} className="text-xs flex items-center gap-1 mx-auto" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* F3: Active timer */}
          {screen === 'F3' && (
            <motion.div key="f3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="text-center">
              {focusTask && (
                <div className="rounded-lg px-4 py-3 mb-6 text-sm italic" style={{ background: 'rgba(92,59,143,0.08)', border: `1px solid ${PALETTE.purple}22` }}>
                  {focusTask}
                </div>
              )}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke={`${PALETTE.ink}0A`} strokeWidth="6" />
                  <circle cx="100" cy="100" r="90" fill="none" stroke={PALETTE.purple} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 90}`}
                    strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.25s linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 600 }}>{formatTime(timeLeft)}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: `${PALETTE.ink}60` }}>
                    {isRunning ? 'Focus' : 'Paused'}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsRunning(r => !r)} disabled={showEndConfirm}
                className="rounded-full px-5 py-2.5 text-sm font-medium transition-all active:scale-95 flex items-center gap-2 mx-auto mb-4 disabled:opacity-40"
                style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                {isRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
              </button>
              {showEndConfirm ? (
                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.6)', border: `1px solid ${PALETTE.ink}1A` }}>
                  <p className="text-sm mb-3">End this early?</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowEndConfirm(false)} className="flex-1 rounded-full py-2.5 text-sm font-medium"
                      style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>No</button>
                    <button onClick={handleEndEarly} className="flex-1 rounded-full py-2.5 text-sm font-medium"
                      style={{ background: PALETTE.ink, color: PALETTE.cream }}>Yes</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowEndConfirm(true)} className="text-xs" style={{ color: `${PALETTE.ink}60`, opacity: 0.6 }}>
                  End early
                </button>
              )}
            </motion.div>
          )}

          {/* F4: Check-in */}
          {screen === 'F4' && (
            <motion.div key="f4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                How did that go?
              </h2>
              <div className="space-y-3 mb-6">
                {RATING_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => { setRating(opt.id); setScreen('F5'); }}
                    className="w-full rounded-xl p-4 text-left text-sm font-medium transition-all active:scale-95"
                    style={{ background: `${PALETTE.purple}14`, border: `1px solid ${PALETTE.purple}33` }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* F5: Close */}
          {screen === 'F5' && (
            <motion.div key="f5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <h2 className="mb-8" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                {CLOSE_COPY[rating] || CLOSE_COPY.still_distracted}
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