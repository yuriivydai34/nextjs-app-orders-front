'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import Stars from '../_components/stars';

type Review = {
  id: number;
  payment_id: number;
  rating: number;
  review: string | null;
  suggestion: string | null;
  createdAt: string;
  order_id: string | null;
  full_name: string | null;
  number: string | null;
};

type ReviewsResponse = { data: Review[]; total: number; page: number; limit: number };

type Summary = { count: number; average: number | null; byRating: Record<string, number> };

const COLS = ['Дата', 'Замовлення', 'Клієнт', 'Оцінка', 'Відгук', 'Побажання'];
const LIMIT = 20;

// Ratings of completed orders, left by clients in the mobile app. Internal
// only: nothing here is published anywhere.
function ReviewsContent() {
  useEffect(() => { document.title = 'Відгуки | Gaderia'; }, []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const rating = Number(searchParams.get('rating')) || 0;

  const [summary, setSummary] = useState<Summary | null>(null);
  // Keyed by the query it answers: while the filter or page changes, the
  // previous answer no longer matches and the page shows "loading".
  const query = `${page}:${rating}`;
  const [loaded, setLoaded] = useState<{ query: string; result?: ReviewsResponse; error?: string } | null>(null);
  const loading = loaded?.query !== query;
  const result = loading ? null : loaded?.result ?? null;
  const error = loading ? null : loaded?.error ?? null;

  useEffect(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/summary`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSummary(data))
      .catch(() => setSummary(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const qs = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (rating) qs.set('rating', String(rating));
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews?${qs.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: ReviewsResponse) => { if (!cancelled) setLoaded({ query, result: data }); })
      .catch(() => { if (!cancelled) setLoaded({ query, error: 'Не вдалося завантажити відгуки.' }); });
    return () => { cancelled = true; };
  }, [page, rating, query]);

  const reviews = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const href = (p: number, r = rating) => {
    const qs = new URLSearchParams({ page: String(p) });
    if (r) qs.set('rating', String(r));
    return `?${qs.toString()}`;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Відгуки
        {summary && summary.count > 0 && <span className="ml-2 text-sm font-normal text-gray-400">{summary.count}</span>}
      </h2>

      {summary && summary.count > 0 && (
        <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
          <div>
            <p className="text-xs text-gray-400">Середня оцінка</p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{summary.average?.toFixed(1)}</p>
            <Stars rating={Math.round(summary.average ?? 0)} />
          </div>
          <div className="flex flex-col gap-1 min-w-48">
            {[5, 4, 3, 2, 1].map((s) => {
              const n = summary.byRating[String(s)] ?? 0;
              return (
                <div key={s} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3 text-right">{s}</span>
                  <span className="text-amber-400">★</span>
                  <div className="flex-1 h-2 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${(n / summary.count) * 100}%` }} />
                  </div>
                  <span className="w-8">{n}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Оцінка:</span>
        {[0, 5, 4, 3, 2, 1].map((r) => (
          <button
            key={r}
            onClick={() => router.push(href(1, r))}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              r === rating
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {r === 0 ? 'Усі' : `${r} ★`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {rating ? 'Відгуків з такою оцінкою немає.' : 'Відгуків ще немає.'}
        </p>
      ) : (
        <>
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-x-auto">
            <table className="min-w-full w-full table-auto">
              <thead>
                <tr>
                  {COLS.map((col, i) => (
                    <th
                      key={col}
                      className={`px-3 h-10 text-left align-middle bg-gray-100 dark:bg-gray-800 whitespace-nowrap text-xs font-semibold text-gray-500 dark:text-gray-400
                        ${i === 0 ? 'rounded-l-lg' : ''}
                        ${i === COLS.length - 1 ? 'rounded-r-lg' : ''}
                      `}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className={`align-top hover:bg-gray-50 dark:hover:bg-gray-800/40 ${r.rating <= 3 ? 'bg-red-50/60 dark:bg-red-950/20' : ''}`}>
                    <td className="py-3 px-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      № {r.payment_id}
                      <span className="block text-xs text-gray-400">у застосунку № {r.payment_id + 1000}</span>
                    </td>
                    <td className="py-3 px-3" style={{ maxWidth: 200 }}>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-900 dark:text-gray-100">{r.full_name ?? '—'}</span>
                        {r.number && (
                          <a href={`tel:${r.number}`} className="text-xs text-gray-500 dark:text-gray-400 hover:underline">{r.number}</a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3"><Stars rating={r.rating} /></td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line" style={{ maxWidth: 320 }}>
                      {r.review ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line" style={{ maxWidth: 320 }}>
                      {r.suggestion ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} з {total}
              </p>
              <div className="flex items-center gap-1">
                <PaginationLink href={href(page - 1)} disabled={page <= 1}>← Назад</PaginationLink>
                <span className="px-2 text-sm text-gray-500">{page} / {totalPages}</span>
                <PaginationLink href={href(page + 1)} disabled={page >= totalPages}>Далі →</PaginationLink>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>}>
      <ReviewsContent />
    </Suspense>
  );
}

function PaginationLink({ href, children, disabled }: { href: string; children: React.ReactNode; disabled?: boolean }) {
  const base = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
  if (disabled) return <span className={`${base} text-gray-300 dark:text-gray-600 cursor-not-allowed`}>{children}</span>;
  return <Link href={href} className={`${base} text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800`}>{children}</Link>;
}
