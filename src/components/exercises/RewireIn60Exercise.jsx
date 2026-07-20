import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { Shuffle, Check, X, ChevronRight } from 'lucide-react';
import { REWIRE_STATEMENTS } from '@/lib/rewireStatements';

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

export default function RewireIn60Exercise() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('select'); // select, round1, round2, round3, round4, round5, complete
  const [statementIdx, setStatementIdx] = useState(0);
  const [revealedNodes, setRevealedNodes] = useState([]);
  const [tapCount, setTapCount] = useState(0);
  const [tileOrder, setTileOrder] = useState([]);
  const [chargeLevel, setChargeLevel] = useState(0);

  const statement = REWIRE_STATEMENTS[statementIdx];
  const words = statement.split(' ');
  const chunks = [];
  for (let i = 0; i < words.length; i += 2) {
    chunks.push(words.slice(i, i + 2).join(' '));
  }

  const shuffle = () => {
    setStatementIdx(prev => (prev + 1) % REWIRE_STATEMENTS.length);
  };

  const startRound = (round) => {
    setRevealedNodes([]);
    setTapCount(0);
    setTileOrder([]);
    setChargeLevel(0);
    setPhase(round);
  };

  const handleNodeTap = (idx) => {
    if (revealedNodes.includes(idx)) return;
    const next = [...revealedNodes, idx];
    setRevealedNodes(next);
    if (next.length === chunks.length) {
      setTimeout(() => {
        if (phase === 'round1') startRound('round2');
        else if (phase === 'round5') setPhase('complete');
      }, 600);
    }
  };

  const handleOrbTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 4) {
      setTimeout(() => startRound('round3'), 500);
    }
  };

  const handleTileTap = (idx) => {
    if (tileOrder.includes(idx)) return;
    const next = [...tileOrder, idx];
    setTileOrder(next);
    if (next.length === chunks.length) {
      setTimeout(() => startRound('round4'), 500);
    }
  };

  const handleChargeTap = () => {
    const next = chargeLevel + 25;
    setChargeLevel(next);
    if (next >= 100) {
      setTimeout(() => startRound('round5'), 500);
    }
  };

  const reset = () => {
    setPhase('select');
    setStatementIdx(0);
    setRevealedNodes([]);
    setTapCount(0);
    setTileOrder([]);
    setChargeLevel(0);
  };

  const roundLabels = {
    round1: 'Tap to Reveal',
    round2: 'Rhythm Tap',
    round3: 'Word Rebuild',
    round4: 'Swipe to Charge',
    round5: 'Final Pathway',
  };

  const roundNum = { round1: 1, round2: 2, round3: 3, round4: 4, round5: 5 };

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center px-5" style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}>
      {/* Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600 }}>{phase === 'select' ? 'Rewire in 60' : `Round ${roundNum[phase]} of 5`}</div>
        {phase !== 'select' && phase !== 'complete' && (
          <div style={{ fontSize: 12, opacity: 0.6 }}>{roundLabels[phase]}</div>
        )}
      </div>

      {/* SELECT PHASE */}
      {phase === 'select' && (
        <div className="text-center max-w-md">
          <div className="mb-6 rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(212,131,10,0.12) 0%, rgba(255,252,242,0.6) 100%)', border: '1px solid rgba(212,131,10,0.2)' }}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#C97F0E' }}>Today's Statement</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, lineHeight: 1.4, color: PALETTE.ink }}>
              "{statement}"
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={shuffle} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2" style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
              <Shuffle className="w-4 h-4" /> Shuffle
            </button>
            <button onClick={() => startRound('round1')} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95" style={{ background: PALETTE.amber, color: PALETTE.ink, boxShadow: `0 12px 30px -10px ${PALETTE.amber}66` }}>
              Start
            </button>
          </div>
        </div>
      )}

      {/* ROUND 1 & 5 — Tap to Reveal */}
      {(phase === 'round1' || phase === 'round5') && (
        <div className="text-center max-w-md w-full">
          <p className="text-sm mb-6" style={{ color: `${PALETTE.ink}A6` }}>Tap each node to reveal the statement.</p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {chunks.map((chunk, idx) => (
              <button
                key={idx}
                onClick={() => handleNodeTap(idx)}
                disabled={revealedNodes.includes(idx)}
                className="rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-95 min-w-[80px]"
                style={{
                  background: revealedNodes.includes(idx) ? `${PALETTE.amber}22` : `${PALETTE.ink}0F`,
                  border: `1px solid ${revealedNodes.includes(idx) ? PALETTE.amber : 'transparent'}`,
                  color: revealedNodes.includes(idx) ? PALETTE.ink : `${PALETTE.ink}60`,
                }}
              >
                {revealedNodes.includes(idx) ? chunk : '•'}
              </button>
            ))}
          </div>
          {revealedNodes.length === chunks.length && (
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, color: PALETTE.ink }}>
              "{statement}"
            </p>
          )}
        </div>
      )}

      {/* ROUND 2 — Rhythm Tap */}
      {phase === 'round2' && (
        <div className="text-center max-w-md">
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, marginBottom: 24, color: PALETTE.ink }}>
            "{statement}"
          </p>
          <p className="text-sm mb-8" style={{ color: `${PALETTE.ink}A6` }}>Tap the orb 4 times.</p>
          <button
            onClick={handleOrbTap}
            className="rounded-full transition-all active:scale-90 mx-auto block"
            style={{
              width: 100, height: 100,
              background: `radial-gradient(circle, ${PALETTE.amber} 0%, ${PALETTE.ember}88 70%, transparent 100%)`,
              boxShadow: `0 0 ${20 + tapCount * 10}px ${PALETTE.amber}66`,
            }}
          />
          <div className="flex gap-2 justify-center mt-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: i < tapCount ? PALETTE.amber : `${PALETTE.ink}1A` }} />
            ))}
          </div>
        </div>
      )}

      {/* ROUND 3 — Word Tile Rebuild */}
      {phase === 'round3' && (
        <div className="text-center max-w-md w-full">
          <p className="text-sm mb-6" style={{ color: `${PALETTE.ink}A6` }}>Tap the tiles in order to rebuild the statement.</p>
          <div className="mb-6 min-h-[40px] flex flex-wrap justify-center gap-2">
            {tileOrder.map((idx, pos) => (
              <span key={pos} className="rounded-lg px-3 py-2 text-sm" style={{ background: `${PALETTE.amber}22`, border: `1px solid ${PALETTE.amber}`, color: PALETTE.ink }}>
                {chunks[idx]}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {chunks.map((chunk, idx) => (
              <button
                key={idx}
                onClick={() => handleTileTap(idx)}
                disabled={tileOrder.includes(idx)}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-all active:scale-95"
                style={{
                  background: tileOrder.includes(idx) ? `${PALETTE.ink}08` : `${PALETTE.ink}0F`,
                  opacity: tileOrder.includes(idx) ? 0.3 : 1,
                  border: `1px solid ${PALETTE.ink}15`,
                  color: PALETTE.ink,
                }}
              >
                {chunk}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ROUND 4 — Swipe to Charge */}
      {phase === 'round4' && (
        <div className="text-center max-w-md w-full">
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, marginBottom: 24, color: PALETTE.ink }}>
            "{statement}"
          </p>
          <p className="text-sm mb-8" style={{ color: `${PALETTE.ink}A6` }}>Tap to charge the bar.</p>
          <button onClick={handleChargeTap} className="w-64 h-32 rounded-2xl mx-auto block transition-all active:scale-95 overflow-hidden relative" style={{ background: `${PALETTE.ink}0F`, border: `1px solid ${PALETTE.ink}15` }}>
            <div className="absolute bottom-0 left-0 right-0 transition-all duration-300" style={{ height: `${chargeLevel}%`, background: `linear-gradient(0deg, ${PALETTE.amber}, ${PALETTE.ember}88)` }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold" style={{ color: PALETTE.ink }}>{chargeLevel}%</span>
            </div>
          </button>
        </div>
      )}

      {/* COMPLETE */}
      {phase === 'complete' && (
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `linear-gradient(135deg, ${PALETTE.amber} 0%, ${PALETTE.ember} 100%)` }}>
            <Check className="w-8 h-8" style={{ color: PALETTE.cream }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, marginBottom: 8, color: PALETTE.ink }}>
            You reinforced this 5 times today.
          </h2>
          <p className="text-sm mb-8" style={{ color: `${PALETTE.ink}A6` }}>
            "{statement}"
          </p>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95" style={{ background: PALETTE.amber, color: PALETTE.ink }}>
              Do it again
            </button>
            <button onClick={() => navigate(-1)} className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-95" style={{ background: 'transparent', color: PALETTE.ink, border: `1px solid ${PALETTE.ink}26` }}>
              Done for today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}