import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

/**
 * FocusExercise
 * Rhythm: 4s inhale → 4s hold → 4s exhale → 4s hold (box breathing)
 * Emotional tone: clear, balanced, alert and composed
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

const PHASES = [
  { name: "inhale", label: "Inhale", duration: 4000, scaleFrom: 0.4, scaleTo: 1.15 },
  { name: "hold-in", label: "Hold", duration: 4000, scaleFrom: 1.15, scaleTo: 1.15 },
  { name: "exhale", label: "Exhale", duration: 4000, scaleFrom: 1.15, scaleTo: 0.4 },
  { name: "hold-out", label: "Hold", duration: 4000, scaleFrom: 0.4, scaleTo: 0.4 },
];

const CYCLE_MS = PHASES.reduce((s, p) => s + p.duration, 0);
const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)));

// Bright warm sunrise gradient
const GRADIENT_STOPS = [
  { at: 0.0, rgb: [249, 88, 38] },   // ember (bottom)
  { at: 0.5, rgb: [255, 173, 9] },   // amber (middle)
  { at: 1.0, rgb: [255, 213, 100] }, // gold-amber (top)
];

const useFonts = () => {
  useEffect(() => {
    const id = "perkup-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap";
    document.head.appendChild(link);
  }, []);
};

const BENEFITS = {
  title: 'Benefits of "Focus"',
  subtitle: "The 4 · 4 · 4 · 4 box breath",
  bullets: [
    "Sharpens mental clarity and sustained attention",
    "Regulates emotional response under pressure",
    "Increases steady oxygen supply to the brain",
    "Trained by elite performers, athletes, and first responders",
    "Balances the sympathetic and parasympathetic systems",
    "Creates a grounded, alert, and composed state of mind",
  ],
};

export default function FocusExercise() {
  useFonts();

  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(Math.ceil(PHASES[0].duration / 1000));
  const [scale, setScale] = useState(PHASES[0].scaleFrom);
  const [modalOpen, setModalOpen] = useState(false);

  const startRef = useRef(0);
  const rafRef = useRef(0);
  const carryRef = useRef(0);
  const runningRef = useRef(false);
  const canvasRef = useRef(null);
  const scaleRef = useRef(PHASES[0].scaleFrom);

  const tick = useCallback(() => {
    if (!runningRef.current) return;
    const now = performance.now();
    const elapsed = (carryRef.current + (now - startRef.current)) % CYCLE_MS;
    let acc = 0;
    for (let i = 0; i < PHASES.length; i++) {
      const p = PHASES[i];
      if (elapsed < acc + p.duration) {
        const t = (elapsed - acc) / p.duration;
        const s = p.scaleFrom + (p.scaleTo - p.scaleFrom) * ease(t);
        scaleRef.current = s;
        setScale(s);
        setPhaseIndex(i);
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
        carryRef.current =
          (carryRef.current + (performance.now() - startRef.current)) % CYCLE_MS;
      }
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, tick]);

  // Tiny crisp particle cloud — colors flow through as a gradient
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
        seed: (i * 0.618) * Math.PI * 2,
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

      const ry = t * 0.19;
      const rx = Math.sin(t * 0.34) * 0.14;
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const cosX = Math.cos(rx), sinX = Math.sin(rx);

      const proj = [];
      for (const p of particles) {
        const disp =
          1 +
          Math.sin(p.x * 2.4 + t * 0.42) * 0.08 +
          Math.cos(p.y * 2.2 + t * 0.36) * 0.07 +
          Math.sin(p.z * 2.6 + t * 0.48) * 0.06;
        const x0 = p.x * disp;
        const y0 = p.y * disp;
        const z0 = p.z * disp;
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
        const v = p.gradPos + Math.sin(t * 0.16 + p.gradPos * 2.5) * 0.06;
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

  const toggle = () => setIsRunning((v) => !v);
  const reset = () => {
    setIsRunning(false);
    carryRef.current = 0;
    setPhaseIndex(0);
    setRemaining(Math.ceil(PHASES[0].duration / 1000));
    setScale(PHASES[0].scaleFrom);
    scaleRef.current = PHASES[0].scaleFrom;
  };

  const phase = PHASES[phaseIndex];

  return (
    <div
      data-testid="focus-exercise-root"
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: PALETTE.page,
        fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
        color: PALETTE.ink,
      }}
    >
      <style>{`
        @keyframes focus-drift-1 { 0%,100% { transform: translate3d(-8%, -6%, 0) scale(1);} 50% { transform: translate3d(6%, 4%, 0) scale(1.08);} }
        @keyframes focus-drift-2 { 0%,100% { transform: translate3d(10%, 8%, 0) scale(1.06);} 50% { transform: translate3d(-6%, -10%, 0) scale(0.94);} }
        @keyframes focus-drift-3 { 0%,100% { transform: translate3d(4%, -12%, 0) scale(0.98);} 50% { transform: translate3d(-10%, 6%, 0) scale(1.1);} }
        @keyframes focus-blob-morph { 0%,100% { border-radius: 50%; } 20% { border-radius: 58% 42% 60% 40% / 45% 55% 45% 55%; } 40% { border-radius: 45% 55% 40% 60% / 55% 45% 55% 45%; } 60% { border-radius: 62% 38% 52% 48% / 50% 58% 42% 50%; } 80% { border-radius: 48% 52% 45% 55% / 58% 42% 55% 45%; } }
        @keyframes focus-blob-morph-2 { 0%,100% { border-radius: 58% 42% 55% 45% / 48% 52% 48% 52%; } 33% { border-radius: 42% 58% 48% 52% / 55% 45% 60% 40%; } 66% { border-radius: 55% 45% 60% 40% / 42% 58% 45% 55%; } }
        @keyframes focus-fade-in { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: none;} }
      `}</style>

      {/* Warm energetic sunrise background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -inset-[20%]"
          style={{
            background: `radial-gradient(60% 55% at 24% 22%, ${PALETTE.amber}A6, transparent 62%)`,
            filter: "blur(45px)",
            animation: "focus-drift-1 26s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -inset-[20%]"
          style={{
            background: `radial-gradient(55% 55% at 78% 28%, ${PALETTE.ember}80, transparent 65%)`,
            filter: "blur(55px)",
            animation: "focus-drift-2 30s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -inset-[20%]"
          style={{
            background: `radial-gradient(65% 60% at 60% 88%, ${PALETTE.rose}55, transparent 62%)`,
            filter: "blur(60px)",
            animation: "focus-drift-3 34s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, rgba(255,252,242,0.55) 0%, rgba(255,252,242,0) 60%)",
          }}
        />
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 sm:py-14">
        <div
          className="relative w-full max-w-[440px] rounded-[28px] px-6 pb-7 pt-8 sm:max-w-[520px] sm:px-8 sm:pb-9 sm:pt-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,252,242,0.72) 0%, rgba(255,252,242,0.48) 100%)",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
            border: `1px solid ${PALETTE.cream}`,
            boxShadow:
              "0 30px 80px -30px rgba(47,44,41,0.28), 0 8px 24px -12px rgba(47,44,41,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
            animation: "focus-fade-in 0.7s ease-out both",
          }}
          data-testid="focus-card"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.22em]" style={{ color: `${PALETTE.ink}99` }}>
              Perk Up · Daily
            </span>
            <span
              className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]"
              style={{
                background: `${PALETTE.ember}1A`,
                color: PALETTE.ember,
                border: `1px solid ${PALETTE.ember}33`,
              }}
            >
              4 · 4 · 4 · 4 box
            </span>
          </div>

          <h1
            className="mb-1 text-3xl sm:text-4xl"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: PALETTE.ink,
            }}
          >
            Focus
          </h1>
          <p className="mb-6 text-sm sm:text-base" style={{ color: `${PALETTE.ink}A6` }}>
            An even box breath for clear, composed attention.
          </p>

          {/* Orb stage — tiny particle cloud with gradient colors flowing through */}
          <div
            data-testid="focus-orb-stage"
            className="relative mx-auto flex h-[300px] w-[300px] items-center justify-center overflow-visible sm:h-[360px] sm:w-[360px]"
          >
            <div
              className="absolute left-1/2 top-[86%] h-5 w-[46%] -translate-x-1/2 rounded-full"
              style={{
                background: `radial-gradient(50% 100% at 50% 50%, ${PALETTE.ink}33, transparent 70%)`,
                filter: "blur(12px)",
                transform: `translateX(-50%) scaleX(${0.55 + scale * 0.5})`,
                opacity: 0.2,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 360,
                height: 360,
                background: `radial-gradient(circle, ${PALETTE.amber}80 0%, ${PALETTE.ember}33 42%, transparent 72%)`,
                filter: "blur(40px)",
                transform: `scale(${0.55 + scale * 0.6})`,
                opacity: 0.9,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 290,
                height: 290,
                background: `radial-gradient(circle, ${PALETTE.amber}44 0%, ${PALETTE.ember}33 45%, transparent 70%)`,
                filter: "blur(24px)",
                transform: `scale(${0.65 + scale * 0.5})`,
              }}
            />
            <canvas
              ref={canvasRef}
              data-testid="focus-orb-canvas"
              style={{ width: 340, height: 340, position: "relative", display: "block" }}
            />
          </div>

          <div className="mt-6 flex flex-col items-center">
            <div
              data-testid="focus-timer"
              className="tabular-nums leading-none"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 300,
                fontSize: "72px",
                letterSpacing: "-0.03em",
                color: PALETTE.ink,
              }}
            >
              {remaining}
            </div>
            <div
              data-testid="focus-phase"
              className="mt-1 text-sm uppercase tracking-[0.32em]"
              style={{ color: `${PALETTE.ink}B3` }}
            >
              {isRunning ? phase.label : "Ready"}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              data-testid="focus-toggle-btn"
              onClick={toggle}
              className="flex-1 rounded-full py-3.5 text-sm font-medium tracking-wide transition-all active:scale-[0.98]"
              style={{
                background: isRunning ? PALETTE.ink : PALETTE.ember,
                color: PALETTE.cream,
                boxShadow: isRunning
                  ? `0 10px 30px -12px ${PALETTE.ink}80`
                  : `0 12px 30px -10px ${PALETTE.ember}A6`,
              }}
            >
              {isRunning ? "Pause" : "Begin"}
            </button>
            <button
              data-testid="focus-reset-btn"
              onClick={reset}
              className="rounded-full px-5 py-3.5 text-sm transition-all active:scale-[0.98]"
              style={{
                background: "transparent",
                color: PALETTE.ink,
                border: `1px solid ${PALETTE.ink}26`,
              }}
            >
              Reset
            </button>
          </div>

          <button
            data-testid="focus-benefits-btn"
            onClick={() => setModalOpen(true)}
            className="mt-3 w-full rounded-full py-3 text-sm transition-all active:scale-[0.99]"
            style={{
              background: "transparent",
              color: PALETTE.ember,
              border: `1px solid ${PALETTE.ember}40`,
            }}
          >
            Benefits of “Focus”
          </button>
        </div>
      </div>

      {modalOpen && (
        <div
          data-testid="focus-benefits-modal"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          style={{ background: "rgba(47,44,41,0.42)", backdropFilter: "blur(8px)" }}
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] rounded-t-[28px] p-7 sm:rounded-[28px] sm:p-9"
            style={{
              background: PALETTE.cream,
              boxShadow: "0 -20px 60px -20px rgba(47,44,41,0.3)",
              animation: "focus-fade-in 0.35s ease-out both",
              border: `1px solid ${PALETTE.ink}12`,
            }}
          >
            <div className="mb-1 flex items-start justify-between">
              <div>
                <h2
                  className="text-2xl sm:text-3xl"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 500,
                    color: PALETTE.ink,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {BENEFITS.title}
                </h2>
                <p className="mt-1 text-sm" style={{ color: `${PALETTE.ink}99` }}>
                  {BENEFITS.subtitle}
                </p>
              </div>
              <button
                data-testid="focus-modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="ml-4 h-9 w-9 rounded-full text-lg transition-all active:scale-95"
                style={{ background: `${PALETTE.ink}0F`, color: PALETTE.ink }}
              >
                ×
              </button>
            </div>

            <ul className="mt-5 space-y-3">
              {BENEFITS.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-[15px] leading-relaxed"
                  style={{ color: PALETTE.ink }}
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
                    style={{ background: PALETTE.ember }}
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <button
              data-testid="focus-modal-done"
              onClick={() => setModalOpen(false)}
              className="mt-7 w-full rounded-full py-3.5 text-sm font-medium transition-all active:scale-[0.98]"
              style={{
                background: PALETTE.ink,
                color: PALETTE.cream,
              }}
            >
              Continue breathing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}