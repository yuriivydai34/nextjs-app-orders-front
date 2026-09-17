'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const SOURCES = [
  { value: '',            label: 'Усі' },
  { value: 'gaderia',     label: 'Свої' },
  { value: 'woocommerce', label: 'Сайт' },
];

export default function SourceFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('source') ?? '';

  function select(source: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (source) params.set('source', source);
    else params.delete('source');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {SOURCES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => select(value)}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            current === value
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
