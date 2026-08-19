import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, ChevronRight } from 'lucide-react';
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

const PRESENCE_OPTIONS = [
  { value: 'barely', label: 'Barely', desc: 'It flickered in and out' },
  { value: 'somewhat', label: 'Somewhat', desc: 'It was there part of the day' },
  { value: 'clearly', label: 'Clearly', desc: 'It showed up a few times' },
  { value: 'strongly', label: 'Strongly', desc: 'It was with me most of the day' },
];

export default function NeurocycleDailyCheckIn({ cycleId, day, focusThought, replacementThought, onDone, onCompleteCycle }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0); // 0 = presence check, 1 = re-anchor, 2 = active reach
  const [presence, setPresence] = useState(null);
  const [activeReach, setActiveReach] = useState('');
  const [saving, setSaving] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const isLastDay = day >= 21;

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.NeurocycleCheckIn.create({
        cycle_date: today,
        cycle_id: cycleId,
        cycle_day: day,
        cycle_status: isLastDay ? 'completed' : 'active',
        focus_thought: focusThought,
        replacement_thought: replacementThought,
        presence_level: presence,
        active_reach: activeReach,
        check_in_status: 'completed',
      });

      // If this was the last day, mark the Day 1 record as completed too
      if (isLastDay) {
        const allCheckIns = await base44.entities.NeurocycleCheckIn.filter({ cycle_id: cycleId });
        for (const c of allCheckIns) {
          if (c.cycle_status === 'active') {
            await base44.entities.NeurocycleCheckIn.update(c.id, { cycle_status: 'completed' });
          }
        }
        queryClient.invalidateQueries({ queryKey: ['neurocycle-active'] });
        onCompleteCycle();
      } else {
        queryClient.invalidateQueries({ queryKey: ['neurocycle-active'] });
        onDone();
      }
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
          Day {day} of 21
        </span>
      </div>

      {/* STEP 0: Presence check */}
      {step === 0 && (
        <div className="max-w-md w-full">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-center" style={{ color: PALETTE.violet }}>
            Check In
          </p>
          <h2 className="mb-3 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: PALETTE.ink }}>
            How present was this today?
          </h2>
          <p className="text-sm mb-6 text-center" style={{ color: `${PALETTE.ink}A6` }}>
            How much did your focus thought show up today?
          </p>

          {/* Show the focus thought */}
          <div className="rounded-xl p-3 mb-6 text-xs italic text-center" style={{ background: 'rgba(92,59,143,0.06)', border: '1px solid rgba(92,59,143,0.12)', color: `${PALETTE.ink}80` }}>
            "{focusThought}"
          </div>

          <div className="space-y-2 mb-6">
            {PRESENCE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPresence(opt.value)}
                className="w-full rounded-xl p-3 text-left transition-all active:scale-95"
                style={{
                  background: presence === opt.value ? `${PALETTE.violet}14` : 'rgba(255,255,255,0.6)',
                  border: `1px solid ${presence === opt.value ? PALETTE.violet : 'rgba(47,44,41,0.1)'}`,
                  color: PALETTE.ink,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs" style={{ color: `${PALETTE.ink}80` }}>{opt.desc}</p>
                  </div>
                  {presence === opt.value && <Check className="w-4 h-4" style={{ color: PALETTE.violet }} />}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(1)}
            disabled={!presence}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 1: Re-anchor */}
      {step === 1 && (
        <div className="max-w-md w-full text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: PALETTE.teal }}>
            Re-Anchor
          </p>
          <h2 className="mb-6" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: PALETTE.ink }}>
            Here's your replacement.
          </h2>
          <div className="mb-8 rounded-2xl p-8" style={{ background: `linear-gradient(135deg, ${PALETTE.violet}0D 0%, ${PALETTE.teal}0D 100%)`, border: `1px solid ${PALETTE.violet}22` }}>
            <p className="text-lg font-semibold leading-relaxed" style={{ color: PALETTE.violet, fontFamily: "'Playfair Display', serif" }}>
              {replacementThought}
            </p>
          </div>
          <p className="text-sm mb-6" style={{ color: `${PALETTE.ink}A6` }}>
            Read it. Let it land. This is the thought you're building.
          </p>
          <button
            onClick={() => setStep(2)}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Active reach */}
      {step === 2 && (
        <div className="max-w-md w-full">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: PALETTE.rose }}>
            Active Reach
          </p>
          <h2 className="mb-3" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: PALETTE.ink }}>
            One small step today.
          </h2>
          <p className="text-sm mb-5" style={{ color: `${PALETTE.ink}A6` }}>
            What's one tiny action you can take today that aligns with your replacement thought?
          </p>
          <input
            value={activeReach}
            onChange={e => setActiveReach(e.target.value)}
            placeholder="The one thing I'll do is…"
            maxLength={200}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-6"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(186,22,80,0.2)', color: PALETTE.ink }}
          />
          <button
            onClick={handleSave}
            disabled={!activeReach.trim() || saving}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${PALETTE.rose} 0%, ${PALETTE.amber} 100%)`, color: PALETTE.cream }}
          >
            {saving ? 'Saving…' : <>{isLastDay ? 'Complete cycle' : 'Complete check-in'} <Check className="w-4 h-4" /></>}
          </button>
        </div>
      )}
    </div>
  );
}