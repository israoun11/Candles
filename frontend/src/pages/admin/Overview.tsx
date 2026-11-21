import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../lib/api';
import { adminApi } from './lib';
import { Card, Empty, StatusPill } from './ui';

interface OrderRow { id: string; number: string; status: string; total: number; createdAt: string; customer: { name: string } }
interface Data { orders: { items: OrderRow[]; total: number }; fresh: number; products: Product[]; inquiries: { status: string }[] }

export default function Overview() {
  const [d, setD] = useState<Data | null>(null), [err, setErr] = useState('');
  useEffect(() => {
    Promise.all([adminApi<{ items: OrderRow[]; total: number }>('/orders'), adminApi<{ total: number }>('/orders?status=new'), adminApi<Product[]>('/products'), adminApi<{ status: string }[]>('/inquiries')])
      .then(([orders, fresh, products, inquiries]) => setD({ orders, fresh: fresh.total, products, inquiries })).catch((e: Error) => setErr(e.message));
  }, []);
  if (err) return <p role="alert" className="a-err">{err}</p>;
  if (!d) return <p className="a-muted">Loading…</p>;
  const low = d.products.flatMap((p) => p.variants.filter((v) => v.stock <= 3).map((v) => ({ key: `${p.id}${v.label}`, text: `${p.title} — ${v.label}`, stock: v.stock })));
  const stats: [string, number, string, string][] = [
    ['Total orders', d.orders.total, 'All time', '/admin/orders'], ['New orders', d.fresh, 'Waiting for you', '/admin/orders'],
    ['Products', d.products.length, 'In your catalogue', '/admin/products'], ['Inquiries', d.inquiries.filter((i) => i.status === 'new').length, 'Unread messages', '/admin/inquiries'],
  ];
  return (
    <>
      <div className="a-stats">{stats.map(([l, n, sub, to]) => <Link key={l} to={to} className="a-stat"><span>{l}</span><b>{n}</b><small>{sub}</small></Link>)}</div>
      <Card title="Recent orders" actions={<Link className="a-btn" to="/admin/orders">View all</Link>}>
        {d.orders.items.length === 0 ? <Empty>No orders yet.</Empty> : (
          <div className="a-tw"><table className="a-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>{d.orders.items.slice(0, 5).map((o) => (
              <tr key={o.id}><td data-label="Order"><b>{o.number}</b></td><td data-label="Customer">{o.customer.name}</td><td data-label="Date">{new Date(o.createdAt).toLocaleDateString()}</td><td data-label="Total">{o.total} TND</td><td data-label="Status"><StatusPill status={o.status} /></td></tr>
            ))}</tbody></table></div>
        )}
      </Card>
      <Card title="Low stock" desc="Variants with 3 or fewer left.">
        {low.length ? <ul className="a-list">{low.map((l) => <li key={l.key}><span>{l.text}</span><b>{l.stock === 0 ? 'Sold out' : `${l.stock} left`}</b></li>)}</ul> : <Empty>Nothing is running low.</Empty>}
      </Card>
    </>
  );
}
