import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Check, ChevronDown, ChevronUp, Pencil, Sparkles, Share2, Atom } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import ShareCard from '@/components/shared/ShareCard';

// Fallback prompts if no library prompts exist yet
const FALLBACK_PROMPTS = [
  { id: 'f1', prompt: 'What is one truth I am choosing to see about myself today?', category: 'general' },
  { id: 'f2', prompt: 'What is the single next step that moves the needle most right now?', category: 'general' },
  { id: 'f3', prompt: 'What win from this week am I not giving myself credit for?', category: 'general' },
  { id: 'f4', prompt: 'What would I do today if I knew it was already working?', category: 'general' },
  { id: 'f5', prompt: 'Where am I playing small, and what does playing full out look like?', category: 'general' },
  { id: 'f6', prompt: 'What is something I have right now that I once prayed for?', category: 'general' },
  { id: 'f7', prompt: 'What perspective shift would change everything about how I see this situation?', category: 'general' },
  { id: 'f8', prompt: 'Who am I becoming through the challenges I am currently facing?', category: 'general' },
  { id: 'f9', prompt: 'What does my future self already know that I need to act on today?', category: 'general' },
  { id: 'f10', prompt: 'What am I grateful for that I have been overlooking?', category: 'general' },
  { id: 'f11', prompt: 'What strength showed up in me recently that I did not expect?', category: 'general' },
  { id: 'f12', prompt: 'If fear was not in the room, what decision would I make right now?', category: 'general' },
  { id: 'f13', prompt: 'What is one area of my life where I have grown significantly in the last year?', category: 'general' },
  { id: 'f14', prompt: 'What does "enough" look like for me today, and am I honoring that?', category: 'general' },
  { id: 'f15', prompt: 'What is the most powerful thing I can say yes to right now?', category: 'general' },
];

function pickRandom(arr, excluding = null) {
  const pool = arr.filter(p => p.id !== excluding);
  if (!pool.length) return arr[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

function PastReflectionCard({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const promptText = entry.title || 'Reflection';
  const dateStr = entry.created_date
    ? new Date(entry.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.07)', boxShadow: '0 1px 4px rgba(44,30,15,0.05)' }}
    >
      {/* Header row — tappable to expand */}
      <div
        className="flex items-start justify-between gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#C97F0E' }}>We asked:</p>
          <p className="text-sm italic leading-relaxed" style={{ color: '#7a5c3a' }}>"{promptText}"</p>
          {entry.body && (
            <p className="text-sm leading-snug mt-1.5 line-clamp-2" style={{ color: '#2c1e0f' }}>"{entry.body}"</p>
          )}
          {!expanded && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/elevate-reflection', { state: { entry } }); }}
                className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: '#BA1650' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Elevate
              </button>
              <span style={{ color: '#e0cbb0' }}>·</span>
              <div onClick={e => e.stopPropagation()}>
                <ShareCard item={entry} />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {dateStr && <span className="text-[10px]" style={{ color: '#c4a882' }}>{dateStr}</span>}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" style={{ color: '#c4a882' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: '#c4a882' }} />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(44,30,15,0.06)' }}>
              <p className="text-[11px] font-bold uppercase tracking-widest mt-3 mb-2" style={{ color: '#7a5c3a' }}>You said:</p>
              <p className="font-display text-base italic leading-relaxed" style={{ color: '#2c1e0f' }}>"{entry.body}"</p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => navigate('/elevate-reflection', { state: { entry } })}
                  className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: '#BA1650' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Elevate my answer
                </button>
                <ShareCard item={entry} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Reflections() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const passedPrompt = location.state?.selectedPrompt;
  const [currentPrompt, setCurrentPrompt] = useState(passedPrompt || null);
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const textareaRef = useState(null);

  const handleTextareaFocus = (e) => {
    e.target.style.border = '1px solid rgba(212,131,10,0.5)';
    e.target.style.background = '#fff';
    // Scroll textarea into view after keyboard opens
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
  };

  const { data: libraryPrompts = [] } = useQuery({
    queryKey: ['reflection-prompts'],
    queryFn: () => base44.entities.ReflectionPrompt.filter({ status: 'active' }),
  });

  const { data: pastReflections = [] } = useQuery({
    queryKey: ['past-reflections'],
    queryFn: () => base44.entities.UserEntry.filter({ entry_type: 'reflection' }, '-created_date', 20),
  });

  const allPrompts = libraryPrompts.length > 0 ? libraryPrompts : FALLBACK_PROMPTS;

  // Pick a random prompt on load
  useEffect(() => {
    if (currentPrompt) return;
    if (allPrompts.length > 0) {
      setCurrentPrompt(pickRandom(allPrompts));
    }
  }, [allPrompts, currentPrompt]);

  const handleNewPrompt = () => {
    setCurrentPrompt(pickRandom(allPrompts, currentPrompt?.id));
    setAnswer('');
    setSaved(false);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      base44.entities.UserEntry.create({
        entry_type: 'reflection',
        title: currentPrompt?.prompt || '',
        body: answer.trim(),
        category: currentPrompt?.category === 'general' ? 'clear_mind' : (currentPrompt?.category || 'clear_mind'),
        prompt_id: currentPrompt?.id || null,
        status: 'active',
      }),
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['past-reflections'] });
      setTimeout(() => {
        setSaved(false);
        setAnswer('');
        setCurrentPrompt(pickRandom(allPrompts, currentPrompt?.id));
      }, 1800);
    },
  });

  const canSave = answer.trim().length >= 3 && !saved;

  return (
    <div className="min-h-screen p-4 md:p-8 w-full max-w-2xl mx-auto overflow-x-hidden" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 120px)' }}>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Atom className="w-6 h-6" style={{ color: '#BA1650' }} />
          <h1 className="font-display text-2xl md:text-3xl font-semibold" style={{ color: '#2c1e0f' }}>Mindset Training</h1>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#c4a882' }}>Intentional answers here are a great way to train the brain to choose the life you want. Remember to keep a positive, life-giving framing on your responses.</p>
      </div>

      {/* Prompt card */}
      <AnimatePresence mode="wait">
        {currentPrompt && (
          <motion.div
            key={currentPrompt.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl p-6 md:p-8 mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(212,131,10,0.12) 0%, #fffdf8 65%)',
              border: '1px solid rgba(212,131,10,0.2)',
              boxShadow: '0 4px 24px rgba(212,131,10,0.09)',
            }}
          >
            {/* Prompt label */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#C97F0E' }}>
                Mindset Prompt
              </span>
              <button
                onClick={handleNewPrompt}
                className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors"
                style={{ color: '#c4a882' }}
                title="Try a different prompt"
              >
                <RefreshCw className="w-3 h-3" />
                Different prompt
              </button>
            </div>

            {/* The prompt question */}
            <p className="font-display text-lg md:text-xl italic leading-relaxed mb-6" style={{ color: '#2c1e0f' }}>
              {currentPrompt.prompt}
            </p>

            {/* Text area */}
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Write your answer here…"
              rows={5}
              maxLength={1200}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(212,131,10,0.18)',
                color: '#2c1e0f',
                fontFamily: 'var(--font-body)',
              }}
              onFocus={handleTextareaFocus}
              onBlur={e => { e.target.style.border = '1px solid rgba(212,131,10,0.18)'; e.target.style.background = 'rgba(255,255,255,0.7)'; }}
            />

            {/* Character count + save */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px]" style={{ color: '#c4a882' }}>
                {answer.length > 0 ? `${answer.length} / 1200` : ''}
              </span>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!canSave || saveMutation.isPending}
                size="sm"
                className="min-w-[110px] transition-all"
                style={saved
                  ? { background: '#4a7c59', color: '#fff' }
                  : { background: '#D0902D', color: '#fff' }
                }
              >
                {saved ? (
                  <><Check className="w-3.5 h-3.5 mr-1.5" />Saved</>
                ) : saveMutation.isPending ? (
                  'Saving…'
                ) : (
                  'Save Reflection'
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past reflections toggle */}
      {pastReflections.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowPast(v => !v)}
            className="flex items-center gap-2 text-sm font-medium mb-4 transition-opacity hover:opacity-70"
            style={{ color: '#7a5c3a' }}
          >
            <Pencil className="w-3.5 h-3.5" />
            Past Reflections ({pastReflections.length})
            {showPast ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <AnimatePresence>
            {showPast && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden space-y-2"
              >
                {pastReflections.map(entry => (
                  <PastReflectionCard key={entry.id} entry={entry} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}