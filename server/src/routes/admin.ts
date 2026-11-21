import { randomBytes } from 'node:crypto';
import { extname, resolve } from 'node:path';
import { closeSync, openSync, readSync, unlinkSync } from 'node:fs';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { clearSession, requireAdmin, setSession } from '../auth.js';
import { env } from '../config.js';
import { GOVERNORATES } from '../data.js';
import { Admin, Collection, Inquiry, Order, Product, Setting, STATUSES } from '../models.js';
import { DUMMY_HASH, isValidHash, verifyPassword } from '../password.js';
import { getSettings } from '../settings.js';
import { ah, HttpError } from '../util.js';

export const adminRouter = Router();
const id = z.string().regex(/^[a-f\d]{24}$/i);

adminRouter.post('/login', ah(async (req, res) => {
  const b = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const a = await Admin.findOne({ email: b.email.toLowerCase() });
  const hashOk = !!a && isValidHash(a.passwordHash);
  if (a && !hashOk) console.warn('[auth] An admin account has no valid password hash. Run "npm run admin:repair" in the server folder.');
  const passwordOk = await verifyPassword(b.password, a && hashOk ? a.passwordHash : DUMMY_HASH); // same work whether or not the account is usable
  if (!a || !hashOk || !passwordOk) throw new HttpError(401, 'Wrong email or password');
  setSession(res, String(a._id));
  res.json({ ok: true, email: a.email });
}));
adminRouter.post('/logout', (_q, res) => { clearSession(res); res.json({ ok: true }); });

adminRouter.use(requireAdmin);
adminRouter.get('/me', (_q, res) => { res.json({ ok: true }); });

const variant = z.object({ label: z.string().trim().min(1).max(80), color: z.string().max(40).optional(), fragrance: z.string().max(60).optional(), stock: z.number().int().min(0) });
const productIn = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/), title: z.string().trim().min(1).max(120), description: z.string().max(4000).default(''),
  price: z.number().min(0), collection: z.string().min(1),
  images: z.array(z.object({ url: z.string().min(1), alt: z.string().max(200).default('') })).max(12).default([]),
  variants: z.array(variant).min(1).max(40), details: z.array(z.object({ label: z.string().max(60), value: z.string().max(200) })).max(20).default([]),
  active: z.boolean().default(true), sortOrder: z.number().int().default(0),
});
adminRouter.get('/products', ah(async (_q, res) => { res.json(await Product.find().sort('sortOrder')); }));
adminRouter.post('/products', ah(async (req, res) => { res.status(201).json(await Product.create(productIn.parse(req.body))); }));
adminRouter.put('/products/:id', ah(async (req, res) => {
  const p = await Product.findByIdAndUpdate(id.parse(req.params.id), productIn.partial().parse(req.body), { new: true, runValidators: true });
  if (!p) throw new HttpError(404, 'Product not found');
  res.json(p);
}));
adminRouter.delete('/products/:id', ah(async (req, res) => { await Product.findByIdAndDelete(id.parse(req.params.id)); res.json({ ok: true }); }));

const collectionIn = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), title: z.string().trim().min(1).max(80), description: z.string().max(1000).default(''), images: z.array(z.string().max(300)).max(8).default([]), order: z.number().int().default(0) });
adminRouter.get('/collections', ah(async (_q, res) => { res.json(await Collection.find().sort('order')); }));
const withCover = <T extends { images?: string[] }>(b: T) => (b.images ? { ...b, image: b.images[0] ?? '' } : b); // image = cover = first of images
adminRouter.post('/collections', ah(async (req, res) => { res.status(201).json(await Collection.create(withCover(collectionIn.parse(req.body)))); }));
adminRouter.put('/collections/:id', ah(async (req, res) => {
  const c = await Collection.findByIdAndUpdate(id.parse(req.params.id), withCover(collectionIn.partial().parse(req.body)), { new: true });
  if (!c) throw new HttpError(404, 'Collection not found');
  res.json(c);
}));
adminRouter.delete('/collections/:id', ah(async (req, res) => {
  const c = await Collection.findById(id.parse(req.params.id));
  if (c && (await Product.countDocuments({ collection: c.slug })) > 0) throw new HttpError(409, 'Move or delete this collection\'s products first.');
  await c?.deleteOne();
  res.json({ ok: true });
}));

adminRouter.get('/orders', ah(async (req, res) => {
  const q = z.object({ status: z.enum(STATUSES).optional(), page: z.coerce.number().int().min(1).default(1) }).parse(req.query);
  const filter = q.status ? { status: q.status } : {};
  const [items, total] = await Promise.all([Order.find(filter).sort('-createdAt').skip((q.page - 1) * 30).limit(30), Order.countDocuments(filter)]);
  res.json({ items, total, page: q.page });
}));
adminRouter.get('/orders/:id', ah(async (req, res) => {
  const o = await Order.findById(id.parse(req.params.id));
  if (!o) throw new HttpError(404, 'Order not found');
  res.json(o);
}));
adminRouter.patch('/orders/:id', ah(async (req, res) => {
  const b = z.object({ status: z.enum(STATUSES).optional(), adminNote: z.string().max(1000).optional() }).parse(req.body);
  const o = await Order.findById(id.parse(req.params.id));
  if (!o) throw new HttpError(404, 'Order not found');
  if (b.status === 'cancelled' && !o.stockRestored) { // cancelling returns the reserved stock exactly once
    for (const i of o.items) await Product.updateOne({ _id: i.productId, 'variants.label': i.variant }, { $inc: { 'variants.$.stock': i.qty ?? 0 } });
    o.stockRestored = true;
  }
  if (b.status) o.status = b.status;
  if (b.adminNote !== undefined) o.adminNote = b.adminNote;
  await o.save();
  res.json(o);
}));

adminRouter.get('/inquiries', ah(async (_q, res) => { res.json(await Inquiry.find().sort('-createdAt')); }));
adminRouter.patch('/inquiries/:id', ah(async (req, res) => {
  const b = z.object({ status: z.enum(['new', 'read', 'answered']) }).parse(req.body);
  res.json(await Inquiry.findByIdAndUpdate(id.parse(req.params.id), b, { new: true }));
}));
adminRouter.delete('/inquiries/:id', ah(async (req, res) => { await Inquiry.findByIdAndDelete(id.parse(req.params.id)); res.json({ ok: true }); }));

const settingsIn = z.object({
  home: z.object({ tagline: z.string().max(120), intro: z.string().max(300) }),
  announcement: z.object({ active: z.boolean(), text: z.string().max(200) }),
  contact: z.object({ email: z.string().max(120), phone: z.string().max(40), whatsapp: z.string().max(40), address: z.string().max(200) }),
  socials: z.array(z.object({ label: z.string().max(40), href: z.string().url() })).max(10),
  shipping: z.object({ fee: z.number().min(0), freeOver: z.number().min(0), note: z.string().max(300) }),
  wall: z.array(z.object({ title: z.string().max(80), caption: z.string().max(120), to: z.string().max(120), image: z.string().max(300), active: z.boolean().default(true) })).max(60),
  about: z.object({ headline: z.string().max(160), intro: z.array(z.string().max(700)).max(8), portrait: z.string().max(300),
    chapters: z.array(z.object({ tag: z.string().max(40), title: z.string().max(120), lines: z.array(z.string().max(300)).max(6) })).min(1).max(6),
    closing: z.string().max(120), spiral: z.array(z.string().max(300)).max(48) }),
  contactPage: z.object({ heading: z.string().max(80), intro: z.string().max(400), slides: z.array(z.string().max(300)).max(12), faq: z.array(z.object({ q: z.string().max(120), a: z.string().max(500) })).max(10) }),
});
adminRouter.get('/settings', ah(async (_q, res) => { res.json({ ...(await getSettings()), governorates: GOVERNORATES }); }));
adminRouter.put('/settings', ah(async (req, res) => {
  const data = settingsIn.parse(req.body);
  await Setting.findOneAndUpdate({ key: 'site' }, { key: 'site', data }, { upsert: true });
  res.json(data);
}));

const EXT: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/avif': '.avif' };
const upload = multer({
  storage: multer.diskStorage({ destination: resolve(env.UPLOAD_DIR), filename: (_q, f, cb) => cb(null, `${randomBytes(8).toString('hex')}${EXT[f.mimetype] ?? extname(f.originalname)}`) }),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_q, f, cb) => {
    if (EXT[f.mimetype]) cb(null, true);
    else cb(new HttpError(400, 'Only JPEG, PNG, WebP or AVIF images are allowed')); // Multer signature: (error) or (null, accept)
  },
});
const looksLikeImage = (path: string) => {
  const b = Buffer.alloc(16), fd = openSync(path, 'r');
  try { readSync(fd, b, 0, 16, 0); } finally { closeSync(fd); }
  return (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || b.subarray(0, 4).toString('hex') === '89504e47' ||
    (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') || b.subarray(4, 12).toString() === 'ftypavif';
};
adminRouter.post('/uploads', upload.array('files', 10), (req, res) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const bad = files.filter((f) => !looksLikeImage(f.path));
  bad.forEach((f) => unlinkSync(f.path));
  if (bad.length) throw new HttpError(400, 'One of the files is not a valid image.');
  res.status(201).json({ urls: files.map((f) => `/uploads/${f.filename}`) });
});
