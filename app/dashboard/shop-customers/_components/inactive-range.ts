// "Не купували": ranges of days since the last completed order. They do not
// overlap, so each buyer is in exactly one, and together they make up everyone
// inactive for a week or more. Kept in the URL as ?inactive=30-60 or 365-.
export type InactiveRange = { key: string; label: string; min: number; max?: number };

export const INACTIVE_RANGES: InactiveRange[] = [
  { key: '7-30', label: '7–30 днів', min: 7, max: 30 },
  { key: '30-60', label: '30–60 днів', min: 30, max: 60 },
  { key: '60-90', label: '60–90 днів', min: 60, max: 90 },
  { key: '90-180', label: '3–6 місяців', min: 90, max: 180 },
  { key: '180-365', label: '6–12 місяців', min: 180, max: 365 },
  { key: '365-', label: 'понад рік', min: 365 },
  { key: '30-', label: 'усі понад 30 днів', min: 30 },
];

export function readInactiveRange(value: string | null): InactiveRange | undefined {
  return INACTIVE_RANGES.find((r) => r.key === value);
}

// The API query for a range: at least min days, at most max.
export function inactiveQuery(range: InactiveRange | undefined): Record<string, string> {
  if (!range) return {};
  return range.max ? { inactiveDays: String(range.min), inactiveMaxDays: String(range.max) } : { inactiveDays: String(range.min) };
}
