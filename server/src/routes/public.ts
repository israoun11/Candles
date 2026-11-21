import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { GOVERNORATES } from '../data.js';
import { Collection, Inquiry, Order, Product } from '../models.js';
import { getSettings } from '../settings.js';
import { ah, HttpError } from '../util.js';

export const publicRouter = Router();
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

publicRouter.get('/settings', ah(async (_q, res) => { res.json({ ...(await getSettings()), governorates: GOVERNORATES }); }));
publicRouter.get('/collections', ah(async (_q, res) => { res.json(await Collection.find().sort('order')); }));

publicRouter.get('/products', ah(async (req, res) => {
  const q = z.object({ collection: z.string().optional(), q: z.string().max(60).optional(), sort: z.enum(['order', 'price-asc', 'price-desc']).default('order'), inStock: z.enum(['1']).optional() }).parse(req.query);
  const filter: Record<string, unknown> = { active: true };
  if (q.collection) filter.collection = q.collection;
  if (q.q) filter.$or = [{ title: new RegExp(esc(q.q), 'i') }, { description: new RegExp(esc(q.q), 'i') }, { 'variants.fragrance': new RegExp(esc(q.q), 'i') }];
  if (q.inStock) filter['variants.stock'] = { $gt: 0 };
  res.json(await Product.find(filter).sort(q.sort === 'order' ? 'sortOrder' : q.sort === 'price-asc' ? 'price' : '-price'));
}));
publicRouter.get('/products/:slug', ah(async (req, res) => {
  const p = await Product.findOne({ slug: req.params.slug, active: true });
  if (!p) throw new HttpError(404, 'Product not found');
  const related = await Product.find({ active: true, collection: p.collection, _id: { $ne: p._id } }).sort('sortOrder').limit(4);
  res.json({ product: p, related });
}));

const orderIn = z.object({
  items: z.array(z.object({ productId: z.string().regex(/^[a-f\d]{24}$/i), variantLabel: z.string().min(1).max(80), qty: z.number().int().min(1).max(20) })).min(1).max(30),
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().transform((s) => s.replace(/[\s.-]/g, '')).pipe(z.string().regex(/^(\+216)?[2-9]\d{7}$/, 'Enter a valid Tunisian phone number')),
    email: z.string().email().optional().or(z.literal('')),
  }),
  address: z.object({ governorate: z.enum(GOVERNORATES), city: z.string().trim().min(2).max(80), details: z.string().trim().min(3).max(300) }),
  note: z.string().max(300).optional(),
});

// Prices and stock are always taken from the database, never from the browser.
publicRouter.post('/orders', ah(async (req, res) => {
  const body = orderIn.parse(req.body);
  const merged = new Map<string, { productId: string; variantLabel: string; qty: number }>();
  for (const i of body.items) {
    const k = `${i.productId}|${i.variantLabel}`, cur = merged.get(k);
    merged.set(k, cur ? { ...cur, qty: cur.qty + i.qty } : i);
  }
  const lines = [...merged.values()];
  const products = await Product.find({ _id: { $in: [...new Set(lines.map((l) => l.productId))] }, active: true });
  const priced = lines.map((l) => {
    const p = products.find((x) => String(x._id) === l.productId);
    if (!p) throw new HttpError(409, 'A product in your cart is no longer available.');
    if (!p.variants.some((v) => v.label === l.variantLabel)) throw new HttpError(409, `${p.title}: option "${l.variantLabel}" is not available.`);
    return { productId: l.productId, title: p.title, variant: l.variantLabel, price: p.price, qty: l.qty };
  });
  const reserved: typeof priced = [];
  try {
    for (const l of priced) {
      const r = await Product.updateOne({ _id: l.productId, variants: { $elemMatch: { label: l.variant, stock: { $gte: l.qty } } } }, { $inc: { 'variants.$.stock': -l.qty } });
      if (r.modifiedCount === 0) throw new HttpError(409, `Not enough stock for ${l.title} (${l.variant}).`);
      reserved.push(l);
    }
    const settings = await getSettings();
    const subtotal = priced.reduce((n, l) => n + l.price * l.qty, 0);
    const shipping = settings.shipping.freeOver > 0 && subtotal >= settings.shipping.freeOver ? 0 : settings.shipping.fee;
    const number = `AR-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${randomBytes(2).toString('hex').toUpperCase()}`;
    const order = await Order.create({ number, items: priced, subtotal, shipping, total: subtotal + shipping, customer: body.customer, address: body.address, note: body.note });
    res.status(201).json({ number: order.number, subtotal, shipping, total: order.total, status: order.status, items: priced });
  } catch (e) {
    for (const l of reserved) await Product.updateOne({ _id: l.productId, 'variants.label': l.variant }, { $inc: { 'variants.$.stock': l.qty } });
    throw e;
  }
}));

// Confirmation lookup needs the order number and the phone used at checkout.
publicRouter.get('/orders/:number', ah(async (req, res) => {
  const phone = String(req.query.phone ?? '').replace(/[\s.-]/g, '');
  const o = await Order.findOne({ number: req.params.number });
  if (!o || !phone || o.customer?.phone !== phone) throw new HttpError(404, 'Order not found');
  res.json({ number: o.number, status: o.status, items: o.items, subtotal: o.subtotal, shipping: o.shipping, total: o.total, createdAt: (o as unknown as { createdAt: Date }).createdAt });
}));

publicRouter.post('/inquiries', ah(async (req, res) => {
  const b = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email(), topic: z.enum(['order', 'product', 'custom', 'other']), message: z.string().trim().min(5).max(2000) }).parse(req.body);
  await Inquiry.create(b);
  res.status(201).json({ ok: true });
}));
