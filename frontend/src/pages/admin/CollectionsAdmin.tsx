import { useCallback, useEffect, useState } from 'react';
import type { Collection, Product } from '../../lib/api';
import { adminApi, slugify } from './lib';
import { Card, Empty, fromImgs, ImageListEditor, Panel, toImgs } from './ui';

type Draft = Omit<Collection, 'id'> & { id?: string };
const blank = (order: number): Draft => ({ slug: '', title: '', description: '', image: '', images: [], order });

export default function CollectionsAdmin() {
  const [items, setItems] = useState<Collection[] | null>(null), [counts, setCounts] = useState<Record<string, number>>({}), [draft, setDraft] = useState<Draft | null>(null), [err, setErr] = useState('');
  const load = useCallback(() => Promise.all([adminApi<Collection[]>('/collections'), adminApi<Product[]>('/products')]).then(([c, p]) => {
    setItems(c); setCounts(p.reduce<Record<string, number>>((m, x) => ({ ...m, [x.collection]: (m[x.collection] ?? 0) + 1 }), {}));
  }).catch((e: Error) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const save = async () => {
    if (!draft) return; setErr('');
    try {
      const body = { slug: draft.slug || slugify(draft.title), title: draft.title, description: draft.description, images: draft.images, order: draft.order };
      await (draft.id ? adminApi(`/collections/${draft.id}`, 'PUT', body) : adminApi('/collections', 'POST', body));
      setDraft(null); await load();
    } catch (e) { setErr((e as Error).message); }
  };
  const del = async (c: Collection) => { if (!confirm(`Delete “${c.title}”?`)) return; setErr(''); try { await adminApi(`/collections/${c.id}`, 'DELETE'); await load(); } catch (e) { setErr((e as Error).message); } };
  return (
    <>
      <div className="a-toolbar end"><button className="a-btn primary" onClick={() => setDraft(blank((items?.length ?? 0) + 1))}>Add collection</button></div>
      {err && <p role="alert" className="a-err">{err}</p>}
      {!items ? <p className="a-muted">Loading…</p> : items.length === 0 ? <Card><Empty>No collections yet.</Empty></Card> : (
        <div className="a-cgrid">{items.map((c) => {
          const cover = c.images?.[0] ?? c.image;
          return (
            <article key={c.id} className="a-ccard">
              <div className="a-cover">{cover ? <img src={cover} alt="" /> : <span>No image</span>}</div>
              <div className="a-cbody"><h3>{c.title}</h3><p className="a-muted">/{c.slug} · {counts[c.slug] ?? 0} product{(counts[c.slug] ?? 0) === 1 ? '' : 's'}</p>
                <div className="a-actions"><button className="a-btn" onClick={() => setDraft({ ...c, images: c.images?.length ? c.images : c.image ? [c.image] : [] })}>Edit</button><button className="a-btn danger" onClick={() => del(c)}>Delete</button></div></div>
            </article>
          );
        })}</div>
      )}
      <Panel open={!!draft} title={draft?.id ? 'Edit collection' : 'New collection'} onClose={() => setDraft(null)}>
        {draft && (
          <>
            <label className="a-fld"><span>Title</span><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
            <label className="a-fld"><span>Web address (slug)</span><input value={draft.slug} placeholder={slugify(draft.title)} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></label>
            <label className="a-fld"><span>Description</span><textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
            <label className="a-fld"><span>Display order</span><input type="number" value={draft.order} onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })} /></label>
            <div className="a-fld"><span>Images (the main one is the cover)</span><ImageListEditor max={8} items={toImgs(draft.images)} onChange={(i) => setDraft({ ...draft, images: fromImgs(i) })} /></div>
            <div className="a-actions"><button className="a-btn primary" onClick={save}>Save collection</button><button className="a-btn" onClick={() => setDraft(null)}>Cancel</button></div>
          </>
        )}
      </Panel>
    </>
  );
}
