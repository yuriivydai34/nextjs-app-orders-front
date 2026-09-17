'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CustomerSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('search') ?? '';

  const [value, setValue] = useState(current);

  // Keep the field in sync when the query string changes elsewhere (back/forward).
  useEffect(() => { setValue(current); }, [current]);

  useEffect(() => {
    if (value === current) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('search', value.trim());
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    }, 350);
    return () => clearTimeout(timer);
  }, [value, current, pathname, router, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
        ⌕
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Пошук за іменем, email, телефоном, компанією…"
        aria-label="Пошук клієнтів"
        className="w-full pl-8 pr-8 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Очистити пошук"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
