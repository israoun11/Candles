import { useEffect, useState } from 'react';
export type Bp = 'd' | 't' | 'm';
const read = (): Bp => (window.matchMedia('(max-width:640px)').matches ? 'm' : window.matchMedia('(max-width:1024px)').matches ? 't' : 'd');
export function useBreakpoint(): Bp {
  const [bp, setBp] = useState<Bp>(read);
  useEffect(() => {
    const on = () => setBp(read());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return bp;
}
