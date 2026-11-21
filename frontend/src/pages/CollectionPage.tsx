import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useFetch } from '../hooks/useFetch';
import type { Collection, Product } from '../lib/api';

export default function CollectionPage() {
  const { slug = '' } = useParams();
  const [sort, setSort] = useState('order'), [inStock, setInStock] = useState(false);
  const cols = useFetch<Collection[]>('/collections');
  const prods = useFetch<Product[]>(`/products?collection=${encodeURIComponent(slug)}&sort=${sort}${inStock ? '&inStock=1' : ''}`);
  const col = cols.data?.find((c) => c.slug === slug);
  if (cols.data && !col) return <div className="pg"><h1 className="pg-title">Not found</h1><Link className="btn" to="/collections">All collections</Link></div>;
  return (
    <div className="pg coll-page">
      <header className="coll-hero">
        <Link className="eyebrow" to="/collections">← All collections</Link>
        <h1 className="pg-title">{col?.title ?? ''}</h1>
        <p className="lead">{col?.description}</p>
        <div className="filters">
          <label>Sort <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="order">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
          <label className="check"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock only</label>
        </div>
      </header>
      {prods.error && <p role="alert" className="fail">{prods.error}</p>}
      {prods.loading ? <p className="label center">Loading…</p> : prods.data?.length ? <div className="grid">{prods.data.map((p) => <ProductCard key={p.id} p={p} />)}</div> : <p className="center">No products to show.</p>}
    </div>
  );
}
