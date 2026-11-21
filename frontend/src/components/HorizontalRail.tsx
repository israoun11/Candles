import { useEffect, useRef, type ReactNode } from 'react';

// Mouse drag with momentum (93%/frame); touch uses native scrolling.
export default function HorizontalRail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const moved = useRef(0);
  useEffect(() => {
    const el = ref.current!; let drag = false, lx = 0, v = 0, raf = 0;
    const tick = () => { if (!drag && Math.abs(v) > 0.1) { el.scrollLeft -= v; v *= 0.93; raf = requestAnimationFrame(tick); } };
    const move = (e: PointerEvent) => { const dx = e.clientX - lx; el.scrollLeft -= dx; moved.current += Math.abs(dx); v = dx; lx = e.clientX; };
    const up = () => { drag = false; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); raf = requestAnimationFrame(tick); };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      drag = true; moved.current = 0; lx = e.clientX; v = 0; cancelAnimationFrame(raf);
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    };
    el.addEventListener('pointerdown', down);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointerdown', down); up(); };
  }, []);
  return <div ref={ref} className="rail" onClickCapture={(e) => { if (moved.current > 6) e.preventDefault(); }}>{children}</div>;
}
