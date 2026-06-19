import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShareCard from '@/components/shared/ShareCard';

export default function ReflectionCard({ item, featured = false }) {
  const navigate = useNavigate();
  const [detailOpen, setDetailOpen] = useState(false);
  const promptText = item.title || 'Reflection';
  const answerText = item.body || '';

  const handleElevate = (e) => {
    e.stopPropagation();
    navigate('/elevate-reflection', { state: { entry: item } });
  };

  if (featured) {
    return (
      <motion.div
        onClick={() => setDetailOpen(true)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl cursor-pointer transition-shadow hover:shadow-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(212,131,10,0.14) 0%, #fffdf8 60%)',
          border: '1px solid rgba(212,131,10,0.2)',
          boxShadow: '0 4px 24px rgba(212,131,10,0.10)',
        }}
      >
        {/* We asked */}
        <div
          className="px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid rgba(212,131,10,0.1)' }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3" style={{ color: '#C97F0E' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#C97F0E' }}>Reflection:</span>
          </div>
          <p className="font-display text-sm italic leading-relaxed" style={{ color: '#7a5c3a' }}>
            {promptText}
          </p>
        </div>

        {/* You said */}
        <div className="px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#C97F0E' }}>You said:</p>
           <p className="font-display text-lg md:text-xl italic leading-relaxed" style={{ color: '#2c1e0f' }}>
             "{answerText}"
           </p>

          <div className="mt-5 flex items-center justify-center gap-3 absolute bottom-6 right-6">
            <Button
              onClick={(e) => { e.stopPropagation(); handleElevate(e); }}
              size="sm"
              className="gap-2"
              style={{ background: 'rgba(212,131,10,0.12)', color: '#C97F0E', border: '1px solid rgba(212,131,10,0.2)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Elevate
            </Button>
            <ShareCard item={item} />
          </div>
        </div>
      </motion.div>
    );
  }

  // Non-featured (supporting tile)
  return (
    <>
      <motion.div
        onClick={() => setDetailOpen(true)}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="cursor-pointer rounded-xl p-4 transition-shadow hover:shadow-md"
        style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.07)', boxShadow: '0 1px 4px rgba(44,30,15,0.06)' }}
      >
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3 h-3" style={{ color: '#C97F0E' }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#C97F0E' }}>Reflection</span>
        </div>

        {/* We asked */}
        <p className="text-[10px] italic mb-1" style={{ color: '#c4a882' }}>
          We asked: {promptText}
        </p>

        {/* You said */}
        <p className="font-display text-sm italic leading-relaxed line-clamp-3" style={{ color: '#2c1e0f' }}>
          "{answerText}"
        </p>

        <div className="flex items-center gap-2 mt-3">
          <Button
            onClick={(e) => { e.stopPropagation(); handleElevate(e); }}
            size="sm"
            variant="ghost"
            className="text-xs gap-1 h-auto px-2 py-1"
            style={{ color: '#C97F0E' }}
          >
            <Sparkles className="w-3 h-3" />
            Elevate
          </Button>
          <div onClick={(e) => e.stopPropagation()}>
            <ShareCard item={item} />
          </div>
        </div>
      </motion.div>
    </>
  );
}