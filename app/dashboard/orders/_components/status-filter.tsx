'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const STATUSES = ['WAITING', 'WORK', 'CANCELED', 'COMPLETED'] as const;

const statusLabels: Record<string, string> = {
  WAITING:   'Очікує',
  WORK:      'В роботі',
  CANCELED:  'Скасовано',
  COMPLETED: 'Виконано',
};

const activeStyles: Record<string, string> = {
  WAITING:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  WORK:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELED:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function StatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get('status') ?? '';

  function select(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status === current) {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STATUSES.map((s) => {
        const isActive = current === s;
        return (
          <button
            key={s}
            onClick={() => select(s)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              isActive
                ? activeStyles[s]
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {statusLabels[s]}
          </button>
        );
      })}
    </div>
  );
}
