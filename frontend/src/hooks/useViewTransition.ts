import type { MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { prefersReducedMotion } from './useReducedMotion';

interface ViewTransitionDocument { startViewTransition?: (update: () => void) => unknown }

// Router-version independent page transitions: wraps navigation in the browser's View Transitions API.
// Falls back to normal navigation when unsupported, with modifier-clicks, or with reduced motion.
export function useViewTransitionClick() {
  const navigate = useNavigate();
  return (e: MouseEvent<HTMLElement>, to: string) => {
    const doc = document as unknown as ViewTransitionDocument;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (typeof doc.startViewTransition !== 'function' || prefersReducedMotion()) return;
    e.preventDefault();
    doc.startViewTransition(() => { flushSync(() => navigate(to)); });
  };
}
