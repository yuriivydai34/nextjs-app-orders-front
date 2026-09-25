'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// Keys are what goes into the page URL; sortBy/sortOrder are what the API takes.
export const SORTS: Record<string, { label: string; sortBy: string; sortOrder: 'ASC' | 'DESC' }> = {
  completed:   { label: 'Найбільше виконаних', sortBy: 'completed',   sortOrder: 'DESC' },
  orders:      { label: 'Найбільше замовлень (усі)', sortBy: 'orders', sortOrder: 'DESC' },
  cancelled:   { label: 'Найбільше скасувань', sortBy: 'cancelled',   sortOrder: 'DESC' },
  spent:       { label: 'Найбільша сума',      sortBy: 'spent',       sortOrder: 'DESC' },
  last_order:  { label: 'Нещодавно замовляли', sortBy: 'last_order',  sortOrder: 'DESC' },
  first_order: { label: 'Найдавніші покупці',  sortBy: 'first_order', sortOrder: 'ASC' },
  id:          { label: 'За ID',               sortBy: 'id',          sortOrder: 'ASC' },
};

export const DEFAULT_SORT = 'id';

export default function CustomerSort({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function change(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === DEFAULT_SORT) params.delete('sort');
    else params.set('sort', next);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={value}
      onChange={(e) => change(e.target.value)}
      aria-label="Сортування покупців"
      className="py-2 pl-3 pr-8 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
    >
      {Object.entries(SORTS).map(([key, s]) => (
        <option key={key} value={key}>{s.label}</option>
      ))}
    </select>
  );
}
