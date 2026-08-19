import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check, Play, Pause } from 'lucide-react';
import TeachItBack from '@/components/exercises/TeachItBack';

const PALETTE = {
  amber: '#FFAD09',
  ember: '#F95826',
  teal: '#219EBC',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

const DURATION_OPTIONS = [
  { label: '1 min', seconds: 60 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
];

export default function IntentionTimerExercise() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [intention, setIntention] = useState('');
  const [duration, setDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
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
  }, [isRunning]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  const reset = () => {
    setStep(1);
    setIntention('');
    setDuration(300);
    setTimeLeft(300);
    setIsRunning(false);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center px-5"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${PALETTE.ink}60` }}>
          {step <= 3 ? `Step ${step} of 4` : 'Complete'}
        </span>
      </div>

      {/* STEP 1: Set Intention */}
      {step === 1 && (
        <div className="text-center max-w-md w-full">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#C97F0E' }}>
            Intention Timer
          </p>
          <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: PALETTE.ink }}>
            What do you want to focus on?
          </h2>
          <p className="text-sm mb-8" style={{ color: `${PALETTE.ink}A6` }}>
            Name one intention — something you want to give your full attention to for the next few minutes.
          </p>
          <textarea
            value={intention}
            onChange={e => setIntention(e.target.value)}
            placeholder="e.g. Be fully present while reading…"
            rows={3}
            maxLength={200}
            className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6 text-center"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)', color: PALETTE.ink }}
          />
          <button
            onClick={() => setStep(2)}
            disabled={!intention.trim()}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Choose Duration */}
      {step === 2 && (
        <div className="text-center max-w-md w-full">
          <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: PALETTE.ink }}>
            How long?
          </h2>
          <p className="text-sm mb-8" style={{ color: `${PALETTE.ink}A6` }}>
            Pick a duration that feels right for your intention.
          </p>
          <div className="flex gap-3 mb-8">
            {DURATION_OPTIONS.map(opt => (
              <button
                key={opt.seconds}
                onClick={() => { setDuration(opt.seconds); setTimeLeft(opt.seconds); }}
                className="flex-1 rounded-xl py-4 text-sm font-medium transition-all active:scale-95"
                style={{
                  background: duration === opt.seconds ? PALETTE.amber : `${PALETTE.ink}0A`,
                  color: duration === opt.seconds ? PALETTE.ink : `${PALETTE.ink}80`,
                  border: `1px solid ${duration === opt.seconds ? PALETTE.amber : 'transparent'}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95"
              style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: PALETTE.amber, color: PALETTE.ink, boxShadow: `0 12px 30px -10px ${PALETTE.amber}66` }}
            >
              Start <Play className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Active Timer */}
      {step === 3 && (
        <div className="text-center max-w-md w-full flex flex-col items-center">
          <p className="text-sm italic mb-6 max-w-xs" style={{ color: `${PALETTE.ink}A6`, fontFamily: "'Playfair Display', serif" }}>
            "{intention}"
          </p>

          {/* Progress ring */}
          <div className="relative w-56 h-56 mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke={`${PALETTE.ink}0A`} strokeWidth="6" />
              <circle
                cx="100" cy="100" r="90" fill="none"
                stroke={PALETTE.amber}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 600, color: PALETTE.ink }}>
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: `${PALETTE.ink}60` }}>
                {isRunning ? 'Focusing' : 'Paused'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => setIsRunning(r => !r)}
              className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: PALETTE.ink, color: PALETTE.cream }}
            >
              {isRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
            </button>
            <button
              onClick={() => { clearInterval(intervalRef.current); setStep(4); }}
              className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95"
              style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}
            >
              Done Early
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Completion */}
      {step === 4 && (
        <div className="max-w-md w-full">
          <div className="mb-6 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: `linear-gradient(135deg, ${PALETTE.amber} 0%, ${PALETTE.ember} 100%)` }}>
              <Check className="w-7 h-7" style={{ color: PALETTE.cream }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: PALETTE.ink }}>
              You held that focus.
            </h2>
            <p className="text-sm mt-2" style={{ color: `${PALETTE.ink}A6` }}>
              You gave your attention to: "{intention}"
            </p>
          </div>
          <TeachItBack exerciseType="intention-timer" onClose={() => navigate('/neural-training')} />
        </div>
      )}
    </div>
  );
}