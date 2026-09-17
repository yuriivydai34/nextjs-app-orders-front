'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import CustomerSearch from './_components/customer-search';
import ExportShopCustomersButton from './_components/export-shop-customers-button';
import WooSyncButton, { SHOP_CUSTOMERS_REFRESH_EVENT } from './_components/woo-sync-button';
import ShopCustomersTable, { ShopCustomer } from './_components/shop-customers-table';

type Response = {
  data: ShopCustomer[];
  total: number;
  page: number;
  limit: number;
};

function ShopCustomersContent() {
  useEffect(() => { document.title = 'Покупці з сайту | Gaderia'; }, []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const search = searchParams.get('search') ?? '';

  const [result, setResult] = useState<Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const refetch = () => setReloadKey((k) => k + 1);
    window.addEventListener(SHOP_CUSTOMERS_REFRESH_EVENT, refetch);
    return () => window.removeEventListener(SHOP_CUSTOMERS_REFRESH_EVENT, refetch);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams({ page: String(page), limit: '10' });
    if (search) qs.set('search', search);
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/customers?${qs.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch customers');
        return res.json();
      })
      .then((data) => setResult(data))
      .catch(() => setError('Не вдалося завантажити покупців.'))
      .finally(() => setLoading(false));
  }, [page, search, reloadKey]);

  const customers = result?.data ?? [];
  const total = result?.total ?? 0;
  const limit = result?.limit ?? 10;
  const totalPages = Math.ceil(total / limit);

  // A page number left over from a wider result set would show an empty table
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
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
        Покупці з сайту
        {total > 0 && <span className="ml-2 text-sm font-normal text-gray-400">{total}</span>}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Люди із замовлень на сайті. Це довідник контактів — вони не мають входу в застосунок.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <CustomerSearch />
        <div className="flex flex-wrap items-center gap-2">
          <WooSyncButton />
          <ExportShopCustomersButton search={search} />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {search
            ? `За запитом «${search}» нічого не знайдено.`
            : 'Покупців ще не імпортовано — натисніть «Синхронізувати сайт».'}
        </p>
      ) : (
        <>
          <ShopCustomersTable rows={customers} />

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

export default function ShopCustomersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>}>
      <ShopCustomersContent />
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
