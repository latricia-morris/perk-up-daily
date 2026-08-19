import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RESET_OPTIONS } from '@/lib/exerciseRegistry';
import ResetIcon from '@/components/ResetIcon';

export default function Reset() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    setSelected(option.id);
    if (option.id === 'focus') {
      navigate('/focus-triage');
    } else if (option.flow) {
      navigate(option.flow);
    } else {
      navigate(option.sequence[0], {
        state: { sequence: option.sequence, step: 0 },
      });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: 'linear-gradient(160deg, #fbf6ef 0%, #fffdf8 50%, #fbf3e8 100%)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 120px)',
      }}
    >
      <div className="text-center mb-10 max-w-md">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #E8A838 0%, #d4830a 100%)' }}
        >
          <ResetIcon className="w-7 h-7" style={{ color: '#FFFCF2' }} />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold mb-2" style={{ color: '#2c1e0f' }}>
          What do you most need right now?
        </h1>
        <p className="text-sm" style={{ color: '#c4a882' }}>
          Choose one and we'll run a curated sequence of Neural Training exercises for you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {RESET_OPTIONS.map((option) => (
          <button
             key={option.id}
            onClick={() => handleSelect(option)}
            className="rounded-2xl p-5 text-center transition-all hover:shadow-lg active:scale-95"
            style={{
              background: selected === option.id
                ? `linear-gradient(135deg, ${option.accent} 0%, ${option.accent}CC 100%)`
                : `linear-gradient(135deg, ${option.accent}14 0%, ${option.accent}0A 100%)`,
              border: `1px solid ${option.accent}33`,
              color: selected === option.id ? '#FFFCF2' : '#2c1e0f',
            }}
          >
            <div className="text-lg font-display font-semibold mb-0.5">{option.label}</div>
            <div className="text-xs" style={{
              color: selected === option.id ? 'rgba(255,252,242,0.8)' : '#7a5c3a',
            }}>
              {option.description}
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs mt-8" style={{ color: '#c4a882' }}>
        Each sequence is tailored to what you need most.
      </p>
    </div>
  );
}