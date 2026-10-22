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

export type EmailRow = { email: string; name: string; phone: string; completed: number; lastPurchase: string };

// Loose on purpose: it only drops what cannot be an address (typos like
// "ivan@gmail", "—", a phone typed into the email field).
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The shop's own addresses: staff placing orders for customers, not customers.
const OWN_DOMAIN = /@(?:[^@]+\.)?gaderia\.com\.ua$/;

/** +380XXXXXXXXX, the way the shop sync identifies people; null if too short. */
export function normalisePhone(phone: string | null | undefined): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');
  return digits.length < 9 ? null : `+380${digits.slice(-9)}`;
}

/**
 * One row per address. A person's every email counts, not just the newest; an
 * address shared by several people (a family, an office) is listed once, for
 * the first of them in the order given - so on-screen sorting decides who.
 *
 * Someone with no usable email is still listed, by phone with the Email cell
 * empty, once per phone number.
 */
export function emailList(people: Person[]): EmailRow[] {
  const byEmail = new Map<string, EmailRow>();
  const byPhone = new Map<string, EmailRow>();

  for (const p of people) {
    const stats = orderStats(p.source_data?.orders);
    const phones = [p.number, ...(p.source_data?.phones ?? []).map((s) => s.value)];
    const phone = phones.map(normalisePhone).find(Boolean) ?? '';
    const row = (email: string): EmailRow => ({
      email,
      name: p.full_name ?? '',
      phone,
      completed: stats.completed,
      lastPurchase: stats.lastCompletedAt?.slice(0, 10) ?? '',
    });

    let hasEmail = false;
    for (const raw of [p.email, ...(p.source_data?.emails ?? []).map((e) => e.value)]) {
      const email = raw?.trim().toLowerCase();
      if (!email || !LOOKS_LIKE_EMAIL.test(email) || OWN_DOMAIN.test(email)) continue;
      hasEmail = true;
      if (!byEmail.has(email)) byEmail.set(email, row(email));
    }

    if (!hasEmail && phone && !byPhone.has(phone)) byPhone.set(phone, row(''));
  }
  // Addresses first, then the phone-only people.
  return [...byEmail.values(), ...byPhone.values()];
}
