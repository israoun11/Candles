import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(_scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const SALT_BYTES = 16, KEY_BYTES = 64;
const FORMAT = new RegExp(`^[0-9a-f]{${SALT_BYTES * 2}}:[0-9a-f]{${KEY_BYTES * 2}}$`);

/** True only for a well-formed "salt:hash" scrypt string produced by hashPassword(). */
export const isValidHash = (value: unknown): value is string => typeof value === 'string' && FORMAT.test(value);

/** A valid-looking hash nobody's password can match; used to keep login timing similar when no account exists. */
export const DUMMY_HASH = `${'00'.repeat(SALT_BYTES)}:${'00'.repeat(KEY_BYTES)}`;

export async function hashPassword(password: string): Promise<string> {
  if (!password) throw new Error('Password must not be empty');
  const salt = randomBytes(SALT_BYTES);
  return `${salt.toString('hex')}:${(await scrypt(password, salt, KEY_BYTES)).toString('hex')}`;
}

/** Never throws for bad stored data: a missing or malformed hash simply fails verification. */
export async function verifyPassword(password: unknown, stored: unknown): Promise<boolean> {
  if (typeof password !== 'string' || !isValidHash(stored)) return false;
  const [salt, hash] = stored.split(':');
  const expected = Buffer.from(hash, 'hex'), actual = await scrypt(password, Buffer.from(salt, 'hex'), KEY_BYTES);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
