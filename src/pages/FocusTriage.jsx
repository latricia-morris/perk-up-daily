import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';

const TRIAGE_OPTIONS = [
  {
    id: 'racing',
    label: 'My mind is racing',
    description: 'Thoughts won\'t slow down',
    accent: '#219EBC',
    sequence: ['/exercises/box-breath', '/exercises/focus'],
  },
  {
    id: 'stuck',
    label: 'I can\'t get started',
    description: 'Feeling paralyzed or stalled',
    accent: '#FFAD09',
    sequence: ['/exercises/rewire-in-60'],
  },
  {
    id: 'loop',
    label: 'I\'m stuck in a thought loop',
    description: 'Replaying something over and over',
    accent: '#5C3B8F',
    sequence: ['/exercises/instinct-vs-insight'],
  },
  {
    id: 'overwhelmed',
    label: 'I\'m overwhelmed',
    description: 'Too much coming at once',
    accent: '#F95826',
    sequence: ['/exercises/breathe', '/exercises/sigh'],
  },
  {
    id: 'tense',
    label: 'I\'m tense and on edge',
    description: 'Body feels tight and braced',
    accent: '#BA1650',
    sequence: ['/exercises/smile', '/exercises/breathe'],
  },
  {
    id: 'just-breathe',
    label: 'I just need to breathe',
    description: 'Simple reset, nothing fancy',
    accent: '#219EBC',
    sequence: ['/exercises/box-breath'],
  },
];

export default function FocusTriage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    setSelected(option.id);
    setTimeout(() => {
      navigate(option.sequence[0], {
        state: { sequence: option.sequence, step: 0 },
      });
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
          What kind of focus do you need?
        </h1>
        <p className="text-sm" style={{ color: '#c4a882' }}>
          We'll match you with the right exercise sequence.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
        <AnimatePresence>
          {TRIAGE_OPTIONS.map((option, i) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => handleSelect(option)}
              className="rounded-2xl p-5 text-left transition-all hover:shadow-lg active:scale-95 flex items-center justify-between"
              style={{
                background: selected === option.id
                  ? `linear-gradient(135deg, ${option.accent} 0%, ${option.accent}CC 100%)`
                  : `linear-gradient(135deg, ${option.accent}14 0%, ${option.accent}0A 100%)`,
                border: `1px solid ${option.accent}33`,
                color: selected === option.id ? '#FFFCF2' : '#2c1e0f',
              }}
            >
              <div>
                <div className="text-base font-display font-semibold mb-0.5">{option.label}</div>
                <div className="text-xs" style={{
                  color: selected === option.id ? 'rgba(255,252,242,0.8)' : '#7a5c3a',
                }}>
                  {option.description}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: selected === option.id ? '#FFFCF2' : option.accent }} />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}