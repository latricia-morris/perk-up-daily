import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import TeachItBack from '@/components/exercises/TeachItBack';

const PALETTE = {
  amber: '#FFAD09',
  teal: '#219EBC',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

const ACCURACY_OPTIONS = [
  { id: 'accurate', label: 'Yeah, this is accurate' },
  { id: 'partly_accurate', label: 'Partly — some of it holds up, some doesn\'t' },
  { id: 'not_accurate', label: 'No, this isn\'t actually accurate' },
];

const WEIGHT_OPTIONS = [
  { id: 'right_amount', label: 'About the right amount of space' },
  { id: 'more_than_deserved', label: 'More space than it probably deserves' },
  { id: 'way_more_than_deserved', label: 'Way more space than it deserves — this has taken over' },
];

function getReframeHeader(accuracy, weight) {
  if (accuracy === 'accurate' && weight === 'right_amount') {
    return 'This one\'s accurate and sitting where it should. Is there anything you\'d still want to note or restate?';
  }
  if (accuracy === 'accurate' && (weight === 'more_than_deserved' || weight === 'way_more_than_deserved')) {
    return 'This is legitimate — it\'s not about whether it\'s true. It might be about the size it\'s taking up. How might you restate it so it takes up the space it actually deserves, not more?';
  }
  if (accuracy === 'partly_accurate') {
    return 'Given what actually holds up and what doesn\'t, how might you restate this more accurately?';
  }
  return 'Given what you just found, how might you restate this in a way that\'s more accurate?';
}

export default function EvidenceCheckExercise() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [targetThought, setTargetThought] = useState('');
  const [supportingEvidence, setSupportingEvidence] = useState('');
  const [opposingEvidence, setOpposingEvidence] = useState('');
  const [accuracyCheck, setAccuracyCheck] = useState(null);
  const [weightCheck, setWeightCheck] = useState(null);
  const [reframeText, setReframeText] = useState('');

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-5 pt-16 pb-32"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${PALETTE.ink}60` }}>
          Evidence-Check Drill · Step {step} of 6
        </span>
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* C1: Name the Thought */}
          {step === 1 && (
            <motion.div key="c1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-center" style={{ color: '#C97F0E' }}>Evidence-Check Drill</p>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600 }}>
                What's the thought you want to check?
              </h2>
              <textarea
                value={targetThought}
                onChange={e => setTargetThought(e.target.value)}
                placeholder="Type the thought…"
                rows={3}
                maxLength={280}
                autoFocus
                className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6 text-center"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
              />
              <button onClick={() => setStep(2)} className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* C2: What Supports It */}
          {step === 2 && (
            <motion.div key="c2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="rounded-lg px-4 py-3 mb-4 text-sm italic text-center" style={{ background: 'rgba(33,158,188,0.08)', border: `1px solid ${PALETTE.teal}22`, color: PALETTE.ink }}>
                "{targetThought || 'Your thought'}"
              </div>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                What actual evidence supports this thought being true?
              </h2>
              <textarea
                value={supportingEvidence}
                onChange={e => setSupportingEvidence(e.target.value)}
                placeholder="List what actually supports it…"
                rows={4}
                maxLength={500}
                autoFocus
                className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
              />
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: PALETTE.teal, color: PALETTE.cream }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* C3: What Pushes Back */}
          {step === 3 && (
            <motion.div key="c3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="rounded-lg px-4 py-3 mb-4 text-sm italic text-center" style={{ background: 'rgba(33,158,188,0.08)', border: `1px solid ${PALETTE.teal}22`, color: PALETTE.ink }}>
                "{targetThought || 'Your thought'}"
              </div>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                Now, what evidence or experience pushes back against it?
              </h2>
              <textarea
                value={opposingEvidence}
                onChange={e => setOpposingEvidence(e.target.value)}
                placeholder="List what pushes back on it…"
                rows={4}
                maxLength={500}
                autoFocus
                className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
              />
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setStep(4)} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: PALETTE.teal, color: PALETTE.cream }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* C4a: Accuracy Check */}
          {step === 4 && (
            <motion.div key="c4a" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                Now that you've looked at both sides — is this thought accurate?
              </h2>
              <div className="space-y-3 mb-6">
                {ACCURACY_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => { setAccuracyCheck(opt.id); setStep(5); }}
                    className="w-full rounded-xl p-4 text-left transition-all active:scale-95"
                    style={{
                      background: accuracyCheck === opt.id ? `${PALETTE.teal}14` : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${accuracyCheck === opt.id ? PALETTE.teal : 'rgba(212,131,10,0.12)'}`,
                    }}>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(3)} className="text-xs flex items-center gap-1 mx-auto" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* C4b: Weight Check */}
          {step === 5 && (
            <motion.div key="c4b" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>
                Separate from whether it's accurate — how much space is this actually taking up in your head right now, compared to what it probably deserves?
              </h2>
              <div className="space-y-3 mb-6">
                {WEIGHT_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => { setWeightCheck(opt.id); setStep(6); }}
                    className="w-full rounded-xl p-4 text-left transition-all active:scale-95"
                    style={{
                      background: weightCheck === opt.id ? `${PALETTE.teal}14` : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${weightCheck === opt.id ? PALETTE.teal : 'rgba(212,131,10,0.12)'}`,
                    }}>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(4)} className="text-xs flex items-center gap-1 mx-auto" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* C5: Reframe (optional) */}
          {step === 6 && (
            <motion.div key="c5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600 }}>
                {getReframeHeader(accuracyCheck, weightCheck)}
              </h2>
              <textarea
                value={reframeText}
                onChange={e => setReframeText(e.target.value)}
                placeholder="Try restating it, or skip if you're not there yet…"
                rows={4}
                maxLength={280}
                autoFocus
                className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)' }}
              />
              <button onClick={() => setStep(7)} className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2 mb-3"
                style={{ background: PALETTE.teal, color: PALETTE.cream }}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => setStep(7)} className="w-full text-xs py-2" style={{ color: `${PALETTE.ink}60` }}>
                Not ready to restate it yet
              </button>
              <button onClick={() => setStep(5)} className="text-xs flex items-center gap-1 mx-auto mt-3" style={{ color: `${PALETTE.ink}60` }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {/* C6: Teach-It-Back */}
          {step === 7 && (
            <motion.div key="c6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <TeachItBack
                exerciseType="evidence-check"
                onClose={() => navigate('/neural-training')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}