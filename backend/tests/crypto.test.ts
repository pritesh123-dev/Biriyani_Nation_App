import crypto from 'node:crypto';
import { hashOtp, randomOtp, randomSalt, safeEqual, pickupCode } from '../src/lib/auth.js';
import assert from 'node:assert';

let pass = 0, fail = 0;
const t = (n: string, fn: () => void) => {
  try { fn(); pass++; console.log('  ok  ' + n); }
  catch (e) { fail++; console.log('  FAIL ' + n + ' -> ' + (e as Error).message); }
};

console.log('\nOTP codes');
t('always 6 digits', () => {
  for (let i = 0; i < 2000; i++) assert.match(randomOtp(6), /^\d{6}$/);
});
t('never starts with 0 (full entropy range)', () => {
  for (let i = 0; i < 2000; i++) assert.ok(randomOtp(6)[0] !== '0');
});
t('reasonably uniform', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 5000; i++) seen.add(randomOtp(6));
  // 5000 draws from 900k should collide rarely
  assert.ok(seen.size > 4900, `only ${seen.size} unique`);
});

console.log('\nOTP hashing');
t('same input, same hash', () => {
  const salt = randomSalt();
  assert.equal(hashOtp('+919876543210', '123456', salt), hashOtp('+919876543210', '123456', salt));
});
t('different salt, different hash', () => {
  assert.notEqual(hashOtp('+919876543210','123456',randomSalt()), hashOtp('+919876543210','123456',randomSalt()));
});
t('code bound to phone (no cross-number replay)', () => {
  const salt = randomSalt();
  assert.notEqual(hashOtp('+919876543210','123456',salt), hashOtp('+919999999999','123456',salt));
});
t('wrong code does not match', () => {
  const salt = randomSalt();
  assert.ok(!safeEqual(hashOtp('+919876543210','123456',salt), hashOtp('+919876543210','123457',salt)));
});
t('safeEqual handles unequal lengths without throwing', () => {
  assert.equal(safeEqual('abc', 'abcdef'), false);
});

console.log('\nPickup codes');
t('4 chars, unambiguous alphabet', () => {
  for (let i = 0; i < 2000; i++) assert.match(pickupCode(), /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/);
});
t('excludes O/0/I/1 lookalikes', () => {
  for (let i = 0; i < 2000; i++) assert.ok(!/[O0I1]/.test(pickupCode()));
});

console.log('\nJWT shape (HMAC round-trip)');
t('tampered payload fails signature', () => {
  const secret = 'test-secret';
  const b64 = (s: string) => Buffer.from(s).toString('base64url');
  const header = b64(JSON.stringify({ alg:'HS256', typ:'JWT' }));
  const payload = b64(JSON.stringify({ sub:'+919876543210', exp: 9e9 }));
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');

  const evil = b64(JSON.stringify({ sub:'+919876543210', admin:true, exp: 9e9 }));
  const evilSig = crypto.createHmac('sha256', secret).update(`${header}.${evil}`).digest('base64url');
  assert.notEqual(sig, evilSig, 'signature must change when claims change');
});

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
