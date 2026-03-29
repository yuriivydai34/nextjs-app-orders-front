'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const STATUSES = ['WAITING', 'WORK', 'CANCELED', 'COMPLETED'] as const;

const statusLabels: Record<string, string> = {
  WAITING:   'Очікує',
  WORK:      'В роботі',
  CANCELED:  'Скасовано',
  COMPLETED: 'Виконано',
};

export default function StatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('status') ?? '';

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function select(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status === current || status === '') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  const label = current ? statusLabels[current] ?? current : 'Всі';

  return (
    <div ref={ref} className="relative" style={{ width: 300, marginLeft: 'auto' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative px-3 w-full inline-flex bg-default-100 hover:bg-default-200 rounded-medium flex-col items-start justify-center gap-0 outline-none h-14 py-2 transition-colors"
      >
        <div className="inline-flex h-full w-[calc(100%_-_1.5rem)] items-center gap-1.5">
          <span className={`w-full text-left text-sm truncate ${current ? 'text-foreground' : 'text-foreground-500'}`}>
            {label}
          </span>
        </div>
        <svg
          aria-hidden="true"
          fill="none"
          height="1em"
          role="presentation"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          width="1em"
          className={`absolute right-3 w-4 h-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg py-1 overflow-hidden">
          <li>
            <button
              type="button"
              onClick={() => select('')}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${!current ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Всі
            </button>
          </li>
          {STATUSES.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => select(s)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${current === s ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}
              >
                {statusLabels[s]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
