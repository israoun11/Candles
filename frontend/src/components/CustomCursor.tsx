import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

// Three layers: orange diamond (tight), outline ring (lagging), contextual "Close" pill over backdrops.
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null), ring = useRef<HTMLDivElement>(null), pill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return;
    const [d, r, p] = [dot.current!, ring.current!, pill.current!];
    const qd = [gsap.quickTo(d, 'x', { duration: 0.12 }), gsap.quickTo(d, 'y', { duration: 0.12 })];
    const qr = [gsap.quickTo(r, 'x', { duration: 0.55, ease: 'power3' }), gsap.quickTo(r, 'y', { duration: 0.55, ease: 'power3' })];
    const qp = [gsap.quickTo(p, 'x', { duration: 0.2 }), gsap.quickTo(p, 'y', { duration: 0.2 })];
    const move = (e: MouseEvent) => { [qd, qr, qp].forEach(([x, y]) => { x(e.clientX); y(e.clientY); }); [d, r].forEach((n) => (n.style.opacity = '1')); };
    const over = (e: MouseEvent) => {
      const t = e.target as Element;
      const hot = !!t.closest('a,button,.tile,.rail-card');
      d.classList.toggle('hot', hot); r.classList.toggle('hot', hot);
      d.classList.toggle('dark', !!t.closest('.drawer'));
      p.classList.toggle('show', !!t.closest('.drawer-bg,.modal-bg'));
    };
    window.addEventListener('mousemove', move); window.addEventListener('mouseover', over);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseover', over); };
  }, []);
  return (
    <div aria-hidden>
      <div ref={ring} className="cur ring" style={{ opacity: 0 }}><i /></div>
      <div ref={dot} className="cur" style={{ opacity: 0 }}><i /></div>
      <div ref={pill} className="cur"><b className="cur-pill label"><span>Close</span></b></div>
    </div>
  );
}
