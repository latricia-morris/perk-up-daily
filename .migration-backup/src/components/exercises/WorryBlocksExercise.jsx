import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Pause, Play } from 'lucide-react';

const PALETTE = {
  amber: '#FFAD09',
  teal: '#219EBC',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

const DURATION_OPTIONS = [
  { label: '5 minutes', seconds: 300 },
  { label: '10 minutes', seconds: 600 },
];

export default function WorryBlocksExercise() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [thought, setThought] = useState('');
  const [duration, setDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(true);
  const [notes, setNotes] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [endedEarly, setEndedEarly] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (step === 3 && isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setStep(4);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [step, isRunning, timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  const handleEndEarly = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setEndedEarly(true);
    setStep(4);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-5 pt-16 pb-32"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${PALETTE.ink}60` }}>
          Worry-Blocks · Step {step} of 4
        </span>
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* B1: Name What's On Your Mind */}
          {step === 1 && (
            <motion.div key="b1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-center" style={{ color: '#C97F0E' }}>Worry-Blocks</p>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600 }}>
                What's on your mind that keeps pulling your attention today?
              </h2>
              <textarea
                value={thought}
                onChange={e => setThought(e.target.value)}
                placeholder="Type what's on your mind…"
                rows={3}
                maxLength={280}
                autoFocus
                className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6 text-center"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
              />
              <button onClick={() => setStep(2)} className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* B2: Set the Timer */}
          {step === 2 && (
            <motion.div key="b2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                Give this your full attention for a few minutes. How long do you want?
              </h2>
              <div className="flex gap-3 mb-8">
                {DURATION_OPTIONS.map(opt => (
                  <button key={opt.seconds} onClick={() => { setDuration(opt.seconds); setTimeLeft(opt.seconds); setStep(3); }}
                    className="flex-1 rounded-xl py-5 text-sm font-medium transition-all active:scale-95"
                    style={{ background: `${PALETTE.teal}14`, border: `1px solid ${PALETTE.teal}33`, color: PALETTE.ink }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="text-xs flex items-center gap-1 mx-auto" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* B3: The Processing Window */}
          {step === 3 && (
            <motion.div key="b3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="rounded-lg px-4 py-3 mb-6 text-sm italic text-center" style={{ background: 'rgba(33,158,188,0.08)', border: `1px solid ${PALETTE.teal}22` }}>
                "{thought || 'Your thought'}"
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="relative w-48 h-48 mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke={`${PALETTE.ink}0A`} strokeWidth="6" />
                    <circle cx="100" cy="100" r="90" fill="none" stroke={PALETTE.teal} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 90}`}
                      strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 600 }}>{formatTime(timeLeft)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: `${PALETTE.ink}60` }}>
                      {isRunning ? 'Processing' : 'Paused'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setIsRunning(r => !r)} className="rounded-full px-5 py-2.5 text-sm font-medium transition-all active:scale-95 flex items-center gap-2"
                  style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                  {isRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
                </button>
              </div>

              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Let yourself actually think this through. Whatever comes up, let it."
                rows={3}
                maxLength={500}
                className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
              />

              {showEndConfirm ? (
                <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.6)', border: `1px solid ${PALETTE.ink}1A` }}>
                  <p className="text-sm mb-3">End this early?</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowEndConfirm(false)} className="flex-1 rounded-full py-2.5 text-sm font-medium"
                      style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                      No
                    </button>
                    <button onClick={handleEndEarly} className="flex-1 rounded-full py-2.5 text-sm font-medium"
                      style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                      Yes
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowEndConfirm(true)} className="text-xs mx-auto block" style={{ color: `${PALETTE.ink}60` }}>
                  End early
                </button>
              )}
            </motion.div>
          )}

          {/* B4: Close */}
          {step === 4 && (
            <motion.div key="b4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <h2 className="mb-8" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                {endedEarly
                  ? "That's okay to stop here. You gave it what you could right now."
                  : "That's your time for this. You gave it real attention — you can set it down now."}
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