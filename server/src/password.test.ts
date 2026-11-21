import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DUMMY_HASH, hashPassword, isValidHash, verifyPassword } from './password.js';

test('hashPassword produces a valid salt:hash string and verifies', async () => {
  const h = await hashPassword('correct horse battery');
  assert.ok(isValidHash(h));
  assert.equal(await verifyPassword('correct horse battery', h), true);
  assert.equal(await verifyPassword('wrong password', h), false);
});
test('two hashes of the same password differ (random salt)', async () => {
  assert.notEqual(await hashPassword('same-password-1'), await hashPassword('same-password-1'));
});
test('verifyPassword returns false (never throws) for missing or malformed hashes', async () => {
  for (const bad of [undefined, null, 42, {}, '', 'abc', 'a:b', ':', 'zz:zz', `${'0'.repeat(32)}:${'0'.repeat(10)}`, 'x'.repeat(500)]) {
    assert.equal(await verifyPassword('anything', bad), false, `stored=${String(bad).slice(0, 12)}`);
  }
  assert.equal(await verifyPassword(undefined, await hashPassword('pw-pw-pw-pw')), false);
});
test('dummy hash is well formed but never matches', async () => {
  assert.ok(isValidHash(DUMMY_HASH));
  assert.equal(await verifyPassword('', DUMMY_HASH), false);
  assert.equal(await verifyPassword('anything', DUMMY_HASH), false);
});
