import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';

interface O { number: string; status: string; items: { title: string; variant: string; price: number; qty: number }[]; subtotal: number; shipping: number; total: number }
export default function OrderConfirmation() {
  const { number = '' } = useParams();
  const [q] = useSearchParams();
  const { data, error, loading } = useFetch<O>(`/orders/${number}?phone=${encodeURIComponent(q.get('phone') ?? '')}`);
  return (
    <div className="pg">
      {loading && <p className="label">Loading…</p>}
      {error && <><h1 className="pg-title">Order not found</h1><p role="alert">{error}</p></>}
      {data && <>
        <h1 className="pg-title">Thank you</h1>
        <p className="lead">Your order <strong>{data.number}</strong> was received (status: {data.status}). Keep this number to check it later. You pay cash on delivery.</p>
        <ul className="plain-list">{data.items.map((i, k) => <li key={k}>{i.qty} × {i.title} ({i.variant}) — {i.price * i.qty} TND</li>)}</ul>
        <p>Subtotal {data.subtotal} TND · Delivery {data.shipping} TND · <strong>Total {data.total} TND</strong></p>
      </>}
      <Link className="btn" to="/collections">Continue shopping</Link>
    </div>
  );
}
