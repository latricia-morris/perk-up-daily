import { useRef, useEffect } from 'react';

/**
 * BreathingOrb — Shared particle canvas renderer for breathing exercises.
 * Reads scaleRef.current every frame to animate the orb size.
 * Takes gradientStops as a prop to determine color flow.
 */
export default function BreathingOrb({ scaleRef, gradientStops, size = 280 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const stops = gradientStops;
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
  }, [gradientStops, size]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}