import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emailList, normalisePhone } from './email-list.ts';

test('every address a person used, lower-cased, once', () => {
  const rows = emailList([
    { full_name: 'Іван', email: 'Ivan@Gmail.com', number: '+38(050)111-22-33', source_data: { emails: [{ value: 'ivan@gmail.com' }, { value: 'ivan.work@ukr.net' }] } },
  ]);
  assert.deepEqual(rows.map((r) => r.email), ['ivan@gmail.com', 'ivan.work@ukr.net']);
  assert.equal(rows[1].name, 'Іван');
  assert.equal(rows[1].phone, '+380501112233');
});

test('a shared address goes to the first person in the given order', () => {
  const rows = emailList([
    { full_name: 'Перша', email: 'family@ukr.net', source_data: { orders: [{ status: 'completed', total: '100', date: '2026-05-01T10:00:00' }] } },
    { full_name: 'Друга', email: 'family@ukr.net' },
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Перша');
  assert.equal(rows[0].completed, 1);
  assert.equal(rows[0].lastPurchase, '2026-05-01');
});

test("the shop's own addresses are left out", () => {
  const rows = emailList([
    { email: 'shop@gaderia.com.ua', source_data: { emails: [{ value: 'Sales@Gaderia.com.ua' }, { value: 'a@mail.gaderia.com.ua' }, { value: 'olena@gmail.com' }] } },
  ]);
  assert.deepEqual(rows.map((r) => r.email), ['olena@gmail.com']);
});

test('no usable email: listed by phone, once per number, after the addresses', () => {
  const rows = emailList([
    { full_name: 'Без пошти', email: null, number: '098 329 85 07' },
    { full_name: 'Той самий телефон', email: 'ivan@gmail', number: '+38(098)329-85-07' },
    { full_name: 'Лише службова', email: 'shop@gaderia.com.ua', number: '0671234567' },
    { full_name: 'З поштою', email: 'olena@gmail.com', number: '0500000000' },
  ]);
  assert.deepEqual(
    rows.map((r) => [r.email, r.phone, r.name]),
    [
      ['olena@gmail.com', '+380500000000', 'З поштою'],
      ['', '+380983298507', 'Без пошти'],
      ['', '+380671234567', 'Лише службова'],
    ],
  );
});

test('a phone from the history when the main one is missing', () => {
  const rows = emailList([{ email: null, number: null, source_data: { phones: [{ value: '0931112233' }] } }]);
  assert.equal(rows[0].phone, '+380931112233');
});

test('nothing to reach them by: left out', () => {
  assert.deepEqual(emailList([{ email: null }, { email: '  ', number: '12' }, { email: '—' }]), []);
});

test('phones in one shape', () => {
  assert.equal(normalisePhone('+38 (050) 111-22-33'), '+380501112233');
  assert.equal(normalisePhone('0501112233'), '+380501112233');
  assert.equal(normalisePhone('12345'), null);
});
