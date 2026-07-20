import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, Check, Copy, ArrowLeft, Target, Zap, Circle } from 'lucide-react';

const PALETTE = {
  amber: '#FFAD09',
  ember: '#F95826',
  teal: '#219EBC',
  purple: '#5C3B8F',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

const SORT_OPTIONS = [
  { id: 'important', label: 'Important', description: 'Matters now, moves the needle', accent: PALETTE.teal, icon: Target },
  { id: 'urgent', label: 'Urgent', description: 'Time-sensitive, needs attention', accent: PALETTE.ember, icon: Zap },
  { id: 'extra', label: 'Extra', description: 'Matters, but not for today', accent: PALETTE.purple, icon: Circle },
];

const STEP_LABELS = [
  'Entry Choice',
  'Capture',
  'Sort',
  'Top 3',
  'Breakdown',
];

export default function ImpactPrioritizationExercise() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [path, setPath] = useState(null); // 'digital' | 'paper'
  const [items, setItems] = useState([]); // [{ id, text, category: null }]
  const [inputValue, setInputValue] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const [topThree, setTopThree] = useState([]);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const idCounter = useRef(0);

  const addItem = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setItems(prev => [...prev, { id: ++idCounter.current, text: trimmed, category: null }]);
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const assignCategory = (categoryId) => {
    if (sortIndex >= items.length) return;
    const newItems = items.map((item, i) =>
      i === sortIndex ? { ...item, category: categoryId } : item
    );
    setItems(newItems);
    setTimeout(() => {
      if (sortIndex + 1 < items.length) {
        setSortIndex(sortIndex + 1);
      } else {
        setStep(3);
      }
    }, 200);
  };

  const toggleTopThree = (id) => {
    setTopThree(prev =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const priorityItems = items.filter(i => i.category === 'important' || i.category === 'urgent');
  const extraItems = items.filter(i => i.category === 'extra');
  const currentItem = items[sortIndex];

  const buildClipboardText = () => {
    const top = items.filter(i => topThree.includes(i.id));
    const otherPriority = priorityItems.filter(i => !topThree.includes(i.id));
    let text = '--- MY TOP 3 PRIORITIES TODAY ---\n';
    top.forEach((item, i) => { text += `${i + 1}. ${item.text}\n`; });
    if (otherPriority.length > 0) {
      text += '\n--- ALSO PRIORITY ---\n';
      otherPriority.forEach(item => { text += `• ${item.text}\n`; });
    }
    if (extraItems.length > 0) {
      text += '\n--- EXTRA (not for today) ---\n';
      extraItems.forEach(item => { text += `• ${item.text}\n`; });
    }
    return text.trim();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildClipboardText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Clipboard error', e);
    }
  };

  const reset = () => {
    setStep(0);
    setPath(null);
    setItems([]);
    setInputValue('');
    setSortIndex(0);
    setTopThree([]);
    setCopied(false);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center px-5 pt-16 pb-32"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>

      {/* Step indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${PALETTE.ink}60` }}>
          {step < STEP_LABELS.length ? `Step ${step + 1} of ${STEP_LABELS.length} · ${STEP_LABELS[step]}` : 'Complete'}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 0: Entry Choice */}
        {step === 0 && (
          <motion.div key="choice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
            className="text-center max-w-md w-full">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#C97F0E' }}>
              Impact Prioritization
            </p>
            <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600 }}>
              How do you want to capture your list?
            </h2>
            <p className="text-sm mb-8" style={{ color: `${PALETTE.ink}A6` }}>
              Get everything out of your head first — then we'll sort it together.
            </p>
            <div className="space-y-3">
              {[
                { id: 'digital', label: 'Type it in the app', description: 'Capture each item as a quick entry' },
                { id: 'paper', label: 'Guide me on paper', description: 'I\'ll write it down — then sort in app' },
              ].map(opt => (
                <button key={opt.id} onClick={() => { setPath(opt.id); setStep(opt.id === 'paper' ? 2 : 1); }}
                  className="w-full rounded-xl p-4 text-left transition-all active:scale-95 flex items-center justify-between"
                  style={{ background: path === opt.id ? PALETTE.amber : 'rgba(255,255,255,0.7)', border: `1px solid ${path === opt.id ? PALETTE.amber : 'rgba(212,131,10,0.18)'}` }}>
                  <div>
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: `${PALETTE.ink}80` }}>{opt.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: path === opt.id ? PALETTE.ink : `${PALETTE.ink}80` }} />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 1: Digital Capture */}
        {step === 1 && (
          <motion.div key="capture" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
            className="max-w-md w-full">
            <h2 className="mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600 }}>
              Brain dump
            </h2>
            <p className="text-sm mb-6 text-center" style={{ color: `${PALETTE.ink}A6` }}>
              List everything on your mind. One per line. No filtering yet.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
                placeholder="Type an item and press Enter…"
                autoFocus
                className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
              />
              <button onClick={addItem} disabled={!inputValue.trim()}
                className="rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1"
                style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-2 mb-6 min-h-[120px]">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm"
                    style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(212,131,10,0.1)' }}>
                    <span>{item.text}</span>
                    <button onClick={() => removeItem(item.id)} className="text-xs" style={{ color: `${PALETTE.ink}60` }}>Remove</button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)}
                className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => { setSortIndex(0); setStep(2); }} disabled={items.length === 0}
                className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: PALETTE.amber, color: PALETTE.ink, boxShadow: `0 12px 30px -10px ${PALETTE.amber}66` }}>
                Sort <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {items.length > 0 && (
              <p className="text-xs text-center mt-3" style={{ color: `${PALETTE.ink}60` }}>
                {items.length} item{items.length !== 1 ? 's' : ''} captured
              </p>
            )}
          </motion.div>
        )}

        {/* STEP 2: Sort one at a time */}
        {step === 2 && (
          <motion.div key="sort" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
            className="max-w-md w-full text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: `${PALETTE.ink}60` }}>
              {sortIndex + 1} of {items.length}
            </p>
            <h2 className="mb-6" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
              Where does this go?
            </h2>
            <AnimatePresence mode="wait">
              <motion.div key={currentItem?.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-xl px-5 py-4 mb-8 text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.8)', border: `1px solid ${PALETTE.amber}33` }}>
                {currentItem?.text}
              </motion.div>
            </AnimatePresence>
            <div className="space-y-3">
              {SORT_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button key={opt.id} onClick={() => assignCategory(opt.id)}
                    className="w-full rounded-xl p-4 text-left transition-all active:scale-95 flex items-center gap-4"
                    style={{ background: `${opt.accent}14`, border: `1px solid ${opt.accent}33` }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: opt.accent }}>
                      <Icon className="w-4 h-4" style={{ color: PALETTE.cream }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: PALETTE.ink }}>{opt.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: `${PALETTE.ink}80` }}>{opt.description}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0" style={{ color: opt.accent }} />
                  </button>
                );
              })}
            </div>
            {sortIndex > 0 && (
              <button onClick={() => setSortIndex(sortIndex - 1)}
                className="mt-6 text-xs flex items-center gap-1 mx-auto" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Previous
              </button>
            )}
          </motion.div>
        )}

        {/* STEP 3: Top 3 Selection */}
        {step === 3 && (
          <motion.div key="top3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
            className="max-w-md w-full">
            <h2 className="mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600 }}>
              Pick your top 3 for today
            </h2>
            <p className="text-sm mb-6 text-center" style={{ color: `${PALETTE.ink}A6` }}>
              From your priority items, choose the three that get your attention today.
            </p>
            <p className="text-xs text-center mb-6 font-medium" style={{ color: topThree.length === 3 ? PALETTE.teal : `${PALETTE.ink}80` }}>
              {topThree.length} of 3 selected
            </p>
            <div className="space-y-2 mb-8">
              {priorityItems.map(item => {
                const selected = topThree.includes(item.id);
                return (
                  <button key={item.id} onClick={() => toggleTopThree(item.id)}
                    className="w-full rounded-xl px-4 py-3 text-left transition-all active:scale-95 flex items-center gap-3"
                    style={{
                      background: selected ? `${PALETTE.teal}14` : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${selected ? PALETTE.teal : 'rgba(212,131,10,0.12)'}`,
                    }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: selected ? PALETTE.teal : 'transparent', border: `1.5px solid ${selected ? PALETTE.teal : `${PALETTE.ink}40`}` }}>
                      {selected && <Check className="w-3 h-3" style={{ color: PALETTE.cream }} />}
                    </div>
                    <span className="text-sm flex-1">{item.text}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: item.category === 'urgent' ? PALETTE.ember : PALETTE.teal }}>
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSortIndex(items.length - 1); setStep(2); }}
                className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(4)} disabled={topThree.length === 0}
                className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: PALETTE.amber, color: PALETTE.ink, boxShadow: `0 12px 30px -10px ${PALETTE.amber}66` }}>
                See Breakdown <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Breakdown + Copy */}
        {step === 4 && (
          <motion.div key="breakdown" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
            className="max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: `linear-gradient(135deg, ${PALETTE.amber} 0%, ${PALETTE.ember} 100%)` }}>
                <Check className="w-7 h-7" style={{ color: PALETTE.cream }} />
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                Your priority breakdown
              </h2>
            </div>

            <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${PALETTE.teal}26` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: PALETTE.teal }}>
                Top 3 Priorities Today
              </p>
              <div className="space-y-2 mb-4">
                {items.filter(i => topThree.includes(i.id)).map((item, i) => (
                  <div key={item.id} className="flex items-start gap-2 text-sm">
                    <span className="font-bold shrink-0" style={{ color: PALETTE.teal }}>{i + 1}.</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              {priorityItems.filter(i => !topThree.includes(i.id)).length > 0 && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2 mt-4" style={{ color: `${PALETTE.ink}80` }}>
                    Also Priority
                  </p>
                  <div className="space-y-1.5 mb-2">
                    {priorityItems.filter(i => !topThree.includes(i.id)).map(item => (
                      <div key={item.id} className="flex items-start gap-2 text-sm">
                        <span style={{ color: `${PALETTE.ink}60` }}>•</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {extraItems.length > 0 && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2 mt-4" style={{ color: PALETTE.purple }}>
                    Extra (not for today)
                  </p>
                  <div className="space-y-1.5">
                    {extraItems.map(item => (
                      <div key={item.id} className="flex items-start gap-2 text-sm">
                        <span style={{ color: PALETTE.purple }}>•</span>
                        <span style={{ color: `${PALETTE.ink}CC` }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button onClick={handleCopy}
              className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2 mb-3"
              style={{ background: copied ? PALETTE.teal : PALETTE.ink, color: PALETTE.cream }}>
              {copied ? <><Check className="w-4 h-4" /> Copied to clipboard!</> : <><Copy className="w-4 h-4" /> Copy breakdown</>}
            </button>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)}
                className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => navigate('/neural-training')}
                className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: PALETTE.amber, color: PALETTE.ink }}>
                Done <Check className="w-4 h-4" />
              </button>
            </div>
            <button onClick={reset} className="w-full text-xs mt-4" style={{ color: `${PALETTE.ink}60` }}>
              Start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}