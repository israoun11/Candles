import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Artwork } from '../data/artworks';
import TileImage from './TileImage';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

const COLS = 9, ROWS = 3; // one period = the 27 originals
const AUTO = 17, HOVER = 2.5, FRICTION = 0.93; // px/s drift, px/s while inspecting, momentum kept per 60fps frame

function measure() {
  const vw = window.innerWidth, vh = window.innerHeight, m = vw <= 750;
  const k = m ? 0.56 : Math.min(1, Math.max(0.65, vw / 1440));
  const tw = Math.round(337 * k), th = Math.round(411 * k), gap = Math.round(42 * k);
  return { tw, th, gap, reps: Math.ceil((vh + th + gap) / (ROWS * (th + gap))) };
}
const wrap = (v: number, min: number, span: number) => ((((v - min) % span) + span) % span) + min;

export default function InfiniteArtWall({ items }: { items: Artwork[] }) {
  const [dim, setDim] = useState(measure);
  const stage = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLAnchorElement | null)[]>([]);
  const moved = useRef(0);

  useEffect(() => {
    const on = () => setDim(measure());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  useEffect(() => {
    const el = stage.current!, reduced = prefersReducedMotion();
    const cw = dim.tw + dim.gap, ch = dim.th + dim.gap, W = COLS * cw, H = ROWS * dim.reps * ch;
    let x = 0, y = 0, vx = 0, vy = 0, drift = reduced ? 0 : AUTO, hover = false, drag = false;
    let lx = 0, ly = 0, lt = 0, px = 0, py = 0, rx = 0, ry = 0, last = performance.now(), raf = 0;

    const frame = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000; last = now;
      drift += ((reduced ? 0 : hover ? HOVER : AUTO) - drift) * Math.min(1, dt * 3);
      if (!drag) { // momentum decays toward the automatic upper-left drift
        x += vx * dt * 60 - drift * dt; y += vy * dt * 60 - drift * dt;
        const f = Math.pow(FRICTION, dt * 60); vx *= f; vy *= f;
      }
      const k = 1 - Math.pow(0.94, dt * 60);
      rx += ((-py * 3 - vy * 0.08) - rx) * k; ry += ((px * 4 + vx * 0.08) - ry) * k;
      if (tilt.current) tilt.current.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      tiles.current.forEach((t, i) => {
        if (!t) return;
        const r = Math.floor(i / COLS), c = i % COLS;
        t.style.transform = `translate3d(${wrap(c * cw + x, -cw, W).toFixed(1)}px,${wrap(r * ch + y, -ch, H).toFixed(1)}px,0)`;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const down = (e: PointerEvent) => {
      drag = true; moved.current = 0; vx = vy = 0; lx = e.clientX; ly = e.clientY; lt = performance.now();
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    };
    const move = (e: PointerEvent) => {
      const dx = e.clientX - lx, dy = e.clientY - ly, n = performance.now(), ms = Math.max(n - lt, 1);
      x += dx; y += dy; moved.current += Math.abs(dx) + Math.abs(dy);
      vx = (dx / ms) * 16.7; vy = (dy / ms) * 16.7; lx = e.clientX; ly = e.clientY; lt = n;
    };
    const up = () => {
      drag = false;
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    };
    const hoverMove = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth - 0.5) * 2; py = (e.clientY / window.innerHeight - 0.5) * 2;
      hover = e.pointerType === 'mouse' && !!(e.target as Element).closest('.tile');
    };
    const leave = () => { hover = false; };
    const noDrag = (e: Event) => e.preventDefault();
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', hoverMove);
    el.addEventListener('pointerleave', leave); el.addEventListener('dragstart', noDrag);
    return () => {
      cancelAnimationFrame(raf); up();
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', hoverMove);
      el.removeEventListener('pointerleave', leave); el.removeEventListener('dragstart', noDrag);
    };
  }, [dim]);

  const count = COLS * ROWS * dim.reps;
  return (
    <div ref={stage} className="wall-stage">
      <div ref={tilt} className="wall-tilt">
        {Array.from({ length: count }, (_, i) => {
          const a = items[(Math.floor(i / COLS) % ROWS) * COLS + (i % COLS)];
          return (
            <Link key={i} to={a.to} ref={(n) => { tiles.current[i] = n; }} className="tile" draggable={false}
              style={{ width: dim.tw, height: dim.th }} onClick={(e) => { if (moved.current > 6) e.preventDefault(); }}>
              <TileImage key={a.image ?? a.id} a={a} />
              <span className="tile-cap">{a.caption}</span>
            </Link>
          );
        })}
      </div>
      <div className="blur b1" /><div className="blur b2" /><div className="blur b3" /><div className="vignette" />
    </div>
  );
}
