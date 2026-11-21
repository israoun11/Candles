import { useCallback, useEffect, useState } from 'react';
import type { Collection, Product } from '../../lib/api';
import { adminApi, slugify } from './lib';
import { Card, Empty, ImageListEditor, StatusPill } from './ui';

type Draft = Omit<Product, 'id'> & { id?: string; sortOrder: number };
const blank = (collection: string): Draft => ({ slug: '', title: '', description: '', price: 0, collection, images: [], variants: [{ label: 'Standard', stock: 0 }], details: [], active: true, sortOrder: 0 });

export default function ProductsAdmin() {
  const [items, setItems] = useState<Product[] | null>(null), [cols, setCols] = useState<Collection[]>([]), [d, setD] = useState<Draft | null>(null), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [q, setQ] = useState('');
  const load = useCallback(() => Promise.all([adminApi<Product[]>('/products'), adminApi<Collection[]>('/collections')]).then(([p, c]) => { setItems(p); setCols(c); }).catch((e: Error) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const set = (patch: Partial<Draft>) => d && setD({ ...d, ...patch });
  const setVariant = (i: number, patch: Partial<Draft['variants'][number]>) => d && set({ variants: d.variants.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
  const save = async () => {
    if (!d) return; setErr(''); setBusy(true);
    const body = { slug: d.slug || slugify(d.title), title: d.title, description: d.description, price: d.price, collection: d.collection, images: d.images, variants: d.variants, details: d.details.filter((x) => x.label), active: d.active, sortOrder: d.sortOrder };
    try { await (d.id ? adminApi(`/products/${d.id}`, 'PUT', body) : adminApi('/products', 'POST', body)); setD(null); await load(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const del = async (p: Product) => { if (!confirm(`Delete “${p.title}” permanently?`)) return; setErr(''); try { await adminApi(`/products/${p.id}`, 'DELETE'); await load(); } catch (e) { setErr((e as Error).message); } };

  if (d) {
    return (
      <>
        <div className="a-toolbar"><button className="a-btn" onClick={() => setD(null)}>← Back to products</button><h2 className="a-h2">{d.id ? 'Edit product' : 'New product'}</h2></div>
        {err && <p role="alert" className="a-err">{err}</p>}
        <div className="a-split">
          <div>
            <Card title="Basics">
              <label className="a-fld"><span>Title</span><input value={d.title} onChange={(e) => set({ title: e.target.value })} /></label>
              <label className="a-fld"><span>Web address (slug)</span><input value={d.slug} placeholder={slugify(d.title)} onChange={(e) => set({ slug: e.target.value })} /></label>
              <label className="a-fld"><span>Description</span><textarea rows={4} value={d.description} onChange={(e) => set({ description: e.target.value })} /></label>
            </Card>
            <Card title="Images" desc="The first image is the main one shown in shop listings."><ImageListEditor alt items={d.images} onChange={(imgs) => set({ images: imgs.map((i) => ({ url: i.url, alt: i.alt ?? '' })) })} /></Card>
            <Card title="Variants and stock" desc="One row per colour, fragrance or option.">
              <div className="a-vrows">
                <div className="a-vrow a-vhead"><span>Name</span><span>Colour</span><span>Fragrance</span><span>Stock</span><span /></div>
                {d.variants.map((v, i) => (
                  <div key={i} className="a-vrow">
                    <input aria-label="Variant name" placeholder="e.g. Candy Pink" value={v.label} onChange={(e) => setVariant(i, { label: e.target.value })} />
                    <input aria-label="Colour" placeholder="Colour" value={v.color ?? ''} onChange={(e) => setVariant(i, { color: e.target.value })} />
                    <input aria-label="Fragrance" placeholder="Fragrance" value={v.fragrance ?? ''} onChange={(e) => setVariant(i, { fragrance: e.target.value })} />
                    <input aria-label="Stock" type="number" min={0} value={v.stock} onChange={(e) => setVariant(i, { stock: Math.max(0, Math.floor(Number(e.target.value))) })} />
                    <button className="a-btn" disabled={d.variants.length === 1} onClick={() => set({ variants: d.variants.filter((_, k) => k !== i) })}>Remove</button>
                  </div>
                ))}
              </div>
              <button className="a-btn" onClick={() => set({ variants: [...d.variants, { label: '', stock: 0 }] })}>Add variant</button>
            </Card>
            <Card title="Details" desc="Shown on the product page. Only add facts you have confirmed (size, weight, burn time…).">
              {d.details.map((x, i) => (
                <div key={i} className="a-drow">
                  <input aria-label="Label" placeholder="Label" value={x.label} onChange={(e) => set({ details: d.details.map((y, k) => (k === i ? { ...y, label: e.target.value } : y)) })} />
                  <input aria-label="Value" placeholder="Value" value={x.value} onChange={(e) => set({ details: d.details.map((y, k) => (k === i ? { ...y, value: e.target.value } : y)) })} />
                  <button className="a-btn" onClick={() => set({ details: d.details.filter((_, k) => k !== i) })}>Remove</button>
                </div>
              ))}
              <button className="a-btn" onClick={() => set({ details: [...d.details, { label: '', value: '' }] })}>Add detail</button>
            </Card>
          </div>
          <div>
            <Card title="Pricing"><label className="a-fld"><span>Price (TND)</span><input type="number" min={0} step="0.5" value={d.price} onChange={(e) => set({ price: Number(e.target.value) })} /></label></Card>
            <Card title="Organisation">
              <label className="a-fld"><span>Collection</span><select value={d.collection} onChange={(e) => set({ collection: e.target.value })}>{cols.map((c) => <option key={c.id} value={c.slug}>{c.title}</option>)}</select></label>
              <label className="a-fld"><span>Display order</span><input type="number" value={d.sortOrder} onChange={(e) => set({ sortOrder: Number(e.target.value) })} /></label>
              <label className="a-check"><input type="checkbox" checked={d.active} onChange={(e) => set({ active: e.target.checked })} /><span>Visible on the website</span></label>
            </Card>
          </div>
        </div>
        <div className="a-savebar"><button className="a-btn" onClick={() => setD(null)}>Cancel</button><button className="a-btn primary" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save product'}</button></div>
      </>
    );
  }
  const needle = q.trim().toLowerCase();
  const rows = (items ?? []).filter((p) => !needle || `${p.title} ${p.slug}`.toLowerCase().includes(needle));
  return (
    <>
      <div className="a-toolbar">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" />
        <button className="a-btn primary" disabled={!cols.length} onClick={() => setD(blank(cols[0].slug))}>Add product</button>
      </div>
      {!cols.length && items && <p className="a-hint">Create a collection first (Collections page).</p>}
      {err && <p role="alert" className="a-err">{err}</p>}
      <Card>
        {!items ? <p className="a-muted">Loading…</p> : rows.length === 0 ? <Empty>No products found.</Empty> : (
          <div className="a-tw"><table className="a-table"><thead><tr><th>Product</th><th>Collection</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead>
            <tbody>{rows.map((p) => {
              const stock = p.variants.reduce((n, v) => n + v.stock, 0);
              return (
                <tr key={p.id}>
                  <td data-label="Product"><div className="a-prod"><span className="a-th">{p.images[0] ? <img src={p.images[0].url} alt="" /> : null}</span><span><b>{p.title}</b><small>/{p.slug}</small></span></div></td>
                  <td data-label="Collection">{cols.find((c) => c.slug === p.collection)?.title ?? p.collection}</td>
                  <td data-label="Price">{p.price} TND</td>
                  <td data-label="Stock">{stock === 0 ? <span className="a-low">Sold out</span> : stock}</td>
                  <td data-label="Status"><StatusPill status={p.active ? 'visible' : 'hidden'} /></td>
                  <td className="end"><div className="a-actions"><button className="a-btn" onClick={() => setD({ ...p, sortOrder: (p as Draft).sortOrder ?? 0 })}>Edit</button><button className="a-btn danger" onClick={() => del(p)}>Delete</button></div></td>
                </tr>
              );
            })}</tbody></table></div>
        )}
      </Card>
    </>
  );
}
