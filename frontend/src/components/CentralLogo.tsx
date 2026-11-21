import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import { site } from '../config/site';

// Letter-by-letter rise from a clipping mask: starts 0.15s after load, 1.2s each, 45ms apart.
export default function CentralLogo() {
  const root = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('.logo-char', { yPercent: 115, duration: 1.2, ease: 'power4.out', stagger: 0.045, delay: 0.15 });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <h1 ref={root} className="central-logo" aria-label={site.name}>
      {[...site.name].map((c, i) => <span key={i} className="logo-mask" aria-hidden><span className="logo-char">{c}</span></span>)}
    </h1>
  );
}
