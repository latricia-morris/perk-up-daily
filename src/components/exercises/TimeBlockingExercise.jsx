import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Plus, Check } from 'lucide-react';

const PALETTE = {
  amber: '#FFAD09',
  teal: '#219EBC',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', accent: '#FFAD09' },
  { id: 'afternoon', label: 'Afternoon', accent: '#F95826' },
  { id: 'evening', label: 'Evening', accent: '#5C3B8F' },
  { id: 'gap', label: 'Whenever there\'s a gap', accent: '#219EBC' },
];

const SLOT_CYCLE = ['unassigned', 'morning', 'afternoon', 'evening', 'gap'];

export default function TimeBlockingExercise() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const inputRef = useRef(null);
  const idCounter = useRef(0);

  const addItem = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setItems(prev => [...prev, { id: ++idCounter.current, text: trimmed, slot: null }]);
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const assignSlot = (slotId) => {
    if (sortIndex >= items.length) return;
    setItems(prev => prev.map((item, i) =>
      i === sortIndex ? { ...item, slot: slotId } : item
    ));
    setTimeout(() => {
      if (sortIndex + 1 < items.length) {
        setSortIndex(sortIndex + 1);
      } else {
        setStep(3);
      }
    }, 200);
  };

  const cycleSlot = (itemIndex) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== itemIndex) return item;
      const currentIdx = SLOT_CYCLE.indexOf(item.slot || 'unassigned');
      const nextIdx = (currentIdx + 1) % SLOT_CYCLE.length;
      const nextSlot = SLOT_CYCLE[nextIdx];
      return { ...item, slot: nextSlot === 'unassigned' ? null : nextSlot };
    }));
  };

  const currentItem = items[sortIndex];
  const allSorted = items.length > 0 && items.every(i => i.slot !== null);

  const buildSummary = () => {
    return TIME_SLOTS.map(slot => {
      const slotItems = items.filter(i => i.slot === slot.id);
      if (slotItems.length === 0) return null;
      return { ...slot, items: slotItems };
    }).filter(Boolean);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center px-5 pt-16 pb-32"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${PALETTE.ink}60` }}>
          Time Blocking · Step {step} of 4
        </span>
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* B1: Capture items */}
          {step === 1 && (
            <motion.div key="b1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                What do you need to get done today?
              </h2>
              <p className="text-sm mb-6 text-center" style={{ color: `${PALETTE.ink}A6` }}>
                Add everything, one at a time.
              </p>
              <div className="flex gap-2 mb-4">
                <input ref={inputRef} type="text" value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
                  placeholder="Type an item and press Enter..." autoFocus
                  className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }} />
                <button onClick={addItem} disabled={!inputValue.trim()}
                  className="rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1"
                  style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="space-y-2 mb-6 min-h-[80px]">
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm"
                      style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(212,131,10,0.1)' }}>
                      <span>{item.text}</span>
                      <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                        className="text-xs" style={{ color: `${PALETTE.ink}60` }}>Remove</button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate('/neural-training')}
                  className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => { setSortIndex(0); setStep(2); }} disabled={items.length === 0}
                  className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: PALETTE.teal, color: PALETTE.cream }}>
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

          {/* B2: Sort into time slots */}
          {step === 2 && (
            <motion.div key="b2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
              className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: `${PALETTE.ink}60` }}>
                {sortIndex + 1} of {items.length}
              </p>
              <h2 className="mb-6" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                When does this go?
              </h2>
              <AnimatePresence mode="wait">
                <motion.div key={currentItem?.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-xl px-5 py-4 mb-8 text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.8)', border: `1px solid ${PALETTE.teal}33` }}>
                  {currentItem?.text}
                </motion.div>
              </AnimatePresence>
              <div className="space-y-3">
                {TIME_SLOTS.map(opt => (
                  <button key={opt.id} onClick={() => assignSlot(opt.id)}
                    className="w-full rounded-xl p-4 text-left transition-all active:scale-95 flex items-center gap-4"
                    style={{ background: `${opt.accent}14`, border: `1px solid ${opt.accent}33` }}>
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: opt.accent }} />
                    <span className="text-sm font-medium">{opt.label}</span>
                    <ChevronRight className="w-4 h-4 shrink-0 ml-auto" style={{ color: opt.accent }} />
                  </button>
                ))}
              </div>
              {sortIndex > 0 && (
                <button onClick={() => setSortIndex(sortIndex - 1)}
                  className="mt-6 text-xs flex items-center gap-1 mx-auto" style={{ color: `${PALETTE.ink}60` }}>
                  <ArrowLeft className="w-3 h-3" /> Previous
                </button>
              )}
            </motion.div>
          )}

          {/* B3: Summary */}
          {step === 3 && (
            <motion.div key="b3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: `linear-gradient(135deg, ${PALETTE.teal} 0%, ${PALETTE.amber} 100%)` }}>
                  <Check className="w-7 h-7" style={{ color: PALETTE.cream }} />
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                  Your day, shaped
                </h2>
              </div>
              <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${PALETTE.teal}26` }}>
                {buildSummary().map(slot => (
                  <div key={slot.id} className="mb-4 last:mb-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: slot.accent }}>
                      {slot.label}
                    </p>
                    <div className="space-y-1.5">
                      {slot.items.map(item => (
                        <div key={item.id} className="flex items-start gap-2 text-sm">
                          <span style={{ color: slot.accent }}>•</span>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/neural-training')}
                className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: PALETTE.teal, color: PALETTE.cream }}>
                Done <Check className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}