import React, { useState } from 'react';
import { Mic, Type, SkipForward, Check } from 'lucide-react';
import { getPromptForExercise } from '@/lib/teachItBackPrompts';

const PALETTE = {
  amber: "#FFAD09",
  ember: "#F95826",
  rose: "#BA1650",
  teal: "#219EBC",
  violet: "#5C3B8F",
  cream: "#FFFCF2",
  ink: "#2F2C29",
  page: "#fbf6ef",
};

/**
 * TeachItBack — Reusable post-exercise reinforcement component.
 * Call after any exercise completes: <TeachItBack exerciseType="breathe" />
 */
export default function TeachItBack({ exerciseType = 'general', onClose }) {
  const [prompt] = useState(() => getPromptForExercise(exerciseType));
  const [mode, setMode] = useState(null); // null, 'voice', 'text'
  const [textAnswer, setTextAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 1800);
  };

  const canSave = (mode === 'text' && textAnswer.trim().length >= 3) || (mode === 'voice' && !isRecording);

  return (
    <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(212,131,10,0.10) 0%, rgba(255,252,242,0.6) 100%)', border: '1px solid rgba(212,131,10,0.2)' }}>
      {!saved ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#C97F0E' }}>
              Teach-It-Back
            </span>
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors"
              style={{ color: '#c4a882' }}
            >
              <SkipForward className="w-3 h-3" />
              Skip
            </button>
          </div>

          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 500, lineHeight: 1.5, marginBottom: 20, color: PALETTE.ink }}>
            {prompt}
          </p>

          {!mode && (
            <div className="flex gap-3">
              <button
                onClick={() => setMode('voice')}
                className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}
              >
                <Mic className="w-4 h-4" /> Voice note
              </button>
              <button
                onClick={() => setMode('text')}
                className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: PALETTE.amber, color: PALETTE.ink }}
              >
                <Type className="w-4 h-4" /> Type it
              </button>
            </div>
          )}

          {mode === 'voice' && (
            <div className="text-center">
              <button
                onClick={() => setIsRecording(v => !v)}
                className="rounded-full mx-auto block transition-all active:scale-90 mb-3"
                style={{
                  width: 64, height: 64,
                  background: isRecording ? PALETTE.ember : PALETTE.amber,
                  boxShadow: `0 0 20px ${isRecording ? PALETTE.ember : PALETTE.amber}44`,
                }}
              >
                <Mic className="w-6 h-6 mx-auto" style={{ color: PALETTE.cream }} />
              </button>
              <p className="text-xs mb-4" style={{ color: `${PALETTE.ink}A6` }}>
                {isRecording ? 'Recording… tap to stop' : 'Tap to start (up to 30 seconds)'}
              </p>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={isRecording} className="flex-1 rounded-full py-2.5 text-sm font-medium transition-all active:scale-95 disabled:opacity-50" style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                  Save
                </button>
                <button onClick={() => setMode(null)} className="rounded-full px-4 py-2.5 text-sm transition-all active:scale-95" style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                  Back
                </button>
              </div>
            </div>
          )}

          {mode === 'text' && (
            <div>
              <textarea
                value={textAnswer}
                onChange={e => setTextAnswer(e.target.value)}
                placeholder="Explain it in your own words…"
                rows={4}
                maxLength={800}
                className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none transition-all mb-3"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)', color: PALETTE.ink, fontFamily: 'var(--font-body)' }}
              />
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={!canSave} className="flex-1 rounded-full py-2.5 text-sm font-medium transition-all active:scale-95 disabled:opacity-50" style={{ background: PALETTE.ink, color: PALETTE.cream }}>
                  Save
                </button>
                <button onClick={() => setMode(null)} className="rounded-full px-4 py-2.5 text-sm transition-all active:scale-95" style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
                  Back
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <Check className="w-8 h-8 mx-auto mb-2" style={{ color: '#4a7c59' }} />
          <p className="text-sm" style={{ color: PALETTE.ink }}>
            Saved. Explaining it just helped it stick a little more.
          </p>
        </div>
      )}
    </div>
  );
}