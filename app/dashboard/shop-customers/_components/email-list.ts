import { orderStats } from './order-stats.ts';

type Seen = { value: string };
type Person = {
  full_name?: string | null;
  email?: string | null;
  number?: string | null;
  source_data?: {
    emails?: Seen[];
    phones?: Seen[];
    orders?: { status?: string | null; total?: string | null; date?: string | null }[];
  } | null;
};

export type EmailGroup = 'ok' | 'typo' | 'invalid' | 'junk' | 'phone';

export const GROUP_LABELS: Record<EmailGroup, string> = {
  ok: 'Email ок',
  typo: 'Описка в домені',
  invalid: 'Некоректний email',
  junk: 'Вигаданий email',
  phone: 'Лише телефон',
};

export type EmailRow = {
  group: EmailGroup;
  email: string;
  // For a typo: the address as it was most likely meant.
  fix: string;
  name: string;
  phone: string;
  completed: number;
  lastPurchase: string;
};

// Loose on purpose: anything shaped like name@domain.tld passes here, and
// typos in the domain are caught separately.
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The shop's own addresses: staff placing orders for customers, not customers.
const OWN_DOMAIN = /@(?:[^@]+\.)?gaderia\.com\.ua$/;

// Mail providers customers actually use (measured on the 22.10.2026 export).
// A domain a letter or two away from one of these is almost always a typo:
// gmail.con, gmai.com, gimail.com, ukr.ner, 29gmail.com.
export const PROVIDERS = [
  'gmail.com', 'ukr.net', 'icloud.com', 'i.ua', 'meta.ua', 'yahoo.com',
  'outlook.com', 'hotmail.com', 'bigmir.net', 'ua.fm', 'email.ua', 'online.ua',
];
// Real domains that happen to sit that close to a provider.
const NOT_TYPOS = new Set([
  ...PROVIDERS, 'mail.com', 'mail.ru', 'gmx.com', 'ukr.com', 'live.com', 'me.com', 'mac.com',
  'mozmail.com', 'yopmail.com', 'ymail.com', 'in.ua',
]);

// Edits between two strings, a swap of neighbours counting as one: urk.net
// is a single slip from ukr.net, not two.
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

// Typed to get past the checkout, not to be written to: test@test.ua,
// 1@g.com, asd@fvvf.com, a@sdfds.ff.
const TEST_WORDS = /^(?:tes|test|tets|testing|tst)\d*$/;
const STUB_DOMAINS = new Set(['ua.ua', 'com.ua', 'net.ua', 'org.ua', 'example.com', 'mail.ua']);
// Endings a real address can have; anything else (.ff, .sdjs, .ua12) is made up.
const KNOWN_TLDS = new Set([
  'com', 'net', 'org', 'ua', 'ru', 'by', 'kz', 'md', 'pl', 'de', 'cz', 'sk', 'ch', 'at', 'it', 'fr', 'es',
  'uk', 'eu', 'us', 'ca', 'il', 'lt', 'lv', 'ee', 'ro', 'hu', 'bg', 'nl', 'be', 'se', 'no', 'fi', 'dk',
  'io', 'me', 'biz', 'info', 'pro', 'tech', 'company', 'online', 'site', 'store', 'shop', 'app', 'dev',
  'edu', 'gov', 'fm', 'tv', 'cc', 'co', 'xyz', 'top', 'club',
]);

function looksMadeUp(domain: string): boolean {
  if (NOT_TYPOS.has(domain)) return false; // i.ua is one letter and real
  if (STUB_DOMAINS.has(domain)) return true;
  const labels = domain.split('.');
  const first = labels[0];
  const tld = labels[labels.length - 1];
  if (!KNOWN_TLDS.has(tld)) return true;
  if (TEST_WORDS.test(first)) return true;
  // 1@g.com, a@123.ua, x@093.ua
  if (first.length === 1 || /^\d+$/.test(first)) return true;
  // Keyboard mash: four letters or more and not one vowel (fvvf, gfdg).
  if (/^[a-z]{4,}$/.test(first) && !/[aeiouy]/.test(first)) return true;
  return false;
}

// The same at a real service: test@gmail.com, qwerty@gmail.com, and keyboard
// mash - no vowels, with a letter hammered (ghhhh, jshdhgjdjdjdj) or all from
// the home row (fsdfds). All-digit names stay: ukr.net and i.ua allow them,
// and short abbreviations (vldvlsk) are real people.
const TEST_NAMES = /^(?:tes|test|tets|tst|qwerty|qwe|asd|asdf|zzz+|xxx+|aaa+)\d*$/;
const HOME_ROW = /^[asdfghjkl]+$/;

function nameLooksMadeUp(local: string): boolean {
  if (TEST_NAMES.test(local)) return true;
  if (!/^[a-z]{5,}$/.test(local) || /[aeiouy]/.test(local)) return false;
  if (HOME_ROW.test(local)) return true;
  const counts = new Map<string, number>();
  for (const c of local) counts.set(c, (counts.get(c) ?? 0) + 1);
  return Math.max(...counts.values()) >= 3;
}

// The big services by their name alone, for a slip in the name with any
// ending: gmal.ua, uahoo.com.ua.
const PROVIDER_NAMES = ['gmail', 'yahoo', 'icloud', 'hotmail', 'outlook'];

function likelyProvider(domain: string): string | null {
  if (NOT_TYPOS.has(domain)) return null;
  // Short domains (i.ua) would match half the alphabet; only near-misses of
  // longer ones count, and "gmail.ua"-style wrong endings by their first part.
  const first = domain.split('.')[0];
  if (first !== 'mail' && first !== 'email') {
    const name = PROVIDER_NAMES.find((n) => first !== n && distance(first, n) <= 1);
    if (name) return PROVIDERS.find((p) => p.startsWith(`${name}.`)) ?? null;
  }
  for (const p of PROVIDERS) {
    // i.ua and ua.fm are a letter away from too many real domains.
    if (p.length < 7) continue;
    const limit = p.length >= 9 ? 2 : 1;
    if (distance(domain, p) <= limit) return p;
    if (p.length >= 7 && first === p.split('.')[0]) return p;
    // Something stuck to the front: 29gmail.com, 21ukr.net.
    if (p.length >= 7 && domain.endsWith(p) && domain[domain.length - p.length - 1] !== '.') return p;
  }
  return null;
}

export type EmailCheck =
  | { group: 'ok'; email: string }
  | { group: 'typo'; email: string; fix: string }
  | { group: 'invalid'; email: string }
  | { group: 'junk'; email: string }
  | { group: 'own' }
  | null;

/** What one value from an email field is: usable, a typo, broken, ours, or nothing. */
export function checkEmail(raw: string | null | undefined): EmailCheck {
  const value = raw?.trim().toLowerCase();
  // Dashes, "нема", a phone typed into the field: not an attempt at an address.
  if (!value || !value.includes('@')) return null;
  if (OWN_DOMAIN.test(value)) return { group: 'own' };

  // Stray punctuation at the end ("ivan@gmail.com,") is a typo with an obvious fix.
  const trimmed = value.replace(/[.,;:]+$/, '');
  if (!LOOKS_LIKE_EMAIL.test(trimmed)) {
    const [local, domain = ''] = trimmed.split('@');
    const provider = local && !/\s/.test(trimmed) ? likelyProvider(domain) : null;
    return provider ? { group: 'typo', email: value, fix: `${local}@${provider}` } : { group: 'invalid', email: value };
  }
  const [local, domain] = trimmed.split('@');
  const provider = likelyProvider(domain);
  if (provider) return { group: 'typo', email: value, fix: `${local}@${provider}` };
  if (trimmed !== value) return { group: 'typo', email: value, fix: trimmed };
  if (looksMadeUp(domain) || nameLooksMadeUp(local)) return { group: 'junk', email: value };
  return { group: 'ok', email: value };
}

/** +380XXXXXXXXX, the way the shop sync identifies people; null if too short. */
export function normalisePhone(phone: string | null | undefined): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');
  return digits.length < 9 ? null : `+380${digits.slice(-9)}`;
}

function defaultSummary(p: Person) {
  const stats = orderStats(p.source_data?.orders);
  return { completed: stats.completed, lastPurchase: stats.lastCompletedAt?.slice(0, 10) ?? '' };
}

const GROUP_ORDER: EmailGroup[] = ['ok', 'typo', 'invalid', 'junk', 'phone'];

/**
 * One row per address, grouped: good addresses, then typos with a suggested
 * fix, then broken ones, then people reachable only by phone. Within a group
 * the order given is kept, so on-screen sorting decides it. An address shared
 * by several people (a family, an office) is listed once, for the first.
 *
 * Someone with only a broken or mistyped address is still listed under it,
 * with their phone; someone with no address at all, by phone, once per number.
 */
export function emailList<P extends Person>(
  people: P[],
  // The order summary; a CSV that holds it ready-made (extract-emails.mjs)
  // passes its own instead of the orders.
  summary: (p: P) => { completed: number; lastPurchase: string } = defaultSummary,
): EmailRow[] {
  const rows = new Map<string, EmailRow>();

  for (const p of people) {
    const stats = summary(p);
    const phones = [p.number, ...(p.source_data?.phones ?? []).map((s) => s.value)];
    const phone = phones.map(normalisePhone).find(Boolean) ?? '';
    const row = (group: EmailGroup, email = '', fix = ''): EmailRow => ({
      group,
      email,
      fix,
      name: p.full_name ?? '',
      phone,
      completed: stats.completed,
      lastPurchase: stats.lastPurchase,
    });

    let listed = false;
    for (const raw of [p.email, ...(p.source_data?.emails ?? []).map((e) => e.value)]) {
      const check = checkEmail(raw);
      if (!check || check.group === 'own') continue;
      listed = true;
      const key = `email:${check.email}`;
      if (!rows.has(key)) rows.set(key, row(check.group, check.email, check.group === 'typo' ? check.fix : ''));
    }

    if (!listed && phone && !rows.has(`phone:${phone}`)) rows.set(`phone:${phone}`, row('phone'));
  }

  const all = [...rows.values()];
  return GROUP_ORDER.flatMap((g) => all.filter((r) => r.group === g));
}

// Mail services people actually sign up with. An address elsewhere may be a
// company or university mailbox, so it is left for a person to look through
// (extract-emails.mjs lists them) rather than mailed blindly.
export const POPULAR_DOMAINS = new Set([
  ...PROVIDERS,
  'mail.ru', 'yandex.ru', 'yandex.ua', 'live.com', 'me.com', 'mac.com', 'proton.me', 'protonmail.com',
  'mail.com', 'ymail.com', 'rocketmail.com', 'gmx.com', 'gmx.de', 'web.de', 'aol.com', 'msn.com',
]);

/** Addresses ready for a mailing: good ones at the usual services, each once. */
export function cleanEmails(rows: EmailRow[]): string[] {
  return rows.filter((r) => r.group === 'ok' && POPULAR_DOMAINS.has(r.email.split('@')[1])).map((r) => r.email);
}
