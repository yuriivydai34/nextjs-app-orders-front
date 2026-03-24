import { cookies } from 'next/headers';
import Link from 'next/link';
import EditOrderModal from './_components/edit-order-modal';
import OrderProductsModal from './_components/order-products-modal';
import SortableHeader from './_components/sortable-header';

type Payment = {
  id: number;
  order_id: string;
  currency: string;
  amount: number;
  status: string;
  ttn: string | null;
  createdAt: number;
  updatedAt: string;
  cashier_check: { id?: string; message?: string } | null;
  catalog_list_id: {
    id: number;
    count: number;
    model_catalog: {
      id: number;
      header: string;
      price: number;
      price_discount: number;
      is_discount: boolean;
      measurement: number;
      type_measurement: string | null;
      type_packaging: string | null;
      picture: string | null;
    };
  }[];
};

type PaymentsResponse = {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
};

async function getPayments(
  token: string,
  page: number,
  sortBy: string,
  sortOrder: string,
): Promise<PaymentsResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/payments?page=${page}&limit=20&sortBy=${sortBy}&sortOrder=${sortOrder}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
  );

  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}

const statusStyles: Record<string, string> = {
  PAID:       'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELED:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  PENDING:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

function StatusBadge({ status }: { status: string }) {
  const cls = statusStyles[status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default async function OrdersPage(props: PageProps<'/dashboard/orders'>) {
  const { page: pageParam, sortBy, sortOrder } = await props.searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const sort = typeof sortBy === 'string' ? sortBy : 'createdAt';
  const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? '';

  let result: PaymentsResponse | null = null;
  let error: string | null = null;

  try {
    result = await getPayments(token, page, sort, order);
  } catch {
    error = 'Could not load orders.';
  }

  const payments = result?.data ?? [];
  const total = result?.total ?? 0;
  const limit = result?.limit ?? 20;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Замовлення</h2>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : payments.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Замовлень не знайдено.</p>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-4 py-3"><SortableHeader column="id" label="ID" /></th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">№ замовлення</th>
                  <th className="text-left px-4 py-3"><SortableHeader column="amount" label="Сума" /></th>
                  <th className="text-left px-4 py-3"><SortableHeader column="status" label="Статус" /></th>
                  <th className="text-left px-4 py-3"><SortableHeader column="createdAt" label="Створено" /></th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Чек</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Товари</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{p.order_id}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                      {p.amount.toLocaleString()} {p.currency}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(p.createdAt * 1000).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {p.cashier_check?.id ? (
                        <a
                          href={`https://check.checkbox.ua/${p.cashier_check.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                        >
                          Переглянути
                        </a>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.catalog_list_id?.length > 0 && (
                        <OrderProductsModal orderId={p.id} items={p.catalog_list_id} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <EditOrderModal id={p.id} ttn={p.ttn ?? ''} status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <PaginationLink href={`?page=${page - 1}&sortBy=${sort}&sortOrder=${order}`} disabled={page <= 1}>← Назад</PaginationLink>
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
                    <PaginationLink key={p} href={`?page=${p}&sortBy=${sort}&sortOrder=${order}`} active={p === page}>{p}</PaginationLink>
                  )
                )}
              <PaginationLink href={`?page=${page + 1}&sortBy=${sort}&sortOrder=${order}`} disabled={page >= totalPages}>Далі →</PaginationLink>
            </div>
          </div>
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
