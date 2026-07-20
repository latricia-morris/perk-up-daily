import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';

const TRIAGE_OPTIONS = [
  {
    id: 'overwhelmed',
    label: 'I have too much to do and don\'t know where to start',
    accent: '#F95826',
    route: '/exercises/impact-prioritization',
    status: 'active',
  },
  {
    id: 'stuck',
    label: 'I know what to do, but I can\'t seem to start it',
    accent: '#FFAD09',
    exerciseName: 'Task Initiation',
    status: 'coming_soon',
  },
  {
    id: 'unstructured',
    label: 'My day feels unstructured, I need a plan',
    accent: '#219EBC',
    exerciseName: 'Time Blocking',
    status: 'coming_soon',
  },
  {
    id: 'distracted',
    label: 'I\'m distracted and can\'t concentrate on anything',
    accent: '#5C3B8F',
    exerciseName: 'Focus Reset',
    status: 'coming_soon',
  },
  {
    id: 'scattered',
    label: 'My mind feels scattered, not overloaded',
    accent: '#BA1650',
    exerciseName: 'Grounding Reset',
    status: 'coming_soon',
  },
  {
    id: 'not-sure',
    label: 'Not sure, just pick for me',
    accent: '#C97F0E',
    route: '/exercises/impact-prioritization',
    status: 'active',
  },
];

export default function FocusTriage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    setSelected(option.id);
    setTimeout(() => {
      if (option.status === 'coming_soon') {
        navigate('/coming-soon', { state: { exerciseName: option.exerciseName } });
      } else {
        navigate(option.route, {
          state: { sequence: option.sequence, step: 0 },
        });
      }
    }, 300);
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: 'linear-gradient(160deg, #fbf6ef 0%, #fffdf8 50%, #fbf3e8 100%)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 120px)',
      }}
    >
      <button
        onClick={() => navigate('/reset')}
        className="absolute top-6 left-6 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium backdrop-blur-md transition-all active:scale-95"
        style={{ background: 'rgba(255,252,242,0.8)', color: '#2F2C29', border: '1px solid rgba(47,44,41,0.12)' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10 max-w-md"
      >
        <h1 className="font-display text-2xl md:text-3xl font-semibold mb-2" style={{ color: '#2c1e0f' }}>
          What's pulling at your focus right now?
        </h1>
        <p className="text-sm" style={{ color: '#c4a882' }}>
          Tap whichever resonates — there's no wrong answer.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 w-full max-w-md">
        <AnimatePresence>
          {TRIAGE_OPTIONS.map((option, i) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => handleSelect(option)}
              className="rounded-2xl p-4 text-left transition-all hover:shadow-lg active:scale-95 flex items-center justify-between"
              style={{
                background: selected === option.id
                  ? `linear-gradient(135deg, ${option.accent} 0%, ${option.accent}CC 100%)`
                  : `linear-gradient(135deg, ${option.accent}14 0%, ${option.accent}0A 100%)`,
                border: `1px solid ${option.accent}33`,
                color: selected === option.id ? '#FFFCF2' : '#2c1e0f',
              }}
            >
              <div className="flex-1 pr-2">
                <div className="text-sm font-medium leading-snug">{option.label}</div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: selected === option.id ? '#FFFCF2' : option.accent }} />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}