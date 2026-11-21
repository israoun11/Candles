import { useEffect, useState, type ReactNode } from 'react';
import { uploadFiles } from './lib';

export const Field = ({ label, children }: { label: string; children: ReactNode }) => <label className="a-fld"><span>{label}</span>{children}</label>;

// Uploads one or more images and reports the new URLs.
export function UploadButton({ onUploaded, multiple, label = 'Upload image' }: { onUploaded: (urls: string[]) => void; multiple?: boolean; label?: string }) {
  const [busy, setBusy] = useState(false), [err, setErr] = useState('');
  return (
    <span className="a-upload">
      <label className="a-btn">{busy ? 'Uploading…' : label}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={multiple} hidden disabled={busy}
          onChange={async (e) => {
            const files = e.target.files; if (!files?.length) return;
            setBusy(true); setErr('');
            try { onUploaded(await uploadFiles(files)); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); e.target.value = ''; }
          }} />
      </label>
      {err && <em role="alert" className="a-err">{err}</em>}
    </span>
  );
}
export const move = <T,>(arr: T[], i: number, d: number) => { const j = i + d; if (j < 0 || j >= arr.length) return arr; const a = [...arr]; [a[i], a[j]] = [a[j], a[i]]; return a; };

export interface Img { url: string; alt?: string }
export const toImgs = (urls: string[]): Img[] => urls.map((url) => ({ url }));
export const fromImgs = (imgs: Img[]) => imgs.map((i) => i.url);

// Shared image manager: preview, add several, replace, delete, reorder and choose the main (first) image.
export function ImageListEditor({ items, onChange, alt, max = 12 }: { items: Img[]; onChange: (i: Img[]) => void; alt?: boolean; max?: number }) {
  return (
    <div className="a-imgs">
      {items.length === 0 && <p className="a-hint">No image yet — the website shows a placeholder.</p>}
      {items.map((im, i) => (
        <div key={`${im.url}-${i}`} className="a-img">
          <div className="a-prev"><img className="a-thumb" src={im.url} alt="" />{i === 0 && <b className="a-main">Main</b>}</div>
          {alt && <input value={im.alt ?? ''} placeholder="Caption / alt text" onChange={(e) => onChange(items.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)))} />}
          <button className="a-btn" onClick={() => onChange(move(items, i, -1))} disabled={i === 0} aria-label="Move earlier">↑</button>
          <button className="a-btn" onClick={() => onChange(move(items, i, 1))} disabled={i === items.length - 1} aria-label="Move later">↓</button>
          {i > 0 && <button className="a-btn" onClick={() => onChange([items[i], ...items.filter((_, k) => k !== i)])}>Make main</button>}
          <UploadButton label="Replace" onUploaded={(u) => onChange(items.map((x, k) => (k === i ? { ...x, url: u[0] } : x)))} />
          <button className="a-btn" onClick={() => confirm('Remove this image from the list?') && onChange(items.filter((_, k) => k !== i))}>Delete</button>
        </div>
      ))}
      {items.length < max && <UploadButton multiple label={items.length ? 'Add more images' : 'Upload images'} onUploaded={(u) => onChange([...items, ...u.map((url) => ({ url }))].slice(0, max))} />}
      <p className="a-hint">Changes are saved with the Save button below. JPEG, PNG, WebP or AVIF, up to 5 MB each.</p>
    </div>
  );
}

export const Icon = ({ d }: { d: string }) => <svg className="a-ico" viewBox="0 0 24 24" aria-hidden><path d={d} /></svg>;
export const StatusPill = ({ status }: { status: string }) => <span className={`a-pill ${status}`}>{status}</span>;
export const Empty = ({ children }: { children: ReactNode }) => <div className="a-empty">{children}</div>;

export function Card({ title, desc, actions, children }: { title?: string; desc?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="a-card">
      {(title || actions) && <header className="a-card-h"><div>{title && <h3>{title}</h3>}{desc && <p>{desc}</p>}</div>{actions}</header>}
      {children}
    </section>
  );
}

// Slide-over panel (order details, collection editor). Esc or the backdrop closes it.
export function Panel({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="a-panel-wrap">
      <div className="a-scrim" onClick={onClose} />
      <aside className="a-panel" role="dialog" aria-modal="true" aria-label={title}>
        <header><h2>{title}</h2><button className="a-btn" onClick={onClose} aria-label="Close panel">✕</button></header>
        <div className="a-panel-body">{children}</div>
      </aside>
    </div>
  );
}
