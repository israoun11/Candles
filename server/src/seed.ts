import mongoose from 'mongoose';
import { ensureAdmin } from './adminAccount.js';
import { env } from './config.js';
import { COLLECTIONS, PRODUCTS } from './data.js';
import { Collection, Product } from './models.js';

await mongoose.connect(env.MONGODB_URI);
for (const c of COLLECTIONS) await Collection.updateOne({ slug: c.slug }, { $setOnInsert: c }, { upsert: true });
for (const p of PRODUCTS) await Product.updateOne({ slug: p.slug }, { $setOnInsert: p }, { upsert: true }); // never overwrites your edits
if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) console.warn('No admin created: set ADMIN_EMAIL and ADMIN_PASSWORD in .env and run the seed again.');
else console.log(`Admin ${await ensureAdmin(env.ADMIN_EMAIL, env.ADMIN_PASSWORD)}.`); // created | repaired (invalid hash only) | unchanged
console.log('Seed complete.');
await mongoose.disconnect();
