import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFetch } from '../hooks/useFetch';
import { api, type Settings } from '../lib/api';

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const nav = useNavigate();
  const s = useFetch<Settings>('/settings').data;
  const [f, setF] = useState({ name: '', phone: '', email: '', governorate: '', city: '', details: '', note: '' });
  const [err, setErr] = useState<Record<string, string>>({}), [busy, setBusy] = useState(false), [fail, setFail] = useState('');
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const shipping = s ? (s.shipping.freeOver > 0 && subtotal >= s.shipping.freeOver ? 0 : s.shipping.fee) : 0;
  if (!items.length) return <div className="pg"><h1 className="pg-title">Checkout</h1><p>Your cart is empty.</p><Link className="btn" to="/collections">See the collections</Link></div>;

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setFail('');
    const bad: Record<string, string> = {};
    if (f.name.trim().length < 2) bad.name = 'Enter your full name.';
    if (!/^(\+216)?[2-9]\d{7}$/.test(f.phone.replace(/[\s.-]/g, ''))) bad.phone = 'Enter a valid Tunisian phone number (8 digits).';
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) bad.email = 'Enter a valid email or leave it empty.';
    if (!f.governorate) bad.governorate = 'Choose your governorate.';
    if (f.city.trim().length < 2) bad.city = 'Enter your city.';
    if (f.details.trim().length < 3) bad.details = 'Enter your street and delivery details.';
    setErr(bad);
    if (Object.keys(bad).length) return;
    setBusy(true);
    try {
      const o = await api<{ number: string }>('/orders', { method: 'POST', body: JSON.stringify({
        items: items.map((i) => ({ productId: i.id, variantLabel: i.variant ?? 'Standard', qty: i.qty })),
        customer: { name: f.name, phone: f.phone, email: f.email }, address: { governorate: f.governorate, city: f.city, details: f.details }, note: f.note || undefined }) });
      clear();
      nav(`/order/${o.number}?phone=${encodeURIComponent(f.phone.replace(/[\s.-]/g, ''))}`);
    } catch (x) { setFail((x as Error).message); } finally { setBusy(false); }
  };
  const field = (k: keyof typeof f, label: string, extra: object = {}) => (
    <label className="fld">{label}<input value={f[k]} onChange={set(k)} aria-invalid={!!err[k]} {...extra} />{err[k] && <em role="alert">{err[k]}</em>}</label>
  );
  return (
    <div className="pg checkout">
      <h1 className="pg-title">Checkout</h1>
      <form onSubmit={submit} noValidate>
        {field('name', 'Full name', { autoComplete: 'name' })}
        {field('phone', 'Phone number', { autoComplete: 'tel', inputMode: 'tel' })}
        {field('email', 'Email (optional)', { autoComplete: 'email', type: 'email' })}
        <label className="fld">Governorate
          <select value={f.governorate} onChange={set('governorate')} aria-invalid={!!err.governorate}><option value="">Choose…</option>{s?.governorates.map((g) => <option key={g}>{g}</option>)}</select>
          {err.governorate && <em role="alert">{err.governorate}</em>}</label>
        {field('city', 'City', { autoComplete: 'address-level2' })}
        {field('details', 'Street and delivery details', { autoComplete: 'street-address' })}
        {field('note', 'Note for us (optional)')}
        <p className="note"><strong>Payment:</strong> cash on delivery. No online payment is taken.</p>
        {fail && <p role="alert" className="fail">{fail}</p>}
        <button className="btn" disabled={busy || !s}>{busy ? 'Placing order…' : 'Place order'}</button>
      </form>
      <aside className="summary">
        <h2>Your order</h2>
        <ul>{items.map((i) => <li key={`${i.id}|${i.variant}`}><span>{i.qty} × {i.name}{i.variant ? ` (${i.variant})` : ''}</span><span>{i.qty * i.price} TND</span></li>)}</ul>
        <p className="row"><span>Subtotal</span><span>{subtotal} TND</span></p>
        <p className="row"><span>Delivery</span><span>{shipping} TND</span></p>
        <p className="row total"><span>Total</span><span>{subtotal + shipping} TND</span></p>
        <p className="note">Final prices and stock are confirmed by our server when you place the order.</p>
      </aside>
    </div>
  );
}
