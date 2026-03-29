import { cookies } from 'next/headers';
import { Suspense } from 'react';
import ExportButton from '../orders/_components/export-button';
import ReportDatePicker from './_components/report-date-picker';

type Payment = {
  id: number;
  order_id: string;
  currency: string;
  amount: number;
  status: string;
  ttn: string | null;
  createdAt: number;
  full_name?: string | null;
  email?: string | null;
  number?: string | null;
  payment_method?: string | null;
  type_delivery?: string | null;
  delivery_description?: Record<string, unknown> | null;
  delivery_payment?: number | null;
  catalog_list_id: { id: number; count: number; model_catalog: { header: string } }[];
};

type PaymentsResponse = {
  data: Payment[];
  total: number;
};

const STATUS_LABELS: Record<string, string> = {
  WAITING:   'Очікування',
  WORK:      'Оплачено',
  CANCELED:  'Скасовано',
  COMPLETED: 'Виконано',
};

const STATUS_STYLES: Record<string, string> = {
  WAITING:   'bg-yellow-100 text-yellow-700',
  WORK:      'bg-blue-100 text-blue-700',
  CANCELED:  'bg-red-100 text-red-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

const DELIVERY_LABELS: Record<string, string> = {
  MAIL:    'Нова Пошта',
  UKRMAIL: 'Укрпошта',
};

async function getPaymentsByDate(token: string, date: string): Promise<PaymentsResponse> {
  const qs = new URLSearchParams({ page: '1', limit: '100', sortBy: 'createdAt', sortOrder: 'DESC', date });
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function ReportPage(props: PageProps<'/dashboard/report'>) {
  const { date: dateParam } = await props.searchParams;
  const date = typeof dateParam === 'string' ? dateParam : '';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? '';

  let payments: Payment[] = [];
  let total = 0;
  let fetchError: string | null = null;

  if (date) {
    try {
      const result = await getPaymentsByDate(token, date);
      const all = result.data ?? [];
      payments = all.filter((p) => {
        // createdAt may be seconds or milliseconds
        const ts = p.createdAt < 1e10 ? p.createdAt * 1000 : p.createdAt;
        const d = new Date(ts);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}` === date;
      });
      total = payments.length;
    } catch {
      fetchError = 'Не вдалося завантажити дані.';
    }
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Звіти</h2>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Оберіть дату звіту</p>
        <Suspense>
          <ReportDatePicker value={date} />
        </Suspense>
      </div>

      {!date && (
        <p className="text-sm text-gray-400 dark:text-gray-500">Оберіть дату, щоб переглянути дані звіту.</p>
      )}

      {date && fetchError && (
        <p className="text-sm text-red-600 dark:text-red-400">{fetchError}</p>
      )}

      {date && !fetchError && (
        <>
          {/* Summary */}
          <div className="flex gap-4 mb-5">
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-5 py-4">
              <p className="text-xs text-gray-400 mb-1">Замовлень</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{total}</p>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-5 py-4">
              <p className="text-xs text-gray-400 mb-1">Загальна сума</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {totalAmount.toLocaleString()} {payments[0]?.currency ?? 'UAH'}
              </p>
            </div>
          </div>

          {payments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Замовлень за цю дату не знайдено.</p>
          ) : (
            <>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto mb-5">
                <table className="min-w-full table-auto text-sm">
                  <thead>
                    <tr>
                      {['Клієнт', 'Статус', 'Товари', 'Доставка', 'ТТН', 'Метод оплати', 'Сума'].map((col, i) => (
                        <th
                          key={i}
                          className={`px-3 h-10 text-left align-middle bg-gray-100 dark:bg-gray-800 whitespace-nowrap text-xs font-semibold text-gray-500 dark:text-gray-400
                            ${i === 0 ? 'rounded-l-lg' : ''}
                            ${i === 6 ? 'rounded-r-lg' : ''}
                          `}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="px-3 py-3 align-middle">
                          <div className="flex flex-col gap-0.5">
                            {p.full_name && <span className="text-sm text-gray-900 dark:text-gray-100">{p.full_name}</span>}
                            {p.email    && <span className="text-xs text-gray-500 dark:text-gray-400">{p.email}</span>}
                            {p.number   && <span className="text-xs text-gray-500 dark:text-gray-400">{p.number}</span>}
                            {!p.full_name && !p.email && !p.number && <span className="text-gray-300">—</span>}
                          </div>
                        </td>
                        <td className="px-3 py-3 align-middle whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LABELS[p.status] ?? p.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-middle text-xs text-gray-600 dark:text-gray-400">
                          {p.catalog_list_id?.map((item) => (
                            <div key={item.id}>{item.model_catalog.header} × {item.count}</div>
                          ))}
                        </td>
                        <td className="px-3 py-3 align-middle text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {p.type_delivery ? (DELIVERY_LABELS[p.type_delivery] ?? p.type_delivery) : <span className="text-gray-300">—</span>}
                          {p.delivery_payment != null && (
                            <div className="text-gray-400">{p.delivery_payment} грн</div>
                          )}
                        </td>
                        <td className="px-3 py-3 align-middle text-xs text-gray-600 dark:text-gray-400 font-mono">
                          {p.ttn ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-3 py-3 align-middle text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {p.payment_method ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-3 py-3 align-middle text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {p.amount.toLocaleString()} {p.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <ExportButton token={token} initialDate={date} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
