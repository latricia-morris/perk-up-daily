import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Repeat, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PALETTE = {
  violet: '#5C3B8F',
  teal: '#219EBC',
  amber: '#FFAD09',
  cream: '#FFFCF2',
  ink: '#2F2C29',
  page: '#fbf6ef',
};

export default function NeurocycleComplete({ cycleId, focusThought, replacementThought }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [action, setAction] = useState(null);

  const handleRepeat = async () => {
    setAction('repeat');
    // Mark current cycle as completed, then start a new one with the same focus
    try {
      const allCheckIns = await base44.entities.NeurocycleCheckIn.filter({ cycle_id: cycleId });
      for (const c of allCheckIns) {
        if (c.cycle_status === 'active') {
          await base44.entities.NeurocycleCheckIn.update(c.id, { cycle_status: 'completed' });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['neurocycle-active'] });
      // Reload to start fresh Day 1
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewFocus = async () => {
    setAction('new');
    try {
      const allCheckIns = await base44.entities.NeurocycleCheckIn.filter({ cycle_id: cycleId });
      for (const c of allCheckIns) {
        if (c.cycle_status === 'active') {
          await base44.entities.NeurocycleCheckIn.update(c.id, { cycle_status: 'completed' });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['neurocycle-active'] });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = () => {
    queryClient.invalidateQueries({ queryKey: ['neurocycle-active'] });
    navigate('/neural-training');
  };

  return (
    <div
      className="relative h-screen w-full flex flex-col items-center justify-center px-5 text-center"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: `linear-gradient(135deg, ${PALETTE.violet} 0%, ${PALETTE.teal} 100%)` }}
      >
        <Check className="w-8 h-8" style={{ color: PALETTE.cream }} />
      </div>

      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: PALETTE.ink, marginBottom: 8 }}>
        You completed a full Neurocycle.
      </h1>
      <p className="text-sm mb-6" style={{ color: `${PALETTE.ink}A6` }}>
        21 days of intentional thought work. That's real rewiring.
      </p>

      {/* Show what they worked on */}
      <div className="max-w-sm w-full mb-8 space-y-3">
        <div className="rounded-xl p-4 text-left" style={{ background: 'rgba(47,44,41,0.04)', border: '1px solid rgba(47,44,41,0.08)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: `${PALETTE.ink}60` }}>
            What you worked on
          </p>
          <p className="text-sm italic" style={{ color: `${PALETTE.ink}A6` }}>
            {focusThought}
          </p>
        </div>
        <div className="rounded-xl p-4 text-left" style={{ background: `${PALETTE.violet}0A`, border: `1px solid ${PALETTE.violet}22` }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: PALETTE.violet }}>
            What you built
          </p>
          <p className="text-sm font-medium" style={{ color: PALETTE.violet }}>
            {replacementThought}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="max-w-sm w-full space-y-2">
        <button
          onClick={handleRepeat}
          disabled={action !== null}
          className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${PALETTE.violet} 0%, ${PALETTE.teal} 100%)`, color: PALETTE.cream }}
        >
          <Repeat className="w-4 h-4" /> Repeat this thought
        </button>
        <button
          onClick={handleNewFocus}
          disabled={action !== null}
          className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}
        >
          <Sparkles className="w-4 h-4" /> Choose a new focus
        </button>
        <button
          onClick={handleClose}
          disabled={action !== null}
          className="w-full rounded-full py-2.5 text-xs font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: 'transparent', color: `${PALETTE.ink}80` }}
        >
          <X className="w-3.5 h-3.5" /> Close for now
        </button>
      </div>
    </div>
  );
}