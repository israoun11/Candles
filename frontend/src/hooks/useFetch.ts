import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function useFetch<T>(path: string | null) {
  const [s, set] = useState<{ data: T | null; error: string | null; loading: boolean }>({ data: null, error: null, loading: !!path });
  useEffect(() => {
    if (!path) return;
    let live = true;
    set((x) => ({ ...x, loading: true, error: null }));
    api<T>(path).then((data) => live && set({ data, error: null, loading: false })).catch((e: Error) => live && set({ data: null, error: e.message, loading: false }));
    return () => { live = false; };
  }, [path]);
  return s;
}
