import mongoose, { Schema, model } from 'mongoose';

const json = {
  versionKey: false as const, // literal `false` (Mongoose expects string | false, not boolean)
  toJSON: { virtuals: true, versionKey: false, transform: (_d: unknown, r: Record<string, unknown>) => { r.id = String(r._id); delete r._id; return r; } },
};
export const STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

export const Collection = model('Collection', new Schema({
  slug: { type: String, required: true, unique: true }, title: { type: String, required: true },
  description: { type: String, default: '' }, image: { type: String, default: '' }, images: { type: [String], default: [] }, order: { type: Number, default: 0 },
}, json));

const variant = new Schema({ label: { type: String, required: true }, color: String, fragrance: String, stock: { type: Number, min: 0, default: 0 } }, { _id: false });
export const Product = model('Product', new Schema({
  slug: { type: String, required: true, unique: true }, title: { type: String, required: true },
  description: { type: String, default: '' }, price: { type: Number, required: true, min: 0 },
  collection: { type: String, required: true, index: true },
  images: [new Schema({ url: String, alt: { type: String, default: '' } }, { _id: false })],
  variants: { type: [variant], validate: (v: unknown[]) => v.length > 0 },
  details: [new Schema({ label: String, value: String }, { _id: false })],
  active: { type: Boolean, default: true }, sortOrder: { type: Number, default: 0 },
}, { ...json, timestamps: true }));

export const Order = model('Order', new Schema({
  number: { type: String, required: true, unique: true },
  items: [new Schema({ productId: String, title: String, variant: String, price: Number, qty: Number }, { _id: false })],
  subtotal: Number, shipping: Number, total: Number,
  customer: { name: String, phone: String, email: String },
  address: { governorate: String, city: String, details: String },
  note: String, adminNote: { type: String, default: '' },
  paymentMethod: { type: String, default: 'cash_on_delivery' },
  status: { type: String, enum: STATUSES, default: 'new', index: true },
  stockRestored: { type: Boolean, default: false },
}, { ...json, timestamps: true }));

export const Inquiry = model('Inquiry', new Schema({
  name: String, email: String, topic: String, message: String,
  status: { type: String, enum: ['new', 'read', 'answered'], default: 'new' },
}, { ...json, timestamps: true }));

export const Setting = model('Setting', new Schema({ key: { type: String, unique: true }, data: Schema.Types.Mixed }, json));
export const Admin = model('Admin', new Schema({ email: { type: String, unique: true, required: true }, passwordHash: { type: String, required: true } }, json));
export { mongoose };
