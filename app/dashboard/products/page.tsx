'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductActions from './_components/product-actions';
import AddProductModal from './_components/add-product-modal';

type Product = {
  id: number;
  header: string;
  price: number;
  price_discount: number;
  is_discount: boolean;
  type_product: string | null;
  type_packaging: string | null;
  type_juice: string | null;
  measurement: number;
  type_measurement: string | null;
  article: string | null;
  picture: string | null;
  description?: string | null;
  shipment_weight?: number | null;
  shipment_length?: number | null;
  shipment_width?: number | null;
  shipment_height?: number | null;
};

type ProductsResponse = {
  data: Product[];
  total: number;
  page: number;
  limit: number;
};

const JUICE_LABELS: Record<string, string> = {
  APPLE:          'Яблучний сік',
  APPLEGRAPE:     'Виноградно-яблучний сік',
  CARROTAPPLE:    'Морквяно-яблучний сік',
  PEARAPPLE:      'Грушево-яблучний сік',
  STRAWBERRYAPPLE:'Полунично-яблучний сік',
};

const COLS = ['Картинка', 'Назва', 'Довжина', 'Ширина', 'Висота', 'Вага', 'Ціна', 'Тип соку', ''];

function ProductsContent() {
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [result, setResult] = useState<ProductsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token') ?? '';
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog?page=${page}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then((data) => setResult(data))
      .catch(() => setError('Не вдалося завантажити товари.'))
      .finally(() => setLoading(false));
  }, [page]);

  const products = result?.data ?? [];
  const total = result?.total ?? 0;
  const limit = result?.limit ?? 20;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Товари
          {total > 0 && <span className="ml-2 text-sm font-normal text-gray-400">{total}</span>}
        </h2>
        <AddProductModal />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Товарів не знайдено.</p>
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
                {products.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="py-2 px-3 align-middle">
                      <div style={{ maxWidth: 120, minWidth: 120 }}>
                        {p.picture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.picture}
                            alt={p.header}
                            width={120}
                            height={120}
                            style={{ objectFit: 'contain', width: 120, height: 120 }}
                            className="rounded-xl bg-gray-50 dark:bg-gray-800"
                          />
                        ) : (
                          <div className="w-[120px] h-[120px] rounded-xl bg-gray-100 dark:bg-gray-800" />
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 align-middle text-sm text-gray-900 dark:text-gray-100">
                      <div className="line-clamp-1 max-w-[200px]">{p.header}</div>
                    </td>
                    <td className="py-2 px-3 align-middle text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {p.shipment_length ?? '—'} см
                    </td>
                    <td className="py-2 px-3 align-middle text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {p.shipment_width ?? '—'} см
                    </td>
                    <td className="py-2 px-3 align-middle text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {p.shipment_height ?? '—'} см
                    </td>
                    <td className="py-2 px-3 align-middle text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {p.shipment_weight ?? '—'} кг
                    </td>
                    <td className="py-2 px-3 align-middle text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {p.is_discount && p.price_discount > 0 ? (
                        <span className="flex flex-col">
                          <span>{p.price_discount}</span>
                          <span className="line-through text-xs text-gray-400">{p.price}</span>
                        </span>
                      ) : p.price}
                    </td>
                    <td className="py-2 px-3 align-middle text-sm text-gray-700 dark:text-gray-300">
                      {p.type_juice ? (JUICE_LABELS[p.type_juice] ?? p.type_juice) : '—'}
                    </td>
                    <td className="py-2 px-3 align-middle">
                      <ProductActions product={p} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(page - 1) * limit + 1}–{Math.min(page * limit, total)} з {total}
              </p>
              <div className="flex items-center gap-1">
                <PaginationLink href={`?page=${page - 1}`} disabled={page <= 1}>← Назад</PaginationLink>
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
                      <PaginationLink key={p} href={`?page=${p}`} active={p === page}>{p}</PaginationLink>
                    )
                  )}
                <PaginationLink href={`?page=${page + 1}`} disabled={page >= totalPages}>Далі →</PaginationLink>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>}>
      <ProductsContent />
    </Suspense>
  );
}

function PaginationLink({ href, children, active, disabled }: { href: string; children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  const base = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
  if (disabled) return <span className={`${base} text-gray-300 dark:text-gray-600 cursor-not-allowed`}>{children}</span>;
  if (active) return <span className={`${base} bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900`}>{children}</span>;
  return <Link href={href} className={`${base} text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800`}>{children}</Link>;
}
