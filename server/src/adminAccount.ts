import { Admin } from './models.js';
import { hashPassword, isValidHash } from './password.js';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export type AdminResult = 'created' | 'repaired' | 'unchanged';

/**
 * Idempotent: creates the admin if no account has this email, repairs it only if its stored hash is
 * missing/malformed, and never touches an existing valid password. Never creates a second account for the same email.
 */
export async function ensureAdmin(email: string, password: string): Promise<AdminResult> {
  const clean = email.trim().toLowerCase();
  const existing = await Admin.findOne({ email: new RegExp(`^${escapeRegExp(clean)}$`, 'i') });
  if (!existing) {
    await Admin.create({ email: clean, passwordHash: await hashPassword(password) });
    return 'created';
  }
  if (isValidHash(existing.passwordHash)) return 'unchanged';
  await Admin.updateOne({ _id: existing._id }, { $set: { passwordHash: await hashPassword(password) } });
  return 'repaired';
}

/** Counts only; never returns hashes. */
export async function auditAdmins() {
  const all = await Admin.find();
  return { total: all.length, invalidHash: all.filter((a) => !isValidHash(a.passwordHash)).length };
}
