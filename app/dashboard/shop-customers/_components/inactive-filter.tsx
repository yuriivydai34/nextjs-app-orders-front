'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// "Не купували N днів" for marketing: people whose newest completed order is
// older than N days (gaderia_mobile_admin_back, customers?inactiveDays=N).
// People who never completed an order are not in it: there is nobody to win
// back. Kept in the URL with search and sort, and the CSV export follows it.
export const INACTIVE_PRESETS = [30, 60, 90, 180, 365];

export function readInactiveDays(value: string | null): number | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 3650 ? n : undefined;
}

export default function InactiveFilter({ value }: { value?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const options = value && !INACTIVE_PRESETS.includes(value) ? [...INACTIVE_PRESETS, value].sort((a, b) => a - b) : INACTIVE_PRESETS;

  function change(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set('inactive', next);
    else params.delete('inactive');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={value ?? ''}
      onChange={(e) => change(e.target.value)}
      aria-label="Не купували"
      title="Остання виконана покупка давніше, ніж стільки днів тому"
      className={`py-2 pl-3 pr-8 rounded-lg text-sm border bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 ${
        value ? 'border-orange-300 text-orange-700 dark:text-orange-300' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
      }`}
    >
      <option value="">Усі покупці</option>
      {options.map((d) => (
        <option key={d} value={d}>Не купували {d} днів</option>
      ))}
    </select>
  );
}
