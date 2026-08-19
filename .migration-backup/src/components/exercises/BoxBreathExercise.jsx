import React, { useState, useEffect, useRef, useCallback } from "react";

/**
 * BoxBreathExercise
 * Rhythm: 4s inhale → 4s hold → 4s exhale → 4s hold (classic box breathing)
 * Repeats for 4 cycles
 * Emotional tone: steady, structured, disciplined rhythm
 * Fully self-contained. Paste-in ready.
 */

const PALETTE = {
  amber: "#FFAD09",
  ember: "#F95826",
  rose: "#BA1650",
  teal: "#219EBC",
  sky: "#8ECAE6",
  violet: "#5C3B8F",
  cream: "#FFFCF2",
  ink: "#2F2C29",
  page: "#fbf6ef",
};

const TOTAL_CYCLES = 4;

const PHASES = [
  { name: "inhale", label: "Inhale", duration: 4000, scaleFrom: 0.35, scaleTo: 1.15 },
  { name: "hold-in", label: "Hold", duration: 4000, scaleFrom: 1.15, scaleTo: 1.15 },
  { name: "exhale", label: "Exhale", duration: 4000, scaleFrom: 1.15, scaleTo: 0.35 },
  { name: "hold-out", label: "Hold", duration: 4000, scaleFrom: 0.35, scaleTo: 0.35 },
];

const PHASE_CYCLE_MS = PHASES.reduce((s, p) => s + p.duration, 0);
const CYCLE_MS = PHASE_CYCLE_MS * TOTAL_CYCLES;

const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)));

// Golden, sun-like gradient — mirrors the original's shift into "sun mode"
const GRADIENT_STOPS = [
  { at: 0.0, rgb: [186, 22, 80] },   // rose (bottom)
  { at: 0.5, rgb: [231, 161, 52] },  // amber (middle)
  { at: 1.0, rgb: [255, 213, 100] }, // light gold (top)
];

const useFonts = () => {
  useEffect(() => {
    const id = "perkup-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap";
    document.head.appendChild(link);
  }, []);
};

const BENEFITS = {
  title: 'Benefits of "Box Breath"',
  subtitle: "The 4 · 4 · 4 · 4 steady rhythm",
  bullets: [
    "Builds a stable, repeatable rhythm the nervous system can lock onto",
    "Used by Navy SEALs and first responders to stay composed under pressure",
    "Improves focus and reaction time by steadying oxygen flow",
    "Balances the sympathetic and parasympathetic nervous systems evenly",
    "Strengthens the habit of intentional, paced breathing",
    "Creates a grounded, disciplined sense of control",
  ],
};

export default function BoxBreathExercise() {
  useFonts();
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [remaining, setRemaining] = useState(Math.ceil(PHASES[0].duration / 1000));
  const [scale, setScale] = useState(PHASES[0].scaleFrom);
  const [modalOpen, setModalOpen] = useState(false);
  const [complete, setComplete] = useState(false);

  const startRef = useRef(0);
  const rafRef = useRef(0);
  const carryRef = useRef(0);
  const runningRef = useRef(false);
  const canvasRef = useRef(null);
  const scaleRef = useRef(PHASES[0].scaleFrom);

  const tick = useCallback(() => {
    if (!runningRef.current) return;
    const now = performance.now();
    const totalElapsed = carryRef.current + (now - startRef.current);

    if (totalElapsed >= CYCLE_MS) {
      runningRef.current = false;
      setIsRunning(false);
      setComplete(true);
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const cycleIdx = Math.min(TOTAL_CYCLES - 1, Math.floor(totalElapsed / PHASE_CYCLE_MS));
    const elapsed = totalElapsed % PHASE_CYCLE_MS;
    let acc = 0;
    for (let i = 0; i < PHASES.length; i++) {
      const p = PHASES[i];
      if (elapsed < acc + p.duration) {
        const t = (elapsed - acc) / p.duration;
        const s = p.scaleFrom + (p.scaleTo - p.scaleFrom) * ease(t);
        scaleRef.current = s;
        setScale(s);
        setPhaseIndex(i);
        setCycle(cycleIdx);
        setRemaining(Math.max(1, Math.ceil((p.duration - (elapsed - acc)) / 1000)));
        break;
      }
      acc += p.duration;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    runningRef.current = isRunning;
    if (isRunning) {
      startRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
      if (startRef.current) {
        carryRef.current = carryRef.current + (performance.now() - startRef.current);
      }
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, tick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 340;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const stops = GRADIENT_STOPS;
    const sample = (v) => {
      v = v < 0 ? 0 : v > 1 ? 1 : v;
      for (let i = 0; i < stops.length - 1; i++) {
        if (v <= stops[i + 1].at) {
          const tt = (v - stops[i].at) / (stops[i + 1].at - stops[i].at);
          return [
            stops[i].rgb[0] + (stops[i + 1].rgb[0] - stops[i].rgb[0]) * tt,
            stops[i].rgb[1] + (stops[i + 1].rgb[1] - stops[i].rgb[1]) * tt,
            stops[i].rgb[2] + (stops[i + 1].rgb[2] - stops[i].rgb[2]) * tt,
          ];
        }
      }
      return stops[stops.length - 1].rgb;
    };

    const N = 620;
    const particles = [];
    for (let i = 0; i < N; i++) {
      const yv = 1 - (i / (N - 1)) * 2;
      const rr = Math.sqrt(1 - yv * yv);
      const theta = Math.PI * (3 - Math.sqrt(5)) * i;
      particles.push({
        x: Math.cos(theta) * rr,
        y: yv,
        z: Math.sin(theta) * rr,
        gradPos: (yv + 1) / 2,
      });
    }

    let raf;
    const t0 = performance.now();
    const cx = size / 2;
    const cy = size / 2;
    const baseR = size * 0.36;

    const draw = (now) => {
      const t = (now - t0) / 1000;
      const s = scaleRef.current;
      const R = baseR * (0.35 + s * 0.75);
      ctx.clearRect(0, 0, size, size);
      const ry = t * 0.13;
      const rx = Math.sin(t * 0.29) * 0.14;
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const proj = [];
      for (const p of particles) {
        const disp = 1 + Math.sin(p.x * 2.4 + t * 0.37) * 0.08 + Math.cos(p.y * 2.2 + t * 0.31) * 0.07 + Math.sin(p.z * 2.6 + t * 0.43) * 0.06;
        const x0 = p.x * disp, y0 = p.y * disp, z0 = p.z * disp;
        const x1 = x0 * cosY + z0 * sinY;
        const z1 = -x0 * sinY + z0 * cosY;
        const y2 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;
        const persp = 1.4 / (1.55 - z2 * 0.4);
        proj.push({ p, px: cx + x1 * R * persp, py: cy + y2 * R * persp, z2 });
      }
      proj.sort((a, b) => a.z2 - b.z2);
      for (const it of proj) {
        const { p, px, py, z2 } = it;
        const depth = (z2 + 1) / 2;
        const alpha = 0.32 + depth * 0.55;
        const sz = 0.7 + depth * 0.9;
        const v = p.gradPos + Math.sin(t * 0.13 + p.gradPos * 2.4) * 0.06;
        const [r, g, b] = sample(v);
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggle = () => {
    if (complete) reset();
    setIsRunning((v) => !v);
  };

  const reset = () => {
    setIsRunning(false);
    carryRef.current = 0;
    setPhaseIndex(0);
    setCycle(0);
    setComplete(false);
    setRemaining(Math.ceil(PHASES[0].duration / 1000));
    setScale(PHASES[0].scaleFrom);
    scaleRef.current = PHASES[0].scaleFrom;
  };

  const phase = PHASES[phaseIndex];

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        background: PALETTE.page,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily: "'DM Sans', sans-serif",
        color: PALETTE.ink,
        padding: 24,
        position: "relative",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 }}>Box Breath</div>
        <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>
          {complete ? "Rhythm reset — steady and clear." : `Cycle ${cycle + 1} of ${TOTAL_CYCLES}`}
        </div>
      </div>

      <div style={{ position: "relative", width: 340, height: 340 }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: 0.5 }}>
            {complete ? "Complete" : phase.label}
          </div>
          {!complete && <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>{remaining}</div>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={toggle}
          style={{
            padding: "12px 32px",
            borderRadius: 24,
            border: "none",
            background: PALETTE.amber,
            color: PALETTE.ink,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {complete ? "Restart" : isRunning ? "Pause" : "Begin"}
        </button>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: "12px 24px",
            borderRadius: 24,
            border: `1px solid ${PALETTE.ink}22`,
            background: "transparent",
            color: PALETTE.ink,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Why it works
        </button>
      </div>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: PALETTE.cream,
              borderRadius: 16,
              padding: 28,
              maxWidth: 420,
            }}
          >
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600 }}>{BENEFITS.title}</div>
            <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 16 }}>{BENEFITS.subtitle}</div>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              {BENEFITS.bullets.map((b, i) => (
                <li key={i} style={{ marginBottom: 8, fontSize: 14, lineHeight: 1.5 }}>{b}</li>
              ))}
            </ul>
            <button
              onClick={() => setModalOpen(false)}
              style={{
                marginTop: 16,
                padding: "10px 20px",
                borderRadius: 20,
                border: "none",
                background: PALETTE.ink,
                color: PALETTE.cream,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}