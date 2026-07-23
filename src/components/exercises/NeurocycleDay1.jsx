import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PALETTE = {
  amber: '#FFAD09',
  ember: '#F95826',
  teal: '#219EBC',
  violet: '#5C3B8F',
  rose: '#BA1650',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

const POSITIVE_EMOTIONS = [
  'Grateful', 'Inspired', 'Hopeful', 'Joyful',
  'Confident', 'Peaceful', 'Excited', 'Content',
  'Determined', 'Proud',
];

const CHALLENGING_EMOTIONS = [
  'Overwhelmed', 'Anxious', 'Frustrated', 'Stuck',
  'Discouraged', 'Angry', 'Sad', 'Numb',
  'Racing thoughts', 'Tense',
];

const STEPS = [
  { num: 1, label: 'Gather' },
  { num: 2, label: 'Reflect' },
  { num: 3, label: 'Capture' },
  { num: 4, label: 'Reconceptualize' },
  { num: 5, label: 'Active Reach' },
];

export default function NeurocycleDay1({ onDone }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [emotion, setEmotion] = useState(null);
  const [customEmotion, setCustomEmotion] = useState('');
  const [reflectDone, setReflectDone] = useState(false);
  const [capturedThought, setCapturedThought] = useState('');
  const [reconceptualizedThought, setReconceptualizedThought] = useState('');
  const [activeReach, setActiveReach] = useState('');
  const [saving, setSaving] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const selectedEmotion = emotion === 'Something else' ? customEmotion.trim() : emotion;

  const handleSave = async () => {
    setSaving(true);
    try {
      const cycleId = crypto.randomUUID();
      await base44.entities.NeurocycleCheckIn.create({
        cycle_date: today,
        cycle_id: cycleId,
        cycle_day: 1,
        cycle_status: 'active',
        focus_thought: capturedThought,
        replacement_thought: reconceptualizedThought,
        gathered_emotion: selectedEmotion || '',
        captured_thought: capturedThought,
        reconceptualized_thought: reconceptualizedThought,
        active_reach: activeReach,
        check_in_status: 'pending',
      });
      queryClient.invalidateQueries({ queryKey: ['neurocycle-active'] });
      onDone();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center px-5"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${PALETTE.ink}60` }}>
          Day 1 of 21 — {STEPS[step]?.label || 'Complete'}
        </span>
      </div>

      {/* STEP 1: Gather */}
      {step === 0 && (
        <div className="text-center max-w-md w-full">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: PALETTE.violet }}>
            Gather
          </p>
          <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: PALETTE.ink }}>
            What are you feeling right now?
          </h2>
          <p className="text-sm mb-6" style={{ color: `${PALETTE.ink}A6` }}>
            Bring awareness to what&apos;s present. Whether you&apos;re riding high or working through something — name it.
          </p>

          {/* Positive emotions */}
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: PALETTE.teal }}>
            Feeling good?
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-5">
            {POSITIVE_EMOTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setEmotion(opt)}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95"
                style={{
                  background: emotion === opt ? `${PALETTE.teal}22` : `${PALETTE.ink}0A`,
                  border: `1px solid ${emotion === opt ? PALETTE.teal : 'transparent'}`,
                  color: PALETTE.ink,
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Challenging emotions */}
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: PALETTE.rose }}>
            Working through something?
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {CHALLENGING_EMOTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setEmotion(opt)}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95"
                style={{
                  background: emotion === opt ? `${PALETTE.rose}22` : `${PALETTE.ink}0A`,
                  border: `1px solid ${emotion === opt ? PALETTE.rose : 'transparent'}`,
                  color: PALETTE.ink,
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            onClick={() => setEmotion('Something else')}
            className="text-xs underline mb-3"
            style={{ color: `${PALETTE.ink}80` }}
          >
            Something else
          </button>
          {emotion === 'Something else' && (
            <input
              value={customEmotion}
              onChange={e => setCustomEmotion(e.target.value)}
              placeholder="Name it in your own words…"
              maxLength={80}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-6"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(92,59,143,0.2)', color: PALETTE.ink }}
            />
          )}
          <button
            onClick={() => setStep(1)}
            disabled={!selectedEmotion}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Reflect */}
      {step === 1 && (
        <div className="text-center max-w-md w-full">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: PALETTE.teal }}>Reflect</p>
          <h2 className="mb-6" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: PALETTE.ink }}>
            Sit with it for a moment.
          </h2>
          <div className="mb-8 rounded-2xl p-8" style={{ background: 'rgba(92,59,143,0.08)', border: '1px solid rgba(92,59,143,0.15)' }}>
            <p className="text-2xl font-bold mb-2" style={{ color: PALETTE.violet }}>{selectedEmotion}</p>
            <p className="text-sm" style={{ color: `${PALETTE.ink}A6` }}>
              You&apos;re feeling this. That&apos;s okay — whether it&apos;s something to celebrate or something to work through. Just let it be here.
            </p>
          </div>
          <button
            onClick={() => setReflectDone(true)}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 mb-3 flex items-center justify-center gap-2"
            style={{ background: reflectDone ? `${PALETTE.teal}22` : 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.teal}44` }}
          >
            {reflectDone ? (
              <>
                <Check className="w-4 h-4" /> I&apos;ve sat with it
              </>
            ) : (
              "I\u2019m ready to sit with it"
            )}
          </button>
          <button
            onClick={() => setStep(2)}
            disabled={!reflectDone}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 3: Capture */}
      {step === 2 && (
        <div className="max-w-md w-full">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: PALETTE.ember }}>Capture</p>
          <h2 className="mb-3" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: PALETTE.ink }}>
            What&apos;s the thought behind it?
          </h2>
          <p className="text-sm mb-5" style={{ color: `${PALETTE.ink}A6` }}>
            Write the thought as it loops in your head — or the truth you want to reinforce. No editing — just get it out.
          </p>
          <textarea
            value={capturedThought}
            onChange={e => setCapturedThought(e.target.value)}
            placeholder="The thought I'm working with is…"
            rows={4}
            maxLength={600}
            className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(249,88,38,0.2)', color: PALETTE.ink }}
          />
          <button
            onClick={() => setStep(3)}
            disabled={capturedThought.trim().length < 5}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 4: Reconceptualize */}
      {step === 3 && (
        <div className="max-w-md w-full">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: PALETTE.amber }}>Reconceptualize</p>
          <h2 className="mb-3" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: PALETTE.ink }}>
            Rewrite it — truer and kinder.
          </h2>
          <div className="rounded-xl p-3 mb-4 text-xs italic" style={{ background: 'rgba(47,44,41,0.04)', border: '1px solid rgba(47,44,41,0.08)', color: `${PALETTE.ink}80` }}>
            Original: &ldquo;{capturedThought}&rdquo;
          </div>
          <textarea
            value={reconceptualizedThought}
            onChange={e => setReconceptualizedThought(e.target.value)}
            placeholder="A truer, more life-giving version…"
            rows={4}
            maxLength={600}
            className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,173,9,0.25)', color: PALETTE.ink }}
          />
          <button
            onClick={() => setStep(4)}
            disabled={reconceptualizedThought.trim().length < 5}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 5: Active Reach */}
      {step === 4 && (
        <div className="max-w-md w-full">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: PALETTE.rose }}>Active Reach</p>
          <h2 className="mb-3" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: PALETTE.ink }}>
            One small step forward.
          </h2>
          <p className="text-sm mb-5" style={{ color: `${PALETTE.ink}A6` }}>
            What&apos;s one tiny action you can take today that aligns with your new thought? This becomes your daily focus.
          </p>
          <input
            value={activeReach}
            onChange={e => setActiveReach(e.target.value)}
            placeholder="The one thing I'll do is…"
            maxLength={200}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-6"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(186,22,80,0.2)', color: PALETTE.ink }}
          />
          <div className="rounded-xl p-3 mb-6 text-xs" style={{ background: `${PALETTE.violet}0A`, border: `1px solid ${PALETTE.violet}22`, color: `${PALETTE.ink}A6` }}>
            <strong style={{ color: PALETTE.violet }}>For the next 21 days,</strong> your replacement thought will appear on your dashboard to keep it front and center.
          </div>
          <button
            onClick={handleSave}
            disabled={!activeReach.trim() || saving}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${PALETTE.rose} 0%, ${PALETTE.amber} 100%)`, color: PALETTE.cream }}
          >
            {saving ? 'Starting cycle…' : (
              <>
                Begin 21-day cycle <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}