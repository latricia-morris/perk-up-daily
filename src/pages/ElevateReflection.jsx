import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ElevateReflection() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Entry is passed via navigation state
  const [entry, setEntry] = useState(null);
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Read entry from location state
    const state = window.history.state?.usr;
    if (state?.entry) {
      setEntry(state.entry);
      setAnswer(state.entry.body || '');
    } else {
      navigate('/reflections', { replace: true });
    }
  }, [navigate]);

  const saveMutation = useMutation({
    mutationFn: () =>
      base44.entities.UserEntry.update(entry.id, {
        body: answer.trim(),
      }),
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['past-reflections'] });
      queryClient.invalidateQueries({ queryKey: ['user-entries'] });
      setTimeout(() => {
        navigate(-1);
      }, 1200);
    },
  });

  if (!entry) return null;

  const canSave = answer.trim().length >= 3 && answer.trim() !== entry.body && !saved;
  const promptText = entry.title || 'Reflection';

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-8 transition-opacity hover:opacity-70"
        style={{ color: '#7a5c3a' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4" style={{ color: '#C97F0E' }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#C97F0E' }}>
            Elevate My Answer
          </span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold" style={{ color: '#2c1e0f' }}>
          You've grown. Let your answer reflect that.
        </h1>
        <p className="text-sm mt-1" style={{ color: '#c4a882' }}>
          Refine your response. Only your latest answer appears in your Perk Ups.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl overflow-hidden"
        style={{
          border: '1px solid rgba(212,131,10,0.2)',
          boxShadow: '0 4px 24px rgba(212,131,10,0.09)',
        }}
      >
        {/* We asked */}
        <div
          className="px-6 py-5"
          style={{ background: 'linear-gradient(135deg, rgba(212,131,10,0.10) 0%, rgba(212,131,10,0.04) 100%)', borderBottom: '1px solid rgba(212,131,10,0.12)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#C97F0E' }}>
            We asked:
          </p>
          <p className="font-display text-base italic leading-relaxed" style={{ color: '#2c1e0f' }}>
            {promptText}
          </p>
        </div>

        {/* Elevate answer */}
        <div className="px-6 py-5" style={{ background: '#fffdf8' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#7a5c3a' }}>
            Your answer:
          </p>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            rows={6}
            maxLength={1200}
            className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(212,131,10,0.18)',
              color: '#2c1e0f',
              fontFamily: 'var(--font-body)',
            }}
            onFocus={e => { e.target.style.border = '1px solid rgba(212,131,10,0.5)'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.border = '1px solid rgba(212,131,10,0.18)'; e.target.style.background = 'rgba(255,255,255,0.7)'; }}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px]" style={{ color: '#c4a882' }}>
              {answer.length > 0 ? `${answer.length} / 1200` : ''}
            </span>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!canSave || saveMutation.isPending}
              size="sm"
              className="min-w-[130px] transition-all"
              style={saved
                ? { background: '#4a7c59', color: '#fff' }
                : { background: '#D0902D', color: '#fff' }
              }
            >
              {saved ? (
                <><Check className="w-3.5 h-3.5 mr-1.5" />Elevated!</>
              ) : saveMutation.isPending ? (
                'Saving…'
              ) : (
                <><Sparkles className="w-3.5 h-3.5 mr-1.5" />Save Elevation</>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}