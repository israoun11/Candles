import { useEffect, useState } from 'react';
import type { Settings } from '../../lib/api';
import { adminApi } from './lib';

// Loads the site settings and saves them back (the whole document, so other sections are preserved).
export function useSettingsDoc() {
  const [s, setS] = useState<Settings | null>(null), [err, setErr] = useState(''), [ok, setOk] = useState(false), [busy, setBusy] = useState(false);
  useEffect(() => { adminApi<Settings>('/settings').then(setS).catch((e: Error) => setErr(e.message)); }, []);
  const update = (patch: Partial<Settings>) => { setOk(false); setS((cur) => (cur ? { ...cur, ...patch } : cur)); };
  const save = async (patch?: Partial<Settings>) => {
    if (!s) return;
    setErr(''); setOk(false); setBusy(true);
    const { governorates, ...body } = { ...s, ...patch };
    try { const r = await adminApi<Settings>('/settings', 'PUT', body); setS({ ...r, governorates }); setOk(true); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  return { s, update, save, err, ok, busy };
}
