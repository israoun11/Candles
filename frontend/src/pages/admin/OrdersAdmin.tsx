import { useCallback, useEffect, useState } from 'react';
import { adminApi, STATUSES } from './lib';
import { Card, Empty, Panel, StatusPill } from './ui';

interface Order { id: string; number: string; status: string; total: number; subtotal: number; shipping: number; adminNote: string; createdAt: string; note?: string;
  customer: { name: string; phone: string; email?: string }; address: { governorate: string; city: string; details: string }; items: { title: string; variant: string; price: number; qty: number }[] }

export default function OrdersAdmin() {
  const [status, setStatus] = useState(''), [page, setPage] = useState(1), [q, setQ] = useState(''), [data, setData] = useState<{ items: Order[]; total: number } | null>(null), [openId, setOpenId] = useState(''), [err, setErr] = useState('');
  const load = useCallback(() => adminApi<{ items: Order[]; total: number }>(`/orders?page=${page}${status ? `&status=${status}` : ''}`).then(setData).catch((e: Error) => setErr(e.message)), [page, status]);
  useEffect(() => { load(); }, [load]);
  const patch = async (id: string, body: object) => { setErr(''); try { await adminApi(`/orders/${id}`, 'PATCH', body); await load(); } catch (e) { setErr((e as Error).message); } };
  const needle = q.trim().toLowerCase();
  const rows = (data?.items ?? []).filter((o) => !needle || `${o.number} ${o.customer.name} ${o.customer.phone}`.toLowerCase().includes(needle));
  const sel = data?.items.find((o) => o.id === openId);
  return (
    <>
      <div className="a-toolbar">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, name or phone" aria-label="Search orders on this page" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      {err && <p role="alert" className="a-err">{err}</p>}
      <Card>
        {!data ? <p className="a-muted">Loading…</p> : rows.length === 0 ? <Empty>No orders match.</Empty> : (
          <div className="a-tw"><table className="a-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th /></tr></thead>
            <tbody>{rows.map((o) => (
              <tr key={o.id} className="click" onClick={() => setOpenId(o.id)}>
                <td data-label="Order"><b>{o.number}</b></td><td data-label="Customer">{o.customer.name}<small>{o.customer.phone}</small></td>
                <td data-label="Date">{new Date(o.createdAt).toLocaleString()}</td><td data-label="Total">{o.total} TND</td><td data-label="Status"><StatusPill status={o.status} /></td>
                <td className="end"><button className="a-btn" onClick={(e) => { e.stopPropagation(); setOpenId(o.id); }}>View</button></td>
              </tr>))}</tbody></table></div>
        )}
        {data && data.total > 30 && <div className="a-pager"><button className="a-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page}</span><button className="a-btn" disabled={page * 30 >= data.total} onClick={() => setPage(page + 1)}>Next</button></div>}
      </Card>
      <Panel open={!!sel} title={sel ? `Order ${sel.number}` : ''} onClose={() => setOpenId('')}>
        {sel && (
          <>
            <div className="a-kv"><span>Status</span><select value={sel.status} onChange={(e) => patch(sel.id, { status: e.target.value })} aria-label="Order status">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
            {sel.status !== 'cancelled' && <p className="a-hint">Cancelling returns the reserved stock automatically.</p>}
            <h4>Customer</h4><p>{sel.customer.name}<br />{sel.customer.phone}{sel.customer.email && <><br />{sel.customer.email}</>}</p>
            <h4>Delivery address</h4><p>{sel.address.details}<br />{sel.address.city}, {sel.address.governorate}</p>
            {sel.note && <><h4>Customer note</h4><p>{sel.note}</p></>}
            <h4>Items</h4>
            <ul className="a-list">{sel.items.map((i, k) => <li key={k}><span>{i.qty} × {i.title} <small>({i.variant})</small></span><b>{i.price * i.qty} TND</b></li>)}</ul>
            <div className="a-totals"><span>Subtotal</span><span>{sel.subtotal} TND</span><span>Delivery</span><span>{sel.shipping} TND</span><b>Total (cash on delivery)</b><b>{sel.total} TND</b></div>
            <NoteBox key={sel.id + sel.adminNote} value={sel.adminNote} onSave={(v) => patch(sel.id, { adminNote: v })} />
          </>
        )}
      </Panel>
    </>
  );
}
function NoteBox({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  return <label className="a-fld"><span>Internal note (only you see this)</span><textarea rows={3} value={v} onChange={(e) => setV(e.target.value)} /><button className="a-btn primary" onClick={() => onSave(v)}>Save note</button></label>;
}
