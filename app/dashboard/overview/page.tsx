'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';

// Real numbers only (gaderia_mobile_admin_back /overview): orders, revenue,
// customers and cancellations come straight from `payment`/`account`; top
// products are summed from each paid order's own item list. There is no
// "vs минулий місяць" any more — nothing keeps last month's numbers to
// compare against, so the page does not make one up, unlike the mock it
// replaced.
type RecentOrder = {
  id: number; order_id: string | null; full_name: string | null;
  amount: number | null; status: string | null; updatedAt: string;
};
type TopProduct = { name: string; orders: number; revenue: number };
type Overview = {
  totalOrders: number; cancelledOrders: number; revenue: number; customers: number;
  recentOrders: RecentOrder[]; topProducts: TopProduct[];
};

const STATUS_LABEL: Record<string, string> = {
  WAITING: 'Очікування', WORK: 'Оплачено', CANCELED: 'Скасовано', COMPLETED: 'Виконано',
};
const STATUS_STYLES: Record<string, string> = {
  WORK: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  WAITING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const money = (n: number) => `${n.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴`;

export default function OverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = 'Огляд | Gaderia';
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/overview`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Огляд</h2>

      {error && <p className="text-sm text-red-500">Не вдалося завантажити дані</p>}
      {!data && !error && <p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Всього замовлень" value={String(data.totalOrders)} />
            <StatCard label="Виручка (оплачені)" value={money(data.revenue)} />
            <StatCard label="Клієнти" value={String(data.customers)} />
            <StatCard label="Скасовано" value={String(data.cancelledOrders)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Останні замовлення</h3>
              </div>
              {data.recentOrders.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">Замовлень ще немає</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400">Клієнт</th>
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400">Сума</th>
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((o) => (
                      <tr key={o.id} className="border-b last:border-0 border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="px-5 py-3 text-gray-900 dark:text-gray-100">
                          <Link href="/dashboard/orders" className="hover:underline">
                            {o.full_name ?? o.order_id ?? `#${o.id}`}
                          </Link>
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">{o.amount != null ? money(o.amount) : '—'}</td>
                        <td className="px-5 py-3">
                          <StatusBadge status={o.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Топ товарів</h3>
              </div>
              {data.topProducts.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">Поки немає оплачених замовлень</p>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {data.topProducts.map((p, i) => (
                    <div key={p.name} className="px-5 py-3 flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.orders} замовлень</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 shrink-0">{money(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-5 py-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-gray-400">—</span>;
  const cls = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>{STATUS_LABEL[status] ?? status}</span>;
}
