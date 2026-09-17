'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CustomerActions from './_components/customer-actions';
import CustomerSearch from './_components/customer-search';
import ExportCustomersButton from './_components/export-customers-button';
import { apiFetch } from '../../lib/api';

type Customer = {
  id: string | number;
  full_name?: string | null;
  email?: string | null;
  number?: string | null;
  role?: string | null;
  name_company?: string | null;
  code_company?: string | number | null;
  type_account_subject?: string | null;
  name_bank?: string | null;
  number_bank?: string | null;
  region?: string | null;
  settlement?: string | null;
  address?: string | null;
  [key: string]: unknown;
};

type CustomersResponse = {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
};

const COLS = ['ID', 'Компанія', 'Користувач', 'Роль', 'Банк', 'Адреса', ''];

function CustomersContent() {
  useEffect(() => { document.title = 'Користувачі | Gaderia'; }, []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const search = searchParams.get('search') ?? '';

  const [result, setResult] = useState<CustomersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams({ page: String(page), limit: '10' });
    if (search) qs.set('search', search);
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts?${qs.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch customers');
        return res.json();
      })
      .then((data) => setResult(data))
      .catch(() => setError('Не вдалося завантажити клієнтів.'))
      .finally(() => setLoading(false));
  }, [page, search]);

  const customers = result?.data ?? [];
  const total = result?.total ?? 0;
  const limit = result?.limit ?? 10;
  const totalPages = Math.ceil(total / limit);

  // A page number left over from a wider result set (e.g. ?search=x&page=3
  // bookmarked or reached via the back button) would render an empty table
  // even though there are matches. Fall back to the first page.
  useEffect(() => {
    if (!result || total === 0 || page <= totalPages) return;
    const qs = new URLSearchParams({ page: '1' });
    if (search) qs.set('search', search);
    router.replace(`?${qs.toString()}`);
  }, [result, total, page, totalPages, search, router]);

  const pageHref = (p: number) => {
    const qs = new URLSearchParams({ page: String(p) });
    if (search) qs.set('search', search);
    return `?${qs.toString()}`;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Клієнти
        {total > 0 && <span className="ml-2 text-sm font-normal text-gray-400">{total}</span>}
      </h2>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <CustomerSearch />
        <ExportCustomersButton search={search} />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {search ? `За запитом «${search}» нічого не знайдено.` : 'Клієнтів не знайдено.'}
        </p>
      ) : (
        <>
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-x-auto">
            <table className="min-w-full w-full table-auto">
              <thead>
                <tr>
                  {COLS.map((col, i) => (
                    <th
                      key={i}
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
                {customers.map((c) => (
                  <tr key={c.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="py-3 px-3 align-middle text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {String(c.id)}
                    </td>
                    <td className="py-3 px-3 align-middle" style={{ maxWidth: 180 }}>
                      <div className="flex flex-col gap-1">
                        {c.name_company && (
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.name_company}</span>
                        )}
                        {c.code_company && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">ЄДРПОУ: {c.code_company}</span>
                        )}
                        {c.type_account_subject && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">{c.type_account_subject}</span>
                        )}
                        {!c.name_company && !c.code_company && (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 align-middle" style={{ maxWidth: 200 }}>
                      <div className="flex flex-col gap-1">
                        {c.full_name && (
                          <span className="text-sm text-gray-900 dark:text-gray-100">{c.full_name}</span>
                        )}
                        {c.email && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{c.email}</span>
                        )}
                        {c.number && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{c.number}</span>
                        )}
                        {!c.full_name && !c.email && !c.number && (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 align-middle text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap" style={{ maxWidth: 150 }}>
                      {c.role ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="py-3 px-3 align-middle" style={{ maxWidth: 200 }}>
                      <div className="flex flex-col gap-1">
                        {c.name_bank && (
                          <span className="text-sm text-gray-700 dark:text-gray-300">{c.name_bank}</span>
                        )}
                        {c.number_bank && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{c.number_bank}</span>
                        )}
                        {!c.name_bank && !c.number_bank && (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 align-middle text-xs text-gray-600 dark:text-gray-400" style={{ maxWidth: 200 }}>
                      {(() => {
                        const parts = [c.region, c.settlement, c.address].filter(Boolean);
                        return parts.length > 0
                          ? <span className="line-clamp-3">{parts.join(', ')}</span>
                          : <span className="text-gray-300 dark:text-gray-600">—</span>;
                      })()}
                    </td>
                    <td className="py-3 px-3 align-middle">
                      <CustomerActions customer={c} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} з {total}
            </p>
            <div className="flex items-center gap-1">
              <PaginationLink href={pageHref(page - 1)} disabled={page <= 1}>← Назад</PaginationLink>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === 'ellipsis' ? (
                    <span key={`e-${i}`} className="px-2 text-gray-400">…</span>
                  ) : (
                    <PaginationLink key={p} href={pageHref(p)} active={p === page}>{p}</PaginationLink>
                  )
                )}
              <PaginationLink href={pageHref(page + 1)} disabled={page >= totalPages}>Далі →</PaginationLink>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>}>
      <CustomersContent />
    </Suspense>
  );
}

function PaginationLink({
  href, children, active, disabled,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  const base = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
  if (disabled) return <span className={`${base} text-gray-300 dark:text-gray-600 cursor-not-allowed`}>{children}</span>;
  if (active) return <span className={`${base} bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900`}>{children}</span>;
  return <Link href={href} className={`${base} text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800`}>{children}</Link>;
}
