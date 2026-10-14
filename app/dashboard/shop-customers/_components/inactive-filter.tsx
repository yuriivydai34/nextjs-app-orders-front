'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { INACTIVE_RANGES, type InactiveRange } from './inactive-range';

// "Не купували": buyers whose newest completed order falls in a range of days
// ago (gaderia_mobile_admin_back, customers?inactiveDays=&inactiveMaxDays=).
// People who never completed an order are not in any range. Kept in the URL
// with search and sort; the CSV export follows it.
export default function InactiveFilter({ value }: { value?: InactiveRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function change(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set('inactive', next);
    else params.delete('inactive');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={value?.key ?? ''}
      onChange={(e) => change(e.target.value)}
      aria-label="Не купували"
      title="Скільки часу минуло з останньої виконаної покупки"
      className={`py-2 pl-3 pr-8 rounded-lg text-sm border bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 ${
        value ? 'border-orange-300 text-orange-700 dark:text-orange-300' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
      }`}
    >
      <option value="">Усі покупці</option>
      {INACTIVE_RANGES.map((r) => (
        <option key={r.key} value={r.key}>Не купували {r.label}</option>
      ))}
    </select>
  );
}
