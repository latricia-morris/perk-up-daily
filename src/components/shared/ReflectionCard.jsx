import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShareCard from '@/components/shared/ShareCard';

export default function ReflectionCard({ item, featured = false }) {
  const navigate = useNavigate();
  const promptText = item.title || 'Reflection';
  const answerText = item.body || '';

  const handleElevate = (e) => {
    e.stopPropagation();
    navigate('/elevate-reflection', { state: { entry: item } });
  };

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(186,22,80,0.12) 0%, #fffdf8 60%)',
          border: '1px solid rgba(186,22,80,0.22)',
          boxShadow: '0 4px 24px rgba(186,22,80,0.10)',
        }}
      >
        {/* We asked */}
        <div
          className="px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid rgba(186,22,80,0.1)' }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3" style={{ color: '#BA1650' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#BA1650' }}>We asked:</span>
          </div>
          <p className="font-display text-sm italic leading-relaxed" style={{ color: '#7a5c3a' }}>
            {promptText}
          </p>
        </div>

        {/* You said */}
        <div className="px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#BA1650' }}>You said:</p>
          <p className="font-display text-xl md:text-2xl italic leading-relaxed" style={{ color: '#2c1e0f' }}>
            "{answerText}"
          </p>

          <div className="mt-5 flex items-center gap-3">
            <Button
              onClick={handleElevate}
              size="sm"
              className="gap-2"
              style={{ background: 'rgba(186,22,80,0.12)', color: '#BA1650', border: '1px solid rgba(186,22,80,0.25)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Elevate my answer
            </Button>
            <ShareCard item={item} />
          </div>
        </div>
      </motion.div>
    );
  }

  // Non-featured (supporting tile)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl p-4"
      style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.07)', boxShadow: '0 1px 4px rgba(44,30,15,0.06)' }}
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <Sparkles className="w-3 h-3" style={{ color: '#BA1650' }} />
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#BA1650' }}>Reflection</span>
      </div>

      {/* We asked */}
      <p className="text-[10px] italic mb-1" style={{ color: '#c4a882' }}>
        We asked: {promptText}
      </p>

      {/* You said */}
      <p className="font-display text-sm italic leading-relaxed line-clamp-3" style={{ color: '#2c1e0f' }}>
        "{answerText}"
      </p>

      <div className="mt-3">
        <button
          onClick={handleElevate}
          className="flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-70"
          style={{ color: '#BA1650' }}
        >
          <Sparkles className="w-3 h-3" />
          Elevate my answer
        </button>
      </div>
    </motion.div>
  );
}