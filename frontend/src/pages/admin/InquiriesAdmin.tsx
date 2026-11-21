import { useCallback, useEffect, useState } from 'react';
import { adminApi } from './lib';
import { Card, Empty, StatusPill } from './ui';

interface Inq { id: string; name: string; email: string; topic: string; message: string; status: string; createdAt: string }
export default function InquiriesAdmin() {
  const [items, setItems] = useState<Inq[] | null>(null), [err, setErr] = useState('');
  const load = useCallback(() => adminApi<Inq[]>('/inquiries').then(setItems).catch((e: Error) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const run = async (fn: () => Promise<unknown>) => { setErr(''); try { await fn(); await load(); } catch (e) { setErr((e as Error).message); } };
  return (
    <>
      {err && <p role="alert" className="a-err">{err}</p>}
      {!items ? <p className="a-muted">Loading…</p> : items.length === 0 ? <Card><Empty>No messages yet.</Empty></Card> : items.map((i) => (
        <Card key={i.id}>
          <div className="a-inq-h"><div><b>{i.name}</b> <a href={`mailto:${i.email}`}>{i.email}</a><small>{new Date(i.createdAt).toLocaleString()} · {i.topic}</small></div><StatusPill status={i.status} /></div>
          <p className="a-msg">{i.message}</p>
          <div className="a-actions">
            <select value={i.status} aria-label="Status" onChange={(e) => run(() => adminApi(`/inquiries/${i.id}`, 'PATCH', { status: e.target.value }))}>{['new', 'read', 'answered'].map((s) => <option key={s}>{s}</option>)}</select>
            <button className="a-btn danger" onClick={() => confirm('Delete this message?') && run(() => adminApi(`/inquiries/${i.id}`, 'DELETE'))}>Delete</button>
          </div>
        </Card>
      ))}
    </>
  );
}
