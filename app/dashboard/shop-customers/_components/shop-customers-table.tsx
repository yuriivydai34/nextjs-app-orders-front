'use client';

import { useState } from 'react';
import { orderStats, STATUS_LABELS } from './order-stats';

export type Seen = { value: string; firstSeen: string | null; lastSeen: string | null };

export type ShopCustomer = {
  id: number;
  full_name?: string | null;
  email?: string | null;
  number?: string | null;
  region?: string | null;
  settlement?: string | null;
  address?: string | null;
  first_order_at?: string | null;
  last_order_at?: string | null;
  source_data?: {
    emails?: Seen[];
    phones?: Seen[];
    names?: string[];
    patronymics?: string[];
    addresses?: string[];
    notes?: string[];
    orders?: { id: number; number: string | null; date: string | null; status: string | null; total: string | null; ttn: string | null }[];
    ordersCount?: number;
    totalSpent?: number;
  } | null;
};

const COLS = ['ID', 'Людина', 'Контакти', 'Адреса', 'Замовлення', 'Період', ''];

function shortDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value.endsWith('Z') ? value : `${value}Z`).toLocaleDateString('uk-UA');
}

export default function ShopCustomersTable({ rows }: { rows: ShopCustomer[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-x-auto">
      <table className="min-w-full w-full table-auto">
        <thead>
          <tr>
            {COLS.map((col, i) => (
              <th
                key={i}
                className={`px-3 h-10 text-left align-middle bg-gray-100 dark:bg-gray-800 whitespace-nowrap text-xs font-semibold text-gray-500 dark:text-gray-400
                  ${i === 0 ? 'rounded-l-lg' : ''}
                  ${i === COLS.length - 1 ? 'rounded-r-lg' : ''}`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const d = c.source_data ?? {};
            const extraEmails = Math.max((d.emails?.length ?? 0) - 1, 0);
            const extraPhones = Math.max((d.phones?.length ?? 0) - 1, 0);
            const stats = orderStats(d.orders);
            return (
              <tr key={c.id} className="align-top border-b border-gray-100 dark:border-gray-800 last:border-0">
                <td className="py-3 px-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{c.id}</td>

                <td className="py-3 px-3" style={{ maxWidth: 200 }}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {c.full_name ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </span>
                    {(d.patronymics?.length ?? 0) > 0 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">{d.patronymics!.join(', ')}</span>
                    )}
                    {(d.names?.length ?? 0) > 1 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">ще {d.names!.length - 1} написань</span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-3" style={{ maxWidth: 220 }}>
                  <div className="flex flex-col gap-0.5">
                    {c.email
                      ? <span className="text-xs text-gray-600 dark:text-gray-400 break-all">{c.email}</span>
                      : <span className="text-xs text-gray-300 dark:text-gray-600">без email</span>}
                    {extraEmails > 0 && <span className="text-xs text-gray-400">+{extraEmails} email</span>}
                    {c.number && <span className="text-xs text-gray-600 dark:text-gray-400">{c.number}</span>}
                    {extraPhones > 0 && <span className="text-xs text-gray-400">+{extraPhones} тел.</span>}
                  </div>
                </td>

                <td className="py-3 px-3 text-xs text-gray-600 dark:text-gray-400" style={{ maxWidth: 220 }}>
                  {[c.settlement, c.region].filter(Boolean).join(', ') || <span className="text-gray-300 dark:text-gray-600">—</span>}
                  {(d.addresses?.length ?? 0) > 1 && (
                    <div className="text-gray-400">ще {d.addresses!.length - 1} адрес</div>
                  )}
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-gray-900 dark:text-gray-100">{stats.total} усього</span>
                    <span className="text-xs text-green-600 dark:text-green-400">✓ {stats.completed} виконано</span>
                    {stats.cancelled > 0 && (
                      <span className="text-xs text-red-500 dark:text-red-400">✕ {stats.cancelled} скасовано</span>
                    )}
                    {stats.inProgress > 0 && (
                      <span className="text-xs text-gray-400">{stats.inProgress} в роботі</span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400" title="Сума виконаних замовлень">
                      {stats.completedSum.toLocaleString('uk-UA')} ₴
                    </span>
                  </div>
                </td>

                <td className="py-3 px-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {shortDate(c.first_order_at)} – {shortDate(c.last_order_at)}
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <button
                    onClick={() => setOpen(open === c.id ? null : c.id)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    {open === c.id ? 'Згорнути' : 'Деталі'}
                  </button>
                </td>
              </tr>
            );
          })}

          {rows.map((c) => open === c.id && (
            <tr key={`d-${c.id}`}>
              <td colSpan={COLS.length} className="px-3 pb-4">
                <Details customer={c} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Details({ customer }: { customer: ShopCustomer }) {
  const d = customer.source_data ?? {};
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-xs text-gray-600 dark:text-gray-400 space-y-3">
      {(d.emails?.length ?? 0) > 0 && (
        <Block title="Email">
          {d.emails!.map((e) => (
            <li key={e.value}>
              <span className="text-gray-900 dark:text-gray-100">{e.value}</span>
              {' · '}від {shortDate(e.firstSeen)} до {shortDate(e.lastSeen)}
            </li>
          ))}
        </Block>
      )}

      {(d.phones?.length ?? 0) > 0 && (
        <Block title="Телефони">
          {d.phones!.map((p) => (
            <li key={p.value}>
              <span className="text-gray-900 dark:text-gray-100">{p.value}</span>
              {' · '}від {shortDate(p.firstSeen)} до {shortDate(p.lastSeen)}
            </li>
          ))}
        </Block>
      )}

      {(d.addresses?.length ?? 0) > 0 && (
        <Block title="Адреси">{d.addresses!.map((a) => <li key={a}>{a}</li>)}</Block>
      )}

      {(d.notes?.length ?? 0) > 0 && (
        <Block title="Коментарі">{d.notes!.map((n) => <li key={n}>{n}</li>)}</Block>
      )}

      {(d.orders?.length ?? 0) > 0 && (
        <Block title={`Замовлення (${d.orders!.length})`}>
          {[...d.orders!].reverse().slice(0, 30).map((o) => (
            <li key={o.id}>
              №{o.number ?? o.id} · {shortDate(o.date)} · {STATUS_LABELS[o.status ?? ''] ?? o.status} · {o.total} ₴
              {o.ttn && <> · ТТН {o.ttn}</>}
            </li>
          ))}
        </Block>
      )}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}
