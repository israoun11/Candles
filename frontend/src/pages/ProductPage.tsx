import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Placeholder from '../components/Placeholder';
import SafeImg from '../components/SafeImg';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useFetch } from '../hooks/useFetch';
import { toneFor, type Product, type Settings } from '../lib/api';

export default function ProductPage() {
  const { slug = '' } = useParams();
  const { data, error, loading } = useFetch<{ product: Product; related: Product[] }>(`/products/${slug}`);
  const settings = useFetch<Settings>('/settings').data;
  const { add, setOpen } = useCart();
  const [variant, setVariant] = useState(''), [qty, setQty] = useState(1), [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const p = data?.product;
  useEffect(() => { if (p) { setVariant(p.variants.find((v) => v.stock > 0)?.label ?? p.variants[0].label); setQty(1); setActive(0); } }, [p]);
  const n = Math.max(p?.images.length ?? 0, 1);
  useEffect(() => { // live "02 / 06" indicator follows the image in view
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))), { threshold: 0.6 });
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, [n, p]);
  if (loading) return <div className="pg"><p className="label">Loading…</p></div>;
  if (error || !p) return <div className="pg"><h1 className="pg-title">Not found</h1><p>{error}</p><Link className="btn" to="/collections">Back to collections</Link></div>;
  const v = p.variants.find((x) => x.label === variant) ?? p.variants[0];
  const stock = v.stock, canBuy = stock > 0;
  const go = (i: number) => refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return (
    <>
    <div className="product">
      <div className="gallery">
        <nav className="dots" aria-label="Product images">
          {Array.from({ length: n }, (_, i) => <button key={i} className={i === active ? 'on' : ''} onClick={() => go(i)} aria-label={`Image ${i + 1}`} />)}
          <span className="label">{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        </nav>
        {(p.images.length ? p.images : [null]).map((im, i) => (
          <figure key={i} data-i={i} ref={(r) => { refs.current[i] = r; }} className="shot">
            <SafeImg key={im?.url} src={im?.url} alt={im?.alt || p.title} loading={i ? 'lazy' : 'eager'} fallback={<Placeholder tone={toneFor(p.slug)} label={`${p.title} (photo to be added)`} />} />
            {im?.alt && <figcaption className="label tag">{im.alt}</figcaption>}
          </figure>
        ))}
      </div>
      <div className="info">
        <Link className="label" to={`/collections/${p.collection}`}>← Collection</Link>
        <h1>{p.title}</h1>
        <p className="price">{p.price} TND</p>
        <p>{p.description}</p>
        <fieldset className="opts"><legend className="label">{p.variants.some((x) => x.fragrance) ? 'Fragrance' : p.variants.some((x) => x.color) ? 'Colour' : 'Option'}</legend>
          {p.variants.map((x) => <button key={x.label} type="button" className={`opt${x.label === variant ? ' on' : ''}`} disabled={x.stock === 0} onClick={() => { setVariant(x.label); setQty(1); }}>{x.label}</button>)}
        </fieldset>
        <div className="qty-row">
          <div className="qty"><button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span aria-live="polite">{qty}</span><button aria-label="Increase quantity" onClick={() => setQty(Math.min(Math.min(stock, 20), qty + 1))}>+</button></div>
          <span className="label">{canBuy ? (stock <= 3 ? `Only ${stock} left` : 'In stock') : 'Sold out'}</span>
        </div>
        <button className="btn" disabled={!canBuy} onClick={() => { add({ id: p.id, name: p.title, price: p.price, variant }, qty); setOpen(true); }}>Add to cart</button>
        {p.details.length > 0 && <table className="specs"><tbody>{p.details.map((d) => <tr key={d.label}><th>{d.label}</th><td>{d.value}</td></tr>)}</tbody></table>}
        {settings && <p className="note"><strong>Shipping.</strong> Cash on delivery across Tunisia. {settings.shipping.fee} TND{settings.shipping.freeOver > 0 ? `, free from ${settings.shipping.freeOver} TND` : ''}. {settings.shipping.note}</p>}
      </div>
    </div>
    {/* Outside the two-column grid: a sticky column stays inside its grid container, so related items must not share it. */}
    {data!.related.length > 0 && <section className="related"><h2>You may also like</h2><div className="grid">{data!.related.map((r) => <ProductCard key={r.id} p={r} />)}</div></section>}
    </>
  );
}
