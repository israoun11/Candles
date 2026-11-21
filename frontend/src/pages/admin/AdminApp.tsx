import { useEffect, useState, type FormEvent } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import AboutAdmin from './AboutAdmin';
import CollectionsAdmin from './CollectionsAdmin';
import ContactAdmin from './ContactAdmin';
import InquiriesAdmin from './InquiriesAdmin';
import OrdersAdmin from './OrdersAdmin';
import Overview from './Overview';
import ProductsAdmin from './ProductsAdmin';
import SettingsAdmin from './SettingsAdmin';
import { adminApi } from './lib';
import { Icon } from './ui';

const ICONS = {
  overview: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  orders: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  products: 'M21 8l-9-5-9 5v8l9 5 9-5zM3.3 7.5L12 12.5l8.7-5M12 22V12.5',
  collections: 'M12 2l10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5',
  inquiries: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
  settings: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  about: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8',
  contact: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  menu: 'M3 6h18M3 12h18M3 18h18',
};
const GROUPS: { label: string; items: { to: string; label: string; icon: keyof typeof ICONS; title: string; desc: string }[] }[] = [
  { label: 'Shop', items: [
    { to: '/admin', label: 'Overview', icon: 'overview', title: 'Overview', desc: 'A quick look at your shop.' },
    { to: '/admin/orders', label: 'Orders', icon: 'orders', title: 'Orders', desc: 'Review and update customer orders.' },
    { to: '/admin/products', label: 'Products', icon: 'products', title: 'Products', desc: 'Prices, stock, images and visibility.' },
    { to: '/admin/collections', label: 'Collections', icon: 'collections', title: 'Collections', desc: 'Group products and choose cover images.' },
    { to: '/admin/inquiries', label: 'Inquiries', icon: 'inquiries', title: 'Inquiries', desc: 'Messages from your customers.' },
  ] },
  { label: 'Website', items: [
    { to: '/admin/settings', label: 'Settings', icon: 'settings', title: 'Settings', desc: 'Homepage, announcement, contact details and shipping.' },
    { to: '/admin/about', label: 'About page', icon: 'about', title: 'About page', desc: 'Story text, photos and the 3D spiral.' },
    { to: '/admin/contact', label: 'Contact page', icon: 'contact', title: 'Contact page', desc: 'Heading, slideshow images and questions.' },
  ] },
];
const EMAIL_KEY = 'artisra-admin-email';

function Login({ onDone }: { onDone: (email: string) => void }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { const r = await adminApi<{ email: string }>('/login', 'POST', { email, password }); onDone(r.email); }
    catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="adm a-login"><form onSubmit={submit}>
      <span className="a-brand">ARTISRA</span>
      <h1>Sign in</h1><p className="a-muted">Admin dashboard</p>
      <label className="a-fld"><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label>
      <label className="a-fld"><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
      {err && <p role="alert" className="a-err">{err}</p>}
      <button className="a-btn primary wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form></div>
  );
}

export default function AdminApp() {
  const [auth, setAuth] = useState<'loading' | 'in' | 'out'>('loading'), [email, setEmail] = useState(() => sessionStorage.getItem(EMAIL_KEY) ?? ''), [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = 'ARTISRA admin';
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.append(m);
    adminApi('/me').then(() => setAuth('in')).catch(() => setAuth('out'));
    return () => m.remove();
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  if (auth === 'loading') return <div className="adm"><p className="a-pad">Loading…</p></div>;
  if (auth === 'out') return <Login onDone={(e) => { sessionStorage.setItem(EMAIL_KEY, e); setEmail(e); setAuth('in'); }} />;
  const here = GROUPS.flatMap((g) => g.items).find((i) => i.to === pathname.replace(/\/$/, '')) ?? GROUPS[0].items[0];
  const logout = async () => { await adminApi('/logout', 'POST'); sessionStorage.removeItem(EMAIL_KEY); setAuth('out'); };
  return (
    <div className="adm">
      <aside className={`a-side${open ? ' open' : ''}`}>
        <span className="a-brand">ARTISRA</span>
        <nav aria-label="Admin">
          {GROUPS.map((g) => (
            <div key={g.label} className="a-group"><p>{g.label}</p>
              {g.items.map((i) => <NavLink key={i.to} to={i.to} end={i.to === '/admin'}><Icon d={ICONS[i.icon]} />{i.label}</NavLink>)}
            </div>
          ))}
        </nav>
        <div className="a-side-foot">
          <a href="/" target="_blank" rel="noreferrer">View website ↗</a>
          <button className="a-btn wide" onClick={logout}><Icon d={ICONS.logout} />Log out</button>
        </div>
      </aside>
      {open && <div className="a-scrim a-side-scrim" onClick={() => setOpen(false)} />}
      <div className="a-content">
        <header className="a-top">
          <button className="a-btn a-burger" onClick={() => setOpen(true)} aria-label="Open menu"><Icon d={ICONS.menu} /></button>
          <div className="a-top-title"><h1>{here.title}</h1><p>{here.desc}</p></div>
          <div className="a-user"><span className="a-avatar" aria-hidden>{(email || 'A')[0].toUpperCase()}</span><span><b>Administrator</b>{email && <small>{email}</small>}</span></div>
        </header>
        <main className="a-page">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="collections" element={<CollectionsAdmin />} />
            <Route path="inquiries" element={<InquiriesAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
            <Route path="about" element={<AboutAdmin />} />
            <Route path="contact" element={<ContactAdmin />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
