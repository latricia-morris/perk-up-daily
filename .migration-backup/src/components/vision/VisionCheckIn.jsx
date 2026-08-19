import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Target, Check, Sparkles, ChevronDown } from 'lucide-react';
import CategoryBadge from '@/components/shared/CategoryBadge';
import { getCheckInMessage, getStageLabel, PROGRESS_STAGES, STAGE_COLOR } from '@/lib/visionGoals';
import CrushedItDialog from '@/components/vision/CrushedItDialog';

/**
 * Dashboard check-in card for Vision & Goals entries.
 * Shows a warm, stage-aware message and lightweight actions:
 * - Keep as is
 * - Update stage
 * - Crushed it!
 * - Dismiss for now
 *
 * Messages are never truncated — the container expands to fit.
 */
export default function VisionCheckIn({ entry, featured = false }) {
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(false);
  const [showStagePicker, setShowStagePicker] = useState(false);
  const [crushedOpen, setCrushedOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Track dismissed state per entry per day
  const dismissKey = `perkup-vision-dismiss-${entry.id}-${new Date().toDateString()}`;
  useEffect(() => {
    if (localStorage.getItem(dismissKey)) setDismissed(true);
  }, [dismissKey]);

  const message = getCheckInMessage(entry);
  const enteredDate = entry.created_date ? format(new Date(entry.created_date), 'MMM d, yyyy') : '';
  const targetDate = entry.target_date ? format(new Date(entry.target_date), 'MMM d, yyyy') : '';

  const handleDismiss = () => {
    localStorage.setItem(dismissKey, '1');
    setDismissed(true);
  };

  const handleStageChange = async (newStage) => {
    setShowStagePicker(false);
    if (newStage === 'crushed_it') {
      setCrushedOpen(true);
      return;
    }
    setUpdating(true);
    await base44.entities.UserEntry.update(entry.id, { progress_stage: newStage });
    queryClient.invalidateQueries({ queryKey: ['user-entries'] });
    queryClient.invalidateQueries({ queryKey: ['vision-goals'] });
    setUpdating(false);
  };

  // If dismissed, render as a compact card without check-in UI
  if (dismissed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl p-4"
        style={{ background: '#fffdf8', border: `1px solid rgba(45,106,79,0.15)`, boxShadow: '0 1px 4px rgba(44,30,15,0.06)' }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Target className="w-3 h-3" style={{ color: STAGE_COLOR }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: STAGE_COLOR }}>Vision & Goals</span>
        </div>
        <p className="font-display text-sm font-semibold leading-snug" style={{ color: '#2c1e0f' }}>{entry.title || 'Untitled vision'}</p>
        {entry.body && <p className="text-sm text-muted-foreground leading-relaxed mt-1 line-clamp-2">{entry.body}</p>}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <CategoryBadge category={entry.category} />
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(45,106,79,0.12)', color: STAGE_COLOR }}>
            {getStageLabel(entry.progress_stage)}
          </span>
        </div>
        <AnimatePresence>
          {crushedOpen && (
            <CrushedItDialog entry={entry} open={crushedOpen} onClose={() => setCrushedOpen(false)} />
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl p-4 md:p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(45,106,79,0.10) 0%, #fffdf8 60%)',
          border: '1px solid rgba(45,106,79,0.2)',
          boxShadow: '0 2px 12px rgba(45,106,79,0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-3">
          <Target className="w-3.5 h-3.5" style={{ color: STAGE_COLOR }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: STAGE_COLOR }}>Vision & Goals</span>
        </div>

        {/* Title */}
        <p className="font-display text-base md:text-lg font-semibold leading-snug" style={{ color: '#2c1e0f' }}>
          {entry.title || 'Untitled vision'}
        </p>

        {/* Body preview */}
        {entry.body && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-1 line-clamp-2">{entry.body}</p>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between mt-2 gap-3">
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {enteredDate ? `📝 ${enteredDate}` : ''}
          </span>
          <span className="text-[10px] font-medium whitespace-nowrap" style={{ color: STAGE_COLOR }}>
            {targetDate ? `🎯 ${targetDate}` : ''}
          </span>
        </div>

        {/* Category + current stage */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <CategoryBadge category={entry.category} />
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(45,106,79,0.12)', color: STAGE_COLOR }}>
            {getStageLabel(entry.progress_stage)}
          </span>
        </div>

        {/* Check-in message — full text, no truncation */}
        <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(45,106,79,0.08)' }}>
          <p className="text-sm font-medium leading-relaxed" style={{ color: '#2c1e0f' }}>
            {message}
          </p>
        </div>

        {/* Actions */}
        {!showStagePicker ? (
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={handleDismiss}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              Keep as is
            </button>
            <button
              onClick={() => setShowStagePicker(true)}
              disabled={updating}
              className="text-xs px-3 py-1.5 rounded-lg text-white transition-colors flex items-center gap-1"
              style={{ background: STAGE_COLOR }}
            >
              Update stage <ChevronDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => setCrushedOpen(true)}
              className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-semibold"
              style={{ background: 'rgba(255,173,9,0.15)', color: '#B8860B' }}
            >
              <Sparkles className="w-3 h-3" /> Crushed it!
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors ml-auto"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pick a stage</p>
            {PROGRESS_STAGES.map(stage => (
              <button
                key={stage.value}
                onClick={() => handleStageChange(stage.value)}
                className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors ${
                  entry.progress_stage === stage.value
                    ? 'border-primary/40 bg-primary/10 text-foreground font-medium'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {stage.label}
                {entry.progress_stage === stage.value && <Check className="w-3 h-3 inline ml-2" />}
              </button>
            ))}
            <button
              onClick={() => setShowStagePicker(false)}
              className="text-xs text-muted-foreground hover:text-foreground mt-1"
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {crushedOpen && (
          <CrushedItDialog entry={entry} open={crushedOpen} onClose={() => setCrushedOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}