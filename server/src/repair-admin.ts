import mongoose from 'mongoose';
import { auditAdmins, ensureAdmin } from './adminAccount.js';
import { env } from './config.js';

// Safe repair: touches only the Admin collection, only for ADMIN_EMAIL, and only if its hash is missing/malformed.
if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first.');
  process.exit(1);
}
await mongoose.connect(env.MONGODB_URI);
const before = await auditAdmins();
console.log(`Admin accounts: ${before.total}, with a missing/invalid password hash: ${before.invalidHash}`);
const result = await ensureAdmin(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
console.log({ created: 'Admin created.', repaired: 'Admin password hash was invalid and has been repaired from ADMIN_PASSWORD.', unchanged: 'Admin already has a valid password hash; nothing changed.' }[result]);
await mongoose.disconnect();
