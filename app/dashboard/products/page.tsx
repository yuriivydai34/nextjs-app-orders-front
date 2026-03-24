import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
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
  measurement: number;
  type_measurement: string | null;
  article: string | null;
  picture: string | null;
  description?: string | null;
  type_juice?: string | null;
  type_apple?: string | null;
  type_vinegar?: string | null;
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

async function getProducts(token: string, page: number): Promise<ProductsResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog?page=${page}&limit=20`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export default async function ProductsPage(props: PageProps<'/dashboard/products'>) {
  const { page: pageParam } = await props.searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? '';

  let result: ProductsResponse | null = null;
  let error: string | null = null;

  try {
    result = await getProducts(token, page);
  } catch {
    error = 'Could not load products.';
  }

  const products = result?.data ?? [];
  const total = result?.total ?? 0;
  const limit = result?.limit ?? 20;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Products
          {total > 0 && <span className="ml-2 text-sm font-normal text-gray-400">{total}</span>}
        </h2>
        <AddProductModal />
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No products found.</p>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-12"></th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Article</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Volume</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Packaging</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2">
                      {p.picture ? (
                        <Image
                          src={p.picture}
                          alt={p.header}
                          width={36}
                          height={36}
                          className="rounded object-contain bg-gray-50 dark:bg-gray-800"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded bg-gray-100 dark:bg-gray-800" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 max-w-xs">
                      <p className="truncate">{p.header}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {p.article ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {p.is_discount && p.price_discount > 0 ? (
                        <span className="flex flex-col">
                          <span>{p.price_discount} ₴</span>
                          <span className="line-through text-xs text-gray-400">{p.price} ₴</span>
                        </span>
                      ) : (
                        `${p.price} ₴`
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {p.measurement} {p.type_measurement?.toLowerCase() ?? ''}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {p.type_product ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {p.type_packaging ?? '—'}
                    </td>
                    <td className="px-4 py-3">
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
                {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <PaginationLink href={`?page=${page - 1}`} disabled={page <= 1}>← Prev</PaginationLink>
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
                <PaginationLink href={`?page=${page + 1}`} disabled={page >= totalPages}>Next →</PaginationLink>
              </div>
            </div>
          )}
        </>
      )}
    </div>
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
