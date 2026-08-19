import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Pause, Play } from 'lucide-react';

const PALETTE = {
  amber: '#FFAD09',
  ember: '#F95826',
  teal: '#219EBC',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

const LOOP_DURATIONS = [
  { value: 5, label: '5 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '60 minutes' },
];

function CountdownTimer({ durationSeconds, contextLabel, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const completedRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        clearInterval(interval);
        setIsRunning(false);
        onComplete(true);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [isRunning, durationSeconds, onComplete]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = durationLeft => (1 - durationLeft / durationSeconds) * 100;

  const handleEndEarly = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsRunning(false);
    onComplete(false);
  };

  return (
    <div className="text-center">
      {contextLabel && (
        <div className="rounded-lg px-4 py-3 mb-6 text-sm italic" style={{ background: 'rgba(33,158,188,0.08)', border: `1px solid ${PALETTE.teal}22` }}>
          {contextLabel}
        </div>
      )}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke={`${PALETTE.ink}0A`} strokeWidth="6" />
          <circle cx="100" cy="100" r="90" fill="none" stroke={PALETTE.amber} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress(timeLeft) / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.25s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 600 }}>{formatTime(timeLeft)}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: `${PALETTE.ink}60` }}>
            {isRunning ? 'Go' : 'Paused'}
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
    </div>
  );
}

export default function TaskInitiationExercise() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('T1');
  const [avoidedTask, setAvoidedTask] = useState('');
  const [firstMove, setFirstMove] = useState('');
  const [loopCount, setLoopCount] = useState(0);
  const [loopDuration, setLoopDuration] = useState(300);
  const [showCommitMessage, setShowCommitMessage] = useState(false);

  const handleTimerComplete = (naturally) => {
    setLoopCount(prev => prev + 1);
    setScreen('T4');
  };

  const getCloseCopy = () => {
    return loopCount <= 1
      ? "You didn't have to finish it. You just had to start it — and you did."
      : "Momentum did its job today. You kept going because it got easier once you started.";
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-5 pt-16 pb-32"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${PALETTE.ink}60` }}>
          Task Initiation
        </span>
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* T1: Name the task */}
          {screen === 'T1' && (
            <motion.div key="t1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-center" style={{ color: '#C97F0E' }}>Task Initiation</p>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600 }}>
                What's the task you know you need to do, but haven't started?
              </h2>
              <input type="text" value={avoidedTask} onChange={e => setAvoidedTask(e.target.value)}
                placeholder="Name it..." maxLength={280} autoFocus
                className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-6 text-center"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }} />
              <button onClick={() => setScreen('T2')} className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* T2: Shrink it */}
          {screen === 'T2' && !showCommitMessage && (
            <motion.div key="t2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600 }}>
                What's the smallest first move on this? Something so small it's virtually nonsensical to pull back from it.
              </h2>
              <input type="text" value={firstMove} onChange={e => setFirstMove(e.target.value)}
                placeholder="e.g. 'open the laptop,' not 'write the report'..." maxLength={280} autoFocus
                className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-6"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }} />
              <div className="flex gap-3">
                <button onClick={() => setScreen('T1')} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setShowCommitMessage(true)} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: PALETTE.amber, color: PALETTE.ink }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* T2 commit message */}
          {screen === 'T2' && showCommitMessage && (
            <motion.div key="t2commit" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${PALETTE.amber}33` }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500 }}>
                  We're going to commit to 5 powerhouse minutes of working at this. You can do this, yes?
                </p>
              </div>
              <button onClick={() => { setLoopDuration(300); setScreen('T3'); }}
                className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: PALETTE.amber, color: PALETTE.ink, boxShadow: `0 12px 30px -10px ${PALETTE.amber}66` }}>
                Let's go <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* T3: 5-min auto-start timer */}
          {screen === 'T3' && (
            <motion.div key="t3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <CountdownTimer durationSeconds={loopDuration} contextLabel={firstMove || avoidedTask} onComplete={handleTimerComplete} />
            </motion.div>
          )}

          {/* T4: Keep going or done? */}
          {screen === 'T4' && (
            <motion.div key="t4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                Keep going, or is that enough for today?
              </h2>
              <div className="space-y-3 mb-6">
                <button onClick={() => setScreen('T5')}
                  className="w-full rounded-xl p-4 text-left text-sm font-medium transition-all active:scale-95"
                  style={{ background: `${PALETTE.teal}14`, border: `1px solid ${PALETTE.teal}33` }}>
                  Keep going
                </button>
                <button onClick={() => setScreen('T7')}
                  className="w-full rounded-xl p-4 text-left text-sm font-medium transition-all active:scale-95"
                  style={{ background: `${PALETTE.amber}14`, border: `1px solid ${PALETTE.amber}33` }}>
                  That's enough for today
                </button>
              </div>
            </motion.div>
          )}

          {/* T5: Duration picker */}
          {screen === 'T5' && (
            <motion.div key="t5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                How long do you want to go this time?
              </h2>
              <div className="space-y-3 mb-6">
                {LOOP_DURATIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setLoopDuration(opt.value * 60); setScreen('T6'); }}
                    className="w-full rounded-xl p-4 text-left text-sm font-medium transition-all active:scale-95"
                    style={{ background: `${PALETTE.amber}14`, border: `1px solid ${PALETTE.amber}33` }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setScreen('T4')} className="text-xs flex items-center gap-1 mx-auto" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* T6: Timer (loop) */}
          {screen === 'T6' && (
            <motion.div key="t6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <CountdownTimer durationSeconds={loopDuration} contextLabel={firstMove || avoidedTask} onComplete={handleTimerComplete} />
            </motion.div>
          )}

          {/* T7: Close */}
          {screen === 'T7' && (
            <motion.div key="t7" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <h2 className="mb-8" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                {getCloseCopy()}
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