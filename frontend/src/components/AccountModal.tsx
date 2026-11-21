import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useUi } from '../context/UiContext';
import { api } from '../lib/api';

interface O { number: string; status: string; total: number; items: { title: string; qty: number }[] }
// No customer accounts: guests look up an order with its number and checkout phone.
export default function AccountModal() {
  const { accountOpen, setAccountOpen } = useUi();
  const [number, setNumber] = useState(''), [phone, setPhone] = useState(''), [o, setO] = useState<O | null>(null), [err, setErr] = useState('');
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!accountOpen) return;
    first.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAccountOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [accountOpen, setAccountOpen]);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr(''); setO(null);
    try { setO(await api<O>(`/orders/${encodeURIComponent(number.trim())}?phone=${encodeURIComponent(phone.replace(/[\s.-]/g, ''))}`)); }
    catch (x) { setErr((x as Error).message); }
  };
  return (
    <div className={`modal-bg${accountOpen ? ' open' : ''}`} onClick={() => setAccountOpen(false)} aria-hidden={!accountOpen}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Track your order" onClick={(e) => e.stopPropagation()}>
        <h2>Track your order</h2>
        <form onSubmit={submit}>
          <label className="fld">Order number<input ref={first} value={number} onChange={(e) => setNumber(e.target.value)} placeholder="AR-241120-AB12" tabIndex={accountOpen ? 0 : -1} /></label>
          <label className="fld">Phone used at checkout<input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" tabIndex={accountOpen ? 0 : -1} /></label>
          <button className="btn" tabIndex={accountOpen ? 0 : -1}>Find my order</button>
        </form>
        {err && <p role="alert" className="fail">{err}</p>}
        {o && <p role="status"><strong>{o.number}</strong> — {o.status}. {o.items.map((i) => `${i.qty} × ${i.title}`).join(', ')}. Total {o.total} TND.</p>}
        <button className="label" onClick={() => setAccountOpen(false)} tabIndex={accountOpen ? 0 : -1}>Close</button>
      </div>
    </div>
  );
}
