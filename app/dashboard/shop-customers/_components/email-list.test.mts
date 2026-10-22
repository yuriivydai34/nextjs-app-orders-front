import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkEmail, cleanEmails, emailList, normalisePhone } from './email-list.ts';

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
  // A customer's tagged gmail is theirs, not ours.
  assert.equal(checkEmail('shykraol+gaderia.com.ua@gmail.com')?.group, 'ok');
});

test('typos in the domain, with the address as meant', () => {
  const fix = (v: string) => {
    const c = checkEmail(v);
    return c?.group === 'typo' ? c.fix : c?.group;
  };
  assert.equal(fix('red@gmai.com'), 'red@gmail.com');
  assert.equal(fix('a@gmail.con'), 'a@gmail.com');
  assert.equal(fix('a@gimail.com'), 'a@gmail.com');
  assert.equal(fix('a@gmail.xom'), 'a@gmail.com');
  assert.equal(fix('a@gmail.ua'), 'a@gmail.com');
  assert.equal(fix('a@29gmail.com'), 'a@gmail.com');
  assert.equal(fix('a@ukr.ner'), 'a@ukr.net');
  assert.equal(fix('a@21ukr.net'), 'a@ukr.net');
  assert.equal(fix('a@urk.net'), 'a@ukr.net');
  assert.equal(fix('a@icloud.co'), 'a@icloud.com');
  assert.equal(fix('ivan@gmail'), 'ivan@gmail.com');
  assert.equal(fix('ivan@gmail.com,'), 'ivan@gmail.com');
});

test('real domains near a provider are not typos', () => {
  for (const v of ['a@mail.com', 'a@ukr.net', 'a@i.ua', 'a@meta.ua', 'a@ua.fm', 'a@fiori.ua', 'a@ukrgasbank.com', 'a@company.com.ua', 'a@gmx.com']) {
    assert.equal(checkEmail(v)?.group, 'ok', v);
  }
});

test('made-up addresses are told apart from real ones on rare domains', () => {
  for (const v of ['a@test.ua', 'a@tes.com', 'a@test7.com', 'a@g.com', 'a@123.ua', 'a@093.ua', 'a@ua.ua', 'a@com.ua',
    'a@fvvf.com', 'a@gfdg.gg', 'a@sdfds.ff', 'a@yydb.nrt', 'a@test.ua12', 'a@231.12']) {
    assert.equal(checkEmail(v)?.group, 'junk', v);
  }
  for (const v of ['a@ukrgasbank.com', 'a@lpnu.ua', 'a@vnmu.edu.ua', 'a@pwc.com', 'a@bk.ru', 'a@nmg.kiev.ua',
    'a@direkcy.atom.gov.ua', 'a@mail.lviv.ua', 'a@infocus.company', 'a@3g.ua', 'a@seznam.cz', 'a@pm.me']) {
    assert.equal(checkEmail(v)?.group, 'ok', v);
  }
  assert.deepEqual(checkEmail('a@gmal.ua'), { group: 'typo', email: 'a@gmal.ua', fix: 'a@gmail.com' });
  assert.deepEqual(checkEmail('a@uahoo.com.ua'), { group: 'typo', email: 'a@uahoo.com.ua', fix: 'a@yahoo.com' });
});

test('made-up names at real services', () => {
  for (const v of ['test@gmail.com', 'test@mail.com', 'qwerty@gmail.com', 'asd1@gmail.com', 'zzz@ukr.net',
    'ghhhh@gmail.com', 'jshdhgjdjdjdj@gmail.com', 'hfhghfcf@gmail.com', 'msmsms@gmail.com', 'xqwwwpx@gmail.com',
    'hsgsvsgs@gmail.com', 'kxxxxxd@ukr.net', 'djjdjdjdnxb@gmail.com', 'jfjsjjsjf@gmail.com', 'fsdfds@gmail.com']) {
    assert.equal(checkEmail(v)?.group, 'junk', v);
  }
  for (const v of ['120700@ukr.net', '88864@i.ua', 'vldvlsk@gmail.com', 'ppmlv@ukr.net', 'testova.olena@gmail.com',
    'shchur@gmail.com', 'lynn@gmail.com']) {
    assert.equal(checkEmail(v)?.group, 'ok', v);
  }
});

test('broken addresses are kept visible, not dropped', () => {
  assert.equal(checkEmail('ivan@')?.group, 'invalid');
  assert.equal(checkEmail('ivan @ some site')?.group, 'invalid');
  // Not an attempt at an address at all.
  assert.equal(checkEmail('—'), null);
  assert.equal(checkEmail('0501112233'), null);
});

test('groups in order: ok, typos, broken, phone only; each with its phone', () => {
  const rows = emailList([
    { full_name: 'Без пошти', email: null, number: '098 329 85 07' },
    { full_name: 'Описка', email: 'red@gmai.com', number: '0671111111' },
    { full_name: 'Той самий телефон', email: '—', number: '+38(098)329-85-07' },
    { full_name: 'Лише службова', email: 'shop@gaderia.com.ua', number: '0671234567' },
    { full_name: 'Зламана', email: 'olga@', number: '0672222222' },
    { full_name: 'З поштою', email: 'olena@gmail.com', number: '0500000000' },
  ]);
  assert.deepEqual(
    rows.map((r) => [r.group, r.email, r.fix, r.phone]),
    [
      ['ok', 'olena@gmail.com', '', '+380500000000'],
      ['typo', 'red@gmai.com', 'red@gmail.com', '+380671111111'],
      ['invalid', 'olga@', '', '+380672222222'],
      ['phone', '', '', '+380983298507'],
      ['phone', '', '', '+380671234567'],
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

test('the clean list: good addresses at the usual services only, each once', () => {
  const rows = emailList([
    { email: 'Olena@Gmail.com', source_data: { emails: [{ value: 'olena@gmail.com' }, { value: 'olena@ukrgasbank.com' }] } },
    { email: 'red@gmai.com', number: '0671111111' },
    { email: 'test@test.ua' },
    { email: 'qwerty@gmail.com' },
    { email: 'shop@gaderia.com.ua' },
    { email: 'ivan@ukr.net' },
    { email: null, number: '0501112233' },
  ]);
  assert.deepEqual(cleanEmails(rows), ['olena@gmail.com', 'ivan@ukr.net']);
});
