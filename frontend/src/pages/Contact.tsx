import { useEffect, useState, type FormEvent } from 'react';
import Placeholder from '../components/Placeholder';
import SafeImg from '../components/SafeImg';
import { useFetch } from '../hooks/useFetch';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import { api, toneFor, type Settings } from '../lib/api';

const topics = [['order', 'My order'], ['product', 'A candle'], ['custom', 'A custom piece'], ['other', 'Something else']] as const;
const fallbackSlides = ['the-twist', 'bubble-pop', 'sunday-mood', 'wavy-baby', 'cherry-baby', 'golden-hour', 'peachy'];

export default function Contact() {
  const { data: s, error } = useFetch<Settings>('/settings');
  const [topic, setTopic] = useState<string>('order'), [f, setF] = useState({ name: '', email: '', message: '' });
  const [err, setErr] = useState<Record<string, string>>({}), [state, setState] = useState<'idle' | 'busy' | 'done'>('idle'), [fail, setFail] = useState('');
  const [slide, setSlide] = useState(0);
  const urls = s?.contactPage.slides ?? [];
  const count = urls.length || fallbackSlides.length;
  useEffect(() => {
    if (prefersReducedMotion() || count < 2) return;
    const t = setInterval(() => setSlide((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count]);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setFail('');
    const bad: Record<string, string> = {};
    if (f.name.trim().length < 2) bad.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) bad.email = 'Enter a valid email.';
    if (f.message.trim().length < 5) bad.message = 'Write a few words.';
    setErr(bad);
    if (Object.keys(bad).length) return;
    setState('busy');
    try { await api('/inquiries', { method: 'POST', body: JSON.stringify({ ...f, topic }) }); setState('done'); }
    catch (x) { setFail((x as Error).message); setState('idle'); }
  };
  if (error) return <div className="pg"><p role="alert" className="fail">{error}</p></div>;
  if (!s) return <div className="pg"><p className="label center">Loading…</p></div>;
  const wa = s.contact.whatsapp.replace(/\D/g, '');
  return (
    <div className="contact">
      <div className="slides" aria-hidden>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={`slide${i === slide ? ' on' : ''}`}>
            <SafeImg key={urls[i]} src={urls[i]} alt="" loading={i ? 'lazy' : 'eager'} fallback={<Placeholder tone={toneFor(fallbackSlides[i % fallbackSlides.length])} label="slide" />} />
          </div>
        ))}
      </div>
      <div className="pg contact-form">
        <p className="eyebrow">Contact</p>
        <h1 className="pg-title">{s.contactPage.heading}</h1>
        <p className="lead">{s.contactPage.intro}</p>
        {state === 'done' ? <p role="status" className="lead">Thank you — your message was sent. We’ll reply as soon as we can.</p> : (
          <form onSubmit={submit} noValidate>
            <div className="topics" role="radiogroup" aria-label="Topic">{topics.map(([k, l]) => <button type="button" key={k} role="radio" aria-checked={topic === k} className={`opt${topic === k ? ' on' : ''}`} onClick={() => setTopic(k)}>{l}</button>)}</div>
            <label className="fld">Name<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={!!err.name} />{err.name && <em role="alert">{err.name}</em>}</label>
            <label className="fld">Email<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-invalid={!!err.email} />{err.email && <em role="alert">{err.email}</em>}</label>
            <label className="fld">Message<textarea rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} aria-invalid={!!err.message} />{err.message && <em role="alert">{err.message}</em>}</label>
            {fail && <p role="alert" className="fail">{fail}</p>}
            <button className="btn" disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : 'Send message'}</button>
          </form>
        )}
        {(s.contact.email || s.contact.phone || wa || s.contact.address || s.socials.length > 0) && (
          <p className="note">{s.contact.email && <>Email: <a href={`mailto:${s.contact.email}`}>{s.contact.email}</a><br /></>}{s.contact.phone && <>Phone: {s.contact.phone}<br /></>}{wa && <><a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</a><br /></>}{s.contact.address}{s.socials.map((x) => <span key={x.href}> · <a href={x.href} target="_blank" rel="noreferrer">{x.label}</a></span>)}</p>
        )}
        {s.contactPage.faq.length > 0 && <><h2>Good to know</h2>{s.contactPage.faq.map((x) => <details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>)}</>}
      </div>
    </div>
  );
}
