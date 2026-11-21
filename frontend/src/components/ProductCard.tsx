import { Link } from 'react-router-dom';
import { toneFor, totalStock, type Product } from '../lib/api';
import Placeholder from './Placeholder';
import SafeImg from './SafeImg';

export default function ProductCard({ p }: { p: Product }) {
  const out = totalStock(p) === 0;
  const fallback = <Placeholder tone={toneFor(p.slug)} label={p.title} />;
  return (
    <Link to={`/products/${p.slug}`} className="card rail-card" draggable={false}>
      <div className="card-img" style={{ background: toneFor(p.slug) }}>
        <SafeImg key={p.images[0]?.url} src={p.images[0]?.url} alt={p.images[0]?.alt || p.title} loading="lazy" draggable={false} fallback={fallback} />
        {out && <span className="chip"><span className="radar" />Sold out</span>}
      </div>
      <div className="card-meta"><span>{p.title}</span><span>{p.price} TND</span></div>
    </Link>
  );
}
