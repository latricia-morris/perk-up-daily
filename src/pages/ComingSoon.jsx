import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function ComingSoon() {
  const navigate = useNavigate();
  const location = useLocation();
  const exerciseName = location.state?.exerciseName || 'This exercise';

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: 'linear-gradient(160deg, #fbf6ef 0%, #fffdf8 50%, #fbf3e8 100%)',
        fontFamily: "'DM Sans', sans-serif",
      }}>
      <button
        onClick={() => navigate('/reset')}
        className="absolute top-6 left-6 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium backdrop-blur-md transition-all active:scale-95"
        style={{ background: 'rgba(255,252,242,0.8)', color: '#2F2C29', border: '1px solid rgba(47,44,41,0.12)' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #E8A838 0%, #d4830a 100%)' }}>
          <Sparkles className="w-8 h-8" style={{ color: '#FFFCF2' }} />
        </div>
        <h1 className="font-display text-2xl font-semibold mb-3" style={{ color: '#2c1e0f' }}>
          {exerciseName}
        </h1>
        <p className="text-sm mb-8" style={{ color: '#7a5c3a' }}>
          This exercise is being crafted with care and will be available soon. We want to get it right for you.
        </p>
        <button
          onClick={() => navigate('/reset')}
          className="rounded-full py-3 px-8 text-sm font-medium transition-all active:scale-95"
          style={{ background: '#2F2C29', color: '#FFFCF2' }}
        >
          Back to Reset
        </button>
      </div>
    </div>
  );
}