import React, { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Shuffle, ChevronRight, Check, Eye, EyeOff } from 'lucide-react';
import { REWIRE_STATEMENTS, FARED_OPTIONS, MATCHUP_STEMS, getRandomStatement } from '@/lib/rewireStatements';
import TeachItBack from '@/components/exercises/TeachItBack';

const PALETTE = {
  amber: "#FFAD09",
  ember: "#F95826",
  teal: "#219EBC",
  cream: "#FFFCF2",
  ink: "#2F2C29",
  page: "#fbf6ef",
};

export default function RewireIn60Exercise() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [statement, setStatement] = useState(() => getRandomStatement());
  const [seenIds, setSeenIds] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [relevanceText, setRelevanceText] = useState('');
  const [fared, setFared] = useState(null);
  const [impactText, setImpactText] = useState('');
  const [matchupStem, setMatchupStem] = useState(null);
  const [matchupCompletion, setMatchupCompletion] = useState(null);

  const shuffle = () => {
    const next = getRandomStatement([...seenIds, statement.id]);
    setStatement(next);
    setSeenIds(prev => [...prev, statement.id]);
  };

  const pressIn = () => {
    setRevealed(false);
    setStep(2);
  };

  const toggleReveal = () => {
    setRevealed(r => !r);
  };

  const selectFared = (val) => {
    setFared(val);
  };

  const selectStem = (idx) => {
    setMatchupStem(idx);
  };

  const selectCompletion = (idx) => {
    setMatchupCompletion(idx);
  };

  const reset = () => {
    setStep(1);
    setStatement(getRandomStatement());
    setSeenIds([]);
    setRevealed(false);
    setRelevanceText('');
    setFared(null);
    setImpactText('');
    setMatchupStem(null);
    setMatchupCompletion(null);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center px-5"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>

      {/* Step indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${PALETTE.ink}60` }}>
          {step <= 6 ? `Step ${step} of 6` : 'Complete'}
        </span>
      </div>

      {/* STEP 1: The Statement */}
      {step === 1 && (
        <div className="text-center max-w-md w-full">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#C97F0E' }}>
            {statement.category.replace('/', ' / ')}
          </p>
          <div className="mb-8 rounded-2xl p-6" style={{
            background: 'linear-gradient(135deg, rgba(212,131,10,0.12) 0%, rgba(255,252,242,0.6) 100%)',
            border: '1px solid rgba(212,131,10,0.2)'
          }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, lineHeight: 1.4, color: PALETTE.ink }}>
              "{statement.statement}"
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={shuffle} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
              <Shuffle className="w-4 h-4" /> Shuffle
            </button>
            <button onClick={pressIn} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95"
              style={{ background: PALETTE.amber, color: PALETTE.ink, boxShadow: `0 12px 30px -10px ${PALETTE.amber}66` }}>
              Press In
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Quick Memorization Drill */}
      {step === 2 && (
        <div className="text-center max-w-md w-full">
          <p className="text-sm mb-6" style={{ color: `${PALETTE.ink}A6` }}>
            Try to recall the statement from memory. Tap to reveal it and check yourself.
          </p>
          <div className="mb-8 rounded-2xl p-6 min-h-[120px] flex items-center justify-center" style={{
            background: revealed ? 'linear-gradient(135deg, rgba(212,131,10,0.12) 0%, rgba(255,252,242,0.6) 100%)' : 'rgba(47,44,41,0.04)',
            border: `1px solid ${revealed ? 'rgba(212,131,10,0.2)' : 'rgba(47,44,41,0.08)'}`
          }}>
            {revealed ? (
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, lineHeight: 1.4, color: PALETTE.ink }}>
                "{statement.statement}"
              </p>
            ) : (
              <p className="text-sm italic" style={{ color: `${PALETTE.ink}40` }}>
                Close your eyes and try to recall it…
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={toggleReveal} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
              {revealed ? <><EyeOff className="w-4 h-4" /> Hide</> : <><Eye className="w-4 h-4" /> Reveal</>}
            </button>
            <button onClick={() => setStep(3)} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: PALETTE.amber, color: PALETTE.ink }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Relevance + How You Fared */}
      {step === 3 && (
        <div className="max-w-md w-full">
          <p className="text-sm font-medium mb-3" style={{ color: PALETTE.ink }}>
            {statement.relevance_prompt}
          </p>
          <textarea
            value={relevanceText}
            onChange={e => setRelevanceText(e.target.value)}
            placeholder="One or two sentences…"
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)', color: PALETTE.ink }}
          />
          <p className="text-sm font-medium mb-3" style={{ color: PALETTE.ink }}>
            How do you feel you fared operating in that reality?
          </p>
          <div className="flex gap-2 mb-6">
            {FARED_OPTIONS.map(opt => (
              <button key={opt} onClick={() => selectFared(opt)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all active:scale-95"
                style={{
                  background: fared === opt ? PALETTE.amber : `${PALETTE.ink}0A`,
                  color: fared === opt ? PALETTE.ink : `${PALETTE.ink}80`,
                  border: `1px solid ${fared === opt ? PALETTE.amber : 'transparent'}`
                }}>
                {opt}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(4)} disabled={!relevanceText.trim() || !fared}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 4: Present-Day Intertwining */}
      {step === 4 && (
        <div className="max-w-md w-full">
          <p className="text-sm font-medium mb-3" style={{ color: PALETTE.ink }}>
            {statement.present_impact_prompt}
          </p>
          <textarea
            value={impactText}
            onChange={e => setImpactText(e.target.value)}
            placeholder="One or two sentences…"
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none mb-6"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,131,10,0.18)', color: PALETTE.ink }}
          />
          <button onClick={() => setStep(5)} disabled={!impactText.trim()}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 5: Future Focus */}
      {step === 5 && (
        <div className="text-center max-w-md w-full">
          <p className="text-sm font-medium mb-3" style={{ color: PALETTE.ink }}>
            Now think ahead — how do you want to meet this going forward?
          </p>
          <p className="text-sm mb-8" style={{ color: `${PALETTE.ink}A6` }}>
            Take a moment to envision this at work in a situation you might face as part of your daily norm and interactions.
          </p>
          <button onClick={() => setStep(6)}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95"
            style={{ background: PALETTE.amber, color: PALETTE.ink, boxShadow: `0 12px 30px -10px ${PALETTE.amber}66` }}>
            Ready to continue
          </button>
        </div>
      )}

      {/* STEP 6: Matchup Game */}
      {step === 6 && (
        <div className="max-w-md w-full">
          <p className="text-sm font-medium mb-2 text-center" style={{ color: PALETTE.ink }}>
            Pick one from each column to declare your stance.
          </p>
          <p className="text-xs mb-5 text-center" style={{ color: `${PALETTE.ink}60` }}>
            "{statement.statement}"
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Column 1: Stems */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: `${PALETTE.ink}60` }}>Your stance</p>
              {MATCHUP_STEMS.map((stem, idx) => (
                <button key={idx} onClick={() => selectStem(idx)}
                  className="w-full text-left rounded-xl px-3 py-3 text-xs font-medium transition-all active:scale-95"
                  style={{
                    background: matchupStem === idx ? `${PALETTE.amber}22` : `${PALETTE.ink}0A`,
                    border: `1px solid ${matchupStem === idx ? PALETTE.amber : 'transparent'}`,
                    color: PALETTE.ink
                  }}>
                  {stem}
                </button>
              ))}
            </div>
            {/* Column 2: Completions */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: `${PALETTE.ink}60` }}>Your action</p>
              {statement.matchups.map((comp, idx) => (
                <button key={idx} onClick={() => selectCompletion(idx)}
                  className="w-full text-left rounded-xl px-3 py-3 text-xs font-medium transition-all active:scale-95"
                  style={{
                    background: matchupCompletion === idx ? `${PALETTE.teal}1A` : `${PALETTE.ink}0A`,
                    border: `1px solid ${matchupCompletion === idx ? PALETTE.teal : 'transparent'}`,
                    color: PALETTE.ink
                  }}>
                  {comp}
                </button>
              ))}
            </div>
          </div>
          {/* Preview */}
          {matchupStem !== null && matchupCompletion !== null && (
            <div className="mb-4 rounded-xl p-3 text-xs text-center" style={{ background: `${PALETTE.amber}12`, border: `1px solid ${PALETTE.amber}33` }}>
              <span style={{ color: PALETTE.ink }}>{MATCHUP_STEMS[matchupStem]} {statement.matchups[matchupCompletion]}.</span>
            </div>
          )}
          <button onClick={() => setStep(7)} disabled={matchupStem === null || matchupCompletion === null}
            className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.cream }}>
            Confirm <Check className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 7: Teach-It-Back */}
      {step === 7 && (
        <div className="max-w-md w-full">
          <div className="mb-4 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: `linear-gradient(135deg, ${PALETTE.amber} 0%, ${PALETTE.ember} 100%)` }}>
              <Check className="w-7 h-7" style={{ color: PALETTE.cream }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: PALETTE.ink }}>
              You worked through it.
            </h2>
          </div>
          <TeachItBack exerciseType="rewire-in-60" onClose={() => navigate(-1)} />
        </div>
      )}
    </div>
  );
}