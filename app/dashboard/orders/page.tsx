import { cookies } from 'next/headers';
import Link from 'next/link';
import EditOrderModal from './_components/edit-order-modal';
import OrderProductsModal from './_components/order-products-modal';
import SortableHeader from './_components/sortable-header';
import StatusFilter from './_components/status-filter';

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
  full_name?: string | null;
  email?: string | null;
  number?: string | null;
  comment?: string | null;
  payment_method?: string | null;
  url_payment?: string | null;
  type_delivery?: string | null;
  delivery_description?: Record<string, unknown> | null;
  delivery_address?: string | null;
  delivery_payment?: number | null;
  is_delivery_payment?: boolean;
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
      type_juice: string | null;
      picture: string | null;
      shipment_weight: number | null;
      shipment_length: number | null;
      shipment_width: number | null;
      shipment_height: number | null;
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
  status: string,
): Promise<PaymentsResponse> {
  const qs = new URLSearchParams({ page: String(page), limit: '20', sortBy, sortOrder });
  if (status) qs.set('status', status);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/payments?${qs.toString()}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
  );

  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}

const statusLabels: Record<string, string> = {
  WAITING:   'Очікування',
  WORK:      'Оплачено',
  CANCELED:  'Скасовано',
  COMPLETED: 'Виконано',
};

const statusStyles: Record<string, string> = {
  WAITING:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  WORK:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELED:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const DELIVERY_LABELS: Record<string, string> = {
  MAIL:    'Нова Пошта',
  UKRMAIL: 'Укрпошта',
};

function getDeliveryAddress(type: string | null | undefined, desc: Record<string, unknown> | null | undefined): string | null {
  if (!desc) return null;
  if (type === 'MAIL') return (desc.ShortAddress as string) ?? null;
  if (type === 'UKRMAIL') {
    const city = desc.CITY_UA as string;
    const addr = desc.ADDRESS as string;
    return [city, addr].filter(Boolean).join(', ') || null;
  }
  return null;
}

function DeliveryCell({ type, desc }: { type?: string | null; desc?: Record<string, unknown> | null }) {
  const label = type ? (DELIVERY_LABELS[type] ?? type) : null;
  const address = getDeliveryAddress(type, desc);
  if (!label && !address) return <span className="text-gray-300 dark:text-gray-600">—</span>;
  return (
    <div className="flex flex-col gap-0.5" style={{ maxWidth: 180, minWidth: 150 }}>
      {label && <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>}
      {address && <span className="text-xs text-gray-500 dark:text-gray-400">{address}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = statusStyles[status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}

export default async function OrdersPage(props: PageProps<'/dashboard/orders'>) {
  const { page: pageParam, sortBy, sortOrder, status: statusParam } = await props.searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const sort = typeof sortBy === 'string' ? sortBy : 'createdAt';
  const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
  const status = typeof statusParam === 'string' ? statusParam : '';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? '';

  let result: PaymentsResponse | null = null;
  let error: string | null = null;

  try {
    result = await getPayments(token, page, sort, order, status);
  } catch {
    error = 'Could not load orders.';
  }

  const payments = result?.data ?? [];
  const total = result?.total ?? 0;
  const limit = result?.limit ?? 20;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Замовлення</h2>
      </div>
      <div className="mb-6">
        <StatusFilter />
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : payments.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Замовлень не знайдено.</p>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Користувач</th>
                  <th className="text-left px-4 py-3"><SortableHeader column="status" label="Статус" /></th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Товари</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Доставка</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">ТТН</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Метод оплати</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Вартість доставки</th>
                  <th className="text-left px-4 py-3"><SortableHeader column="amount" label="Вартість" /></th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">ID замовлення</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {p.full_name && <span className="text-sm text-gray-900 dark:text-gray-100">{p.full_name}</span>}
                        {p.email && <span className="text-xs text-gray-500 dark:text-gray-400">{p.email}</span>}
                        {p.number && <span className="text-xs text-gray-500 dark:text-gray-400">{p.number}</span>}
                        {!p.full_name && !p.email && !p.number && <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      {p.catalog_list_id?.length > 0 && (
                        <OrderProductsModal orderId={p.id} items={p.catalog_list_id} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <DeliveryCell type={p.type_delivery} desc={p.delivery_description} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300" style={{ maxWidth: 150, minWidth: 150 }}>
                      {p.ttn ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300" style={{ maxWidth: 150, minWidth: 150 }}>
                      {p.payment_method ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300" style={{ maxWidth: 100, minWidth: 100 }}>
                      {p.delivery_payment != null ? `${p.delivery_payment} грн` : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium" style={{ maxWidth: 100, minWidth: 100 }}>
                      {p.amount.toLocaleString()} {p.currency}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300" style={{ maxWidth: 300, minWidth: 300 }}>
                      {p.order_id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <EditOrderModal id={p.id} ttn={p.ttn ?? ''} status={p.status} />
                      </div>
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
              <PaginationLink href={`?page=${page - 1}&sortBy=${sort}&sortOrder=${order}${status ? `&status=${status}` : ''}`} disabled={page <= 1}>← Назад</PaginationLink>
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
                    <PaginationLink key={p} href={`?page=${p}&sortBy=${sort}&sortOrder=${order}${status ? `&status=${status}` : ''}`} active={p === page}>{p}</PaginationLink>
                  )
                )}
              <PaginationLink href={`?page=${page + 1}&sortBy=${sort}&sortOrder=${order}${status ? `&status=${status}` : ''}`} disabled={page >= totalPages}>Далі →</PaginationLink>
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
