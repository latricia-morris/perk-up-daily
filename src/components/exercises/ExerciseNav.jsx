import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Check } from 'lucide-react';

/**
 * Floating navigation bar for exercise pages.
 * Shows a back button, and when part of a Reset sequence,
 * shows step progress and a "Next" / "Done" button.
 */
export default function ExerciseNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const sequence = location.state?.sequence || [];
  const step = location.state?.step || 0;
  const hasSequence = sequence.length > 0;

  const handleNext = () => {
    if (step + 1 < sequence.length) {
      navigate(sequence[step + 1], { state: { sequence, step: step + 1 } });
    } else {
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (hasSequence && step > 0) {
      navigate(sequence[step - 1], { state: { sequence, step: step - 1 } });
    } else if (hasSequence) {
      navigate('/reset');
    } else {
      navigate(-1);
    }
  };

  if (!hasSequence) {
    return (
      <button
        onClick={handleBack}
        className="fixed top-0 left-0 z-[60] flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 12px), 12px)', color: '#2F2C29' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
    );
  }

  const isLast = step + 1 >= sequence.length;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 py-2.5"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 8px), 8px)',
        background: 'linear-gradient(180deg, rgba(251,246,239,0.92) 0%, rgba(251,246,239,0) 100%)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: '#2F2C29' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-1.5">
        {sequence.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === step ? 20 : 6,
              background: i <= step ? '#D4830A' : 'rgba(47,44,41,0.15)',
            }}
          />
        ))}
      </div>

      <button
        onClick={handleNext}
        className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95"
        style={{ background: '#D4830A', color: '#FFFCF2' }}
      >
        {isLast ? (
          <><Check className="w-4 h-4" /> Done</>
        ) : (
          <>Next <ChevronRight className="w-4 h-4" /></>
        )}
      </button>
    </div>
  );
}