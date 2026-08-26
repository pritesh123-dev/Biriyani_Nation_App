import { quoteCart, PricingError } from '../src/lib/pricing.js';
import { DEFAULT_CONFIG, isOpenNow } from '../src/lib/config.js';
import { normalisePhone } from '../src/lib/http.js';
import { K } from '../src/lib/db.js';
import assert from 'node:assert';

let pass = 0, fail = 0;
const t = (name: string, fn: () => void) => {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + ' -> ' + (e as Error).message); }
};

const C = DEFAULT_CONFIG;

console.log('\nPricing');
t('regular chicken, no addons', () => {
  const q = quoteCart(C, [{ dishId: 'chicken', packId: 'regular', qty: 1 }]);
  assert.equal(q.subtotal, 349);
  assert.equal(q.discount, 0, 'no promo code passed');
  assert.equal(q.taxes, Math.round(349 * 0.05));
  assert.equal(q.total, 349 + Math.round(349 * 0.05));
});

t('promo applies above minSubtotal', () => {
  const q = quoteCart(C, [{ dishId: 'chicken', packId: 'regular', qty: 1 }], 'DUM50');
  assert.equal(q.discount, 50);
  assert.equal(q.promoCode, 'DUM50');
  // tax is charged on the discounted amount
  assert.equal(q.taxes, Math.round((349 - 50) * 0.05));
  assert.equal(q.total, 299 + Math.round(299 * 0.05));
});

t('promo rejected below minSubtotal', () => {
  const q = quoteCart(C, [{ dishId: 'aloo', packId: 'mini', qty: 1 }], 'DUM50'); // 149 < 300
  assert.equal(q.discount, 0);
  assert.equal(q.promoCode, null);
});

t('promo code is case-insensitive', () => {
  const q = quoteCart(C, [{ dishId: 'chicken', packId: 'regular', qty: 1 }], 'dum50');
  assert.equal(q.discount, 50);
});

t('addons add to unit price and multiply by qty', () => {
  const q = quoteCart(C, [{ dishId: 'aloo', packId: 'mini', qty: 3, addonIds: ['raita','salan'] }]);
  const unit = 149 + 39 + 49;
  assert.equal(q.lines[0].unitPrice, unit);
  assert.equal(q.subtotal, unit * 3);
  assert.equal(q.itemCount, 3);
});

t('coins earned from total', () => {
  const q = quoteCart(C, [{ dishId: 'chicken', packId: 'family', qty: 1 }]);
  assert.equal(q.coinsEarned, Math.floor(q.total * 0.1));
});

console.log('\nPricing rejects tampering');
t('unknown dish rejected', () => {
  assert.throws(() => quoteCart(C, [{ dishId: 'gold-plated', packId: 'mini', qty: 1 }]), PricingError);
});
t('unknown pack rejected', () => {
  assert.throws(() => quoteCart(C, [{ dishId: 'chicken', packId: 'free', qty: 1 }]), PricingError);
});
t('unknown addon rejected', () => {
  assert.throws(() => quoteCart(C, [{ dishId: 'chicken', packId: 'mini', qty: 1, addonIds: ['caviar'] }]), PricingError);
});
t('qty 0 rejected', () => {
  assert.throws(() => quoteCart(C, [{ dishId: 'chicken', packId: 'mini', qty: 0 }]), PricingError);
});
t('negative qty rejected', () => {
  assert.throws(() => quoteCart(C, [{ dishId: 'chicken', packId: 'mini', qty: -5 }]), PricingError);
});
t('absurd qty rejected', () => {
  assert.throws(() => quoteCart(C, [{ dishId: 'chicken', packId: 'mini', qty: 999 }]), PricingError);
});
t('empty cart rejected', () => {
  assert.throws(() => quoteCart(C, []), PricingError);
});
t('sold-out dish rejected', () => {
  const cfg = { ...C, dishes: C.dishes.map(d => d.id==='chicken' ? {...d, available:false} : d) };
  assert.throws(() => quoteCart(cfg, [{ dishId:'chicken', packId:'mini', qty:1 }]), PricingError);
});

console.log('\nPhone normalisation');
t('plain 10 digit', () => assert.equal(normalisePhone('9876543210'), '+919876543210'));
t('spaced', () => assert.equal(normalisePhone('98765 43210'), '+919876543210'));
t('with +91', () => assert.equal(normalisePhone('+91 98765 43210'), '+919876543210'));
t('with 91 prefix', () => assert.equal(normalisePhone('919876543210'), '+919876543210'));
t('with leading 0', () => assert.equal(normalisePhone('09876543210'), '+919876543210'));
t('landline-ish rejected', () => assert.equal(normalisePhone('1234567890'), null));
t('too short rejected', () => assert.equal(normalisePhone('98765'), null));
t('empty rejected', () => assert.equal(normalisePhone(''), null));
t('letters rejected', () => assert.equal(normalisePhone('abcdefghij'), null));

console.log('\nOpening hours (IST)');
const at = (istHour: number, istMin = 0) => {
  // build a UTC instant that is istHour:istMin in IST
  const d = new Date(Date.UTC(2026, 0, 15, istHour, istMin));
  return new Date(d.getTime() - (5*60+30)*60000);
};
t('open at 12:00 IST', () => assert.equal(isOpenNow(C, at(12)), true));
t('closed at 09:00 IST', () => assert.equal(isOpenNow(C, at(9)), false));
t('closed at 23:30 IST', () => assert.equal(isOpenNow(C, at(23,30)), false));
t('open at 11:00 boundary', () => assert.equal(isOpenNow(C, at(11)), true));
t('closed at 23:00 boundary', () => assert.equal(isOpenNow(C, at(23)), false));
t('acceptingOrders=false forces closed', () => {
  const cfg = { ...C, store: { ...C.store, acceptingOrders: false } };
  assert.equal(isOpenNow(cfg, at(12)), false);
});
t('past-midnight close window works', () => {
  const cfg = { ...C, store: { ...C.store, openTime:'11:00', closeTime:'02:00' } };
  assert.equal(isOpenNow(cfg, at(1)), true);   // 1 AM inside
  assert.equal(isOpenNow(cfg, at(5)), false);  // 5 AM outside
});

console.log('\nKey layout');
t('counter is scoped per day (no unbounded item growth)', () => {
  assert.notEqual(K.counter('2026-01-01').sk, K.counter('2026-01-02').sk);
  assert.equal(K.counter('2026-01-01').pk, 'COUNTER');
});
t('one customer cannot collide with another', () => {
  assert.notEqual(K.user('+919876543210').pk, K.user('+919876543211').pk);
});
t('otp and rate rows are separate from the profile', () => {
  const phone = '+919876543210';
  assert.notEqual(K.otp(phone).pk, K.user(phone).pk);
  assert.notEqual(K.rate(phone, '2026-01-01T10').pk, K.user(phone).pk);
});

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
