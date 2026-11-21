import { useEffect, useState } from 'react';
import type { Product } from '../../lib/api';
import { adminApi } from './lib';
import { Card, move, UploadButton } from './ui';
import { useSettingsDoc } from './useSettings';

export default function SettingsAdmin() {
  const { s, update, save, err, ok, busy } = useSettingsDoc();
  const [tab, setTab] = useState<'general' | 'homepage'>('general'), [links, setLinks] = useState<string[]>([]);
  useEffect(() => { adminApi<Product[]>('/products').then((ps) => setLinks(['/collections', ...ps.map((p) => `/products/${p.slug}`)])).catch(() => undefined); }, []);
  if (!s) return <>{err ? <p role="alert" className="a-err">{err}</p> : <p className="a-muted">Loading…</p>}</>;
  const setWall = (i: number, patch: Partial<(typeof s.wall)[number]>) => update({ wall: s.wall.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
  return (
    <>
      <div className="a-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'general'} className={tab === 'general' ? 'on' : ''} onClick={() => setTab('general')}>General</button>
        <button role="tab" aria-selected={tab === 'homepage'} className={tab === 'homepage' ? 'on' : ''} onClick={() => setTab('homepage')}>Homepage</button>
      </div>

      {tab === 'general' && (
        <>
          <Card title="Announcement" desc="A short line shown in the website footer.">
            <label className="a-check"><input type="checkbox" checked={s.announcement.active} onChange={(e) => update({ announcement: { ...s.announcement, active: e.target.checked } })} /><span>Show announcement</span></label>
            <label className="a-fld"><span>Text</span><input value={s.announcement.text} onChange={(e) => update({ announcement: { ...s.announcement, text: e.target.value } })} /></label>
          </Card>
          <Card title="Contact details" desc="Shown on the Contact page. Leave a field empty to hide it.">
            <div className="a-grid2">{(['email', 'phone', 'whatsapp', 'address'] as const).map((k) => (
              <label key={k} className="a-fld"><span>{k[0].toUpperCase() + k.slice(1)}</span><input value={s.contact[k]} onChange={(e) => update({ contact: { ...s.contact, [k]: e.target.value } })} /></label>
            ))}</div>
          </Card>
          <Card title="Social links">
            {s.socials.map((x, i) => (
              <div key={i} className="a-drow">
                <input aria-label="Name" placeholder="Name (Instagram…)" value={x.label} onChange={(e) => update({ socials: s.socials.map((y, k) => (k === i ? { ...y, label: e.target.value } : y)) })} />
                <input aria-label="Link" placeholder="https://…" value={x.href} onChange={(e) => update({ socials: s.socials.map((y, k) => (k === i ? { ...y, href: e.target.value } : y)) })} />
                <button className="a-btn" onClick={() => update({ socials: s.socials.filter((_, k) => k !== i) })}>Remove</button>
              </div>
            ))}
            <button className="a-btn" onClick={() => update({ socials: [...s.socials, { label: '', href: '' }] })}>Add link</button>
          </Card>
          <Card title="Shipping">
            <div className="a-grid2">
              <label className="a-fld"><span>Delivery fee (TND)</span><input type="number" min={0} value={s.shipping.fee} onChange={(e) => update({ shipping: { ...s.shipping, fee: Number(e.target.value) } })} /></label>
              <label className="a-fld"><span>Free delivery from (TND, 0 = never)</span><input type="number" min={0} value={s.shipping.freeOver} onChange={(e) => update({ shipping: { ...s.shipping, freeOver: Number(e.target.value) } })} /></label>
            </div>
            <label className="a-fld"><span>Note shown on product pages</span><input value={s.shipping.note} onChange={(e) => update({ shipping: { ...s.shipping, note: e.target.value } })} /></label>
          </Card>
        </>
      )}

      {tab === 'homepage' && (
        <>
          <Card title="Homepage text">
            <label className="a-fld"><span>Tagline</span><input value={s.home.tagline} onChange={(e) => update({ home: { ...s.home, tagline: e.target.value } })} /></label>
            <label className="a-fld"><span>Intro</span><textarea rows={2} value={s.home.intro} onChange={(e) => update({ home: { ...s.home, intro: e.target.value } })} /></label>
          </Card>
          <Card title="Artwork wall tiles" desc="Leave empty to use the built-in placeholders. Your tiles repeat to fill the wall."
            actions={<button className="a-btn" onClick={() => update({ wall: [...s.wall, { title: '', caption: '', to: '', image: '', active: true }] })}>Add tile</button>}>
            <datalist id="wall-links">{links.map((l) => <option key={l} value={l} />)}</datalist>
            {s.wall.length === 0 && <p className="a-hint">No custom tiles yet.</p>}
            {s.wall.map((w, i) => (
              <div key={i} className="a-tile">
                <div className="a-tile-img">{w.image ? <img src={w.image} alt="" /> : <span>No image</span>}</div>
                <div className="a-tile-fields">
                  <div className="a-grid2">
                    <label className="a-fld"><span>Title</span><input value={w.title} onChange={(e) => setWall(i, { title: e.target.value })} /></label>
                    <label className="a-fld"><span>Caption</span><input value={w.caption} onChange={(e) => setWall(i, { caption: e.target.value })} /></label>
                  </div>
                  <label className="a-fld"><span>Link</span><input list="wall-links" placeholder="/products/the-twist" value={w.to} onChange={(e) => setWall(i, { to: e.target.value })} /></label>
                  <div className="a-actions">
                    <label className="a-check"><input type="checkbox" checked={w.active !== false} onChange={(e) => setWall(i, { active: e.target.checked })} /><span>Show</span></label>
                    <UploadButton label={w.image ? 'Replace image' : 'Upload image'} onUploaded={(u) => setWall(i, { image: u[0] })} />
                    <button className="a-btn" disabled={i === 0} onClick={() => update({ wall: move(s.wall, i, -1) })} aria-label="Move earlier">↑</button>
                    <button className="a-btn" disabled={i === s.wall.length - 1} onClick={() => update({ wall: move(s.wall, i, 1) })} aria-label="Move later">↓</button>
                    <button className="a-btn danger" onClick={() => update({ wall: s.wall.filter((_, k) => k !== i) })}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </>
      )}
      <div className="a-savebar">
        {err && <span role="alert" className="a-err">{err}</span>}{ok && <span role="status" className="a-ok">Saved — live on the website.</span>}
        <button className="a-btn primary" disabled={busy} onClick={() => save()}>{busy ? 'Saving…' : 'Save changes'}</button>
      </div>
    </>
  );
}
