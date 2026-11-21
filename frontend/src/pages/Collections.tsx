import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import HorizontalRail from '../components/HorizontalRail';
import Placeholder from '../components/Placeholder';
import ProductCard from '../components/ProductCard';
import SafeImg from '../components/SafeImg';
import { useFetch } from '../hooks/useFetch';
import type { Collection, Product } from '../lib/api';

const accents = ['var(--pink)', 'var(--butter)', 'var(--green)', 'var(--lavender)', 'var(--peach)', 'var(--coral)'];

export default function Collections() {
  const [q, setQ] = useState(''), [applied, setApplied] = useState('');
  const cols = useFetch<Collection[]>('/collections');
  const prods = useFetch<Product[]>(`/products${applied ? `?q=${encodeURIComponent(applied)}` : ''}`);
  useEffect(() => { const t = setTimeout(() => setApplied(q.trim()), 350); return () => clearTimeout(t); }, [q]); // search as you type
  const submit = (e: FormEvent) => { e.preventDefault(); setApplied(q.trim()); };
  const err = cols.error ?? prods.error;
  return (
    <div className="pg coll-page">
      <header className="coll-hero">
        <p className="eyebrow">The Artisra collections</p>
        <h1 className="pg-title">Little worlds to light</h1>
        <p className="lead">Every candle has a personality. Discover the collections that bring a little more joy into your everyday.</p>
        <form className="searchbar" onSubmit={submit} role="search">
          <svg viewBox="0 0 20 20" aria-hidden><circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4.5 4.5" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search candles or scents" aria-label="Search products" />
          {q && <button type="button" aria-label="Clear search" onClick={() => { setQ(''); setApplied(''); }}>×</button>}
        </form>
      </header>
      {err && <p role="alert" className="fail">{err}</p>}
      {(cols.loading || prods.loading) && <p className="label center">Loading…</p>}
      {applied && prods.data && (prods.data.length ? <div className="grid">{prods.data.map((p) => <ProductCard key={p.id} p={p} />)}</div> : <p className="center">No candles match “{applied}”.</p>)}
      {!applied && cols.data?.map((c, i) => {
        const items = prods.data?.filter((p) => p.collection === c.slug) ?? [];
        const cover = c.images?.[0] ?? c.image;
        return (
          <section key={c.id} className="coll" style={{ ['--tone' as string]: accents[i % accents.length] }}>
            <div className="coll-head">
              <Link to={`/collections/${c.slug}`} className="arch" aria-label={`Open ${c.title}`}>
                <SafeImg key={cover} src={cover} alt="" loading="lazy" fallback={<Placeholder tone={accents[i % accents.length]} label={c.title} />} />
              </Link>
              <div>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <h2>{c.title}</h2>
                <p>{c.description}</p>
                <Link className="more" to={`/collections/${c.slug}`}>View all {items.length}<span aria-hidden> →</span></Link>
              </div>
            </div>
            {items.length ? <HorizontalRail>{items.map((p) => <ProductCard key={p.id} p={p} />)}</HorizontalRail> : <p>No products in this collection yet.</p>}
          </section>
        );
      })}
    </div>
  );
}
