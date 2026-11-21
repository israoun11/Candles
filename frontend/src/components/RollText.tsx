import { useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

// Each character is stacked with an identical copy; on hover every letter rolls up one 20px line
// (300ms, 50ms apart), then resets invisibly because the copy is identical.
export default function RollText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);
  const play = () => {
    if (busy.current || prefersReducedMotion() || !ref.current) return;
    busy.current = true;
    const chars = ref.current.querySelectorAll('.rc-in');
    gsap.to(chars, { y: -20, duration: 0.3, ease: 'power2.out', stagger: 0.05,
      onComplete: () => { gsap.set(chars, { y: 0 }); busy.current = false; } });
  };
  return (
    <span ref={ref} className="roll" aria-label={text} onMouseEnter={play}>
      {[...text].map((c, i) => {
        const ch = c === ' ' ? '\u00a0' : c;
        return <span key={i} className="rc" aria-hidden><span className="rc-in"><span>{ch}</span><span>{ch}</span></span></span>;
      })}
    </span>
  );
}
