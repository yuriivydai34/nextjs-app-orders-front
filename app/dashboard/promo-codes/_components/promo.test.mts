// npm test — Node's own runner, no extra dependencies. Runs in Europe/Kyiv
// (see package.json), where the managers are.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conditions, formatDiscount, fromDateInput, promoStatus, toDateInput, type PromoCode } from './promo.ts';

const now = new Date('2026-10-15T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

const code = (patch: Partial<PromoCode> = {}): PromoCode => ({
  id: 1, code: 'AUTUMN', title: null, discount_type: 'PERCENT', discount_value: 10,
  usage_limit: null, starts_at: null, ends_at: null, first_order_only: false,
  max_account_age_days: null, is_active: true, createdAt: '2026-10-01T00:00:00Z',
  used: 0, cancelled: 0, discount_total: 0, order_total: 0, last_used_at: null,
  ...patch,
});

const iso = (ms: number) => new Date(ms).toISOString();

test('status: a switched-off code says so even when it is also expired or used up', () => {
  assert.equal(promoStatus(code({ is_active: false, ends_at: iso(now.getTime() - DAY), usage_limit: 1, used: 1 }), now).label, 'Вимкнено');
});

test('status: scheduled, ended, used up, active', () => {
  assert.equal(promoStatus(code({ starts_at: iso(now.getTime() + DAY) }), now).label, 'Заплановано');
  assert.equal(promoStatus(code({ ends_at: iso(now.getTime() - DAY) }), now).label, 'Завершено');
  assert.equal(promoStatus(code({ usage_limit: 100, used: 100 }), now).label, 'Вичерпано');
  assert.equal(promoStatus(code({ usage_limit: 100, used: 99, cancelled: 5 }), now).label, 'Діє');
});

test('discount in words', () => {
  assert.equal(formatDiscount(code()), '−10%');
  assert.match(formatDiscount(code({ discount_type: 'FIXED', discount_value: 150 })), /^−150 грн$/);
});

test('conditions in words; a code without any says nothing', () => {
  assert.deepEqual(conditions(code()), []);
  assert.deepEqual(conditions(code({ first_order_only: true, max_account_age_days: 30, usage_limit: 100 })), [
    'ліміт 100', 'лише перше замовлення', 'акаунт до 30 дн.',
  ]);
});

// "Until 31.10" must still work at 23:30 Kyiv time on the 31st.
test('an end date covers the whole day in Kyiv, a start date begins at its midnight', () => {
  assert.equal(fromDateInput('2026-10-31', true), '2026-10-31T21:59:59.999Z');
  assert.equal(fromDateInput('2026-10-01', false), '2026-09-30T21:00:00.000Z');
  // Across the switch to winter time (25.10.2026) the offset changes to +2.
  assert.equal(fromDateInput('2026-11-01', false), '2026-10-31T22:00:00.000Z');
  assert.equal(fromDateInput('', true), null);
});

test('a saved date shows back as the same day in the form', () => {
  assert.equal(toDateInput(fromDateInput('2026-10-31', true)), '2026-10-31');
  assert.equal(toDateInput(fromDateInput('2026-10-01', false)), '2026-10-01');
  assert.equal(toDateInput(null), '');
});

test('automatic discounts: only auto_apply codes, split by whether they work now', async () => {
  const { autoDiscounts, audience } = await import('./promo.ts');
  const codes = [
    code({ id: 1, code: 'WELCOME10', auto_apply: true, first_order_only: true, max_account_age_days: 30 }),
    code({ id: 2, code: 'OLD', auto_apply: true, ends_at: iso(now.getTime() - DAY) }),
    code({ id: 3, code: 'TYPED', auto_apply: false }),
    code({ id: 4, code: 'OFF', auto_apply: true, is_active: false }),
  ];
  const { working, idle } = autoDiscounts(codes, now);
  assert.deepEqual(working.map((p) => p.code), ['WELCOME10']);
  assert.deepEqual(idle.map((p) => p.code), ['OLD', 'OFF']);
  assert.equal(audience(codes[0]), 'перше замовлення, акаунт до 30 дн.');
  assert.equal(audience(codes[1]), 'усі клієнти');
});
