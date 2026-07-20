import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

/**
 * ExerciseShell — wraps exercise components with floating navigation.
 * Back button is always in the bottom-left corner.
 * When part of a Reset sequence (passed via router state), shows progress + Next button.
 */
export default function ExerciseShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const sequence = location.state?.sequence || [];
  const step = location.state?.step || 0;
  const isInSequence = sequence.length > 0;

  const handleNext = () => {
    if (step + 1 < sequence.length) {
      navigate(sequence[step + 1], {
        state: { sequence, step: step + 1 }
      });
    } else {
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (isInSequence && step > 0) {
      navigate(sequence[step - 1], { state: { sequence, step: step - 1 } });
    } else if (isInSequence) {
      navigate('/reset');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="relative">
      {/* Bottom-left back button — always visible */}
      <button
        onClick={handleBack}
        className="fixed bottom-6 left-6 z-[60] flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium backdrop-blur-md transition-all active:scale-95"
        style={{
          background: 'rgba(255,252,242,0.8)',
          color: '#2F2C29',
          border: '1px solid rgba(47,44,41,0.12)',
          boxShadow: '0 2px 12px rgba(47,44,41,0.08)',
          paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))',
        }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {isInSequence ? 'End' : 'Back'}
      </button>

      {/* Sequence progress (top-right, only when in a Reset sequence) */}
      {isInSequence && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-2">
          <span
            className="text-xs font-medium px-2.5 py-1.5 rounded-full backdrop-blur-md"
            style={{ background: 'rgba(255,252,242,0.8)', color: '#2F2C29', border: '1px solid rgba(47,44,41,0.12)' }}
          >
            Step {step + 1} of {sequence.length}
          </span>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all active:scale-95"
            style={{ background: 'rgba(255,252,242,0.85)', color: '#2F2C29', border: '1px solid rgba(47,44,41,0.12)' }}
          >
            {step + 1 >= sequence.length ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            {step + 1 >= sequence.length ? 'Done' : 'Next'}
          </button>
        </div>
      )}
      {children}
    </div>
  );
}