'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';

// Bonuses, read-only (gaderia_mobile_admin_back /bonuses). app-server accrues
// 1 bonus per 1 UAH of an order paid online (the order's whole amount, the
// promo discount already off, delivery included when paid with it). Spending
// and manual corrections are not decided yet. One person's history is ?account=.

type Summary = { accounts: number; accrued: number; balance: number; lastAt: string | null };
type Row = {
  account_id: number; full_name: string | null; email: string | null; number: string | null;
  balance: number; accrued: number; orders: number; last_at: string | null;
};
type Entry = {
  id: number; amount: number; type: string; createdAt: string;
  payment_id: number | null; order_amount: number | null; order_status: string | null;
};

const SORTS: Record<string, { label: string; sortBy: string; sortOrder: 'ASC' | 'DESC' }> = {
  balance: { label: 'Найбільший баланс', sortBy: 'balance', sortOrder: 'DESC' },
  last: { label: 'Нещодавні нарахування', sortBy: 'last', sortOrder: 'DESC' },
  accrued: { label: 'Найбільше нараховано', sortBy: 'accrued', sortOrder: 'DESC' },
};

const ORDER_STATUS: Record<string, string> = { WAITING: 'очікування', WORK: 'оплачено', CANCELED: 'скасовано', COMPLETED: 'виконано' };
const LIMIT = 20;

const num = (n: number) => n.toLocaleString('uk-UA');
const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function useJson<T>(url: string | null) {
  const [state, setState] = useState<{ url: string; data?: T; error?: boolean } | null>(null);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    apiFetch(url)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: T) => { if (!cancelled) setState({ url, data }); })
      .catch(() => { if (!cancelled) setState({ url, error: true }); });
    return () => { cancelled = true; };
  }, [url]);
  const loading = !!url && state?.url !== url;
  return { loading, data: loading ? undefined : state?.data, error: loading ? false : state?.error };
}

function BonusesContent() {
  useEffect(() => { document.title = 'Бонуси | Gaderia'; }, []);
  const params = useSearchParams();
  const account = Number(params.get('account')) || 0;
  return account ? <History accountId={account} /> : <List />;
}

export default function BonusesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>}>
      <BonusesContent />
    </Suspense>
  );
}

function List() {
  const router = useRouter();
  const params = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const search = params.get('search') ?? '';
  const sortKey = SORTS[params.get('sort') ?? ''] ? params.get('sort')! : 'balance';
  const sort = SORTS[sortKey];
  const [term, setTerm] = useState(search);

  const qs = new URLSearchParams({ page: String(page), limit: String(LIMIT), sortBy: sort.sortBy, sortOrder: sort.sortOrder });
  if (search) qs.set('search', search);
  const summary = useJson<Summary>(`${process.env.NEXT_PUBLIC_API_URL}/bonuses/summary`);
  const list = useJson<{ data: Row[]; total: number }>(`${process.env.NEXT_PUBLIC_API_URL}/bonuses?${qs.toString()}`);

  const go = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) { if (v) next.set(k, v); else next.delete(k); }
    router.push(`?${next.toString()}`);
  };

  const total = list.data?.total ?? 0;
  const pages = Math.ceil(total / LIMIT);
  const s = summary.data;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Бонуси</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        1 бонус за кожну гривню замовлення, оплаченого онлайн у застосунку. Поки лише нарахування — витрачати бонуси ще не можна.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Tile label="Клієнтів з бонусами" value={s ? num(s.accounts) : '…'} />
        <Tile label="Нараховано всього" value={s ? num(s.accrued) : '…'} />
        <Tile label="На балансах зараз" value={s ? num(s.balance) : '…'} />
        <Tile label="Останнє нарахування" value={s ? when(s.lastAt) : '…'} small />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <form onSubmit={(e) => { e.preventDefault(); go({ search: term.trim() || null, page: null }); }} className="flex gap-2 flex-1 min-w-60 max-w-md">
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Ім'я, email або телефон" className="flex-1 px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          <button className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900">Знайти</button>
        </form>
        <select value={sortKey} onChange={(e) => go({ sort: e.target.value === 'balance' ? null : e.target.value, page: null })} aria-label="Сортування" className="py-2 pl-3 pr-8 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {list.loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>
      ) : list.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">Не вдалося завантажити бонуси.</p>
      ) : !list.data || list.data.data.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{search ? `За запитом «${search}» нікого немає.` : 'Бонусів ще ніхто не отримав.'}</p>
      ) : (
        <>
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-x-auto">
            <table className="min-w-full w-full table-auto">
              <thead>
                <tr>
                  {['Клієнт', 'Баланс', 'Нараховано', 'Замовлень', 'Останнє'].map((c, i, all) => (
                    <th key={c} className={`px-3 h-10 text-left bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap ${i === 0 ? 'rounded-l-lg' : ''} ${i === all.length - 1 ? 'rounded-r-lg' : ''}`}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.data.data.map((r) => (
                  <tr key={r.account_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="py-3 px-3">
                      <Link href={`?account=${r.account_id}`} className="flex flex-col gap-0.5">
                        <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{r.full_name || `Акаунт #${r.account_id}`}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{[r.email, r.number].filter(Boolean).join(' · ')}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">{num(r.balance)}</td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{num(r.accrued)}</td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300">{r.orders}</td>
                    <td className="py-3 px-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{when(r.last_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} з {total}</span>
              <span className="flex gap-2">
                <button disabled={page <= 1} onClick={() => go({ page: String(page - 1) })} className="px-3 py-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800">← Назад</button>
                <button disabled={page >= pages} onClick={() => go({ page: String(page + 1) })} className="px-3 py-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800">Далі →</button>
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function History({ accountId }: { accountId: number }) {
  const { loading, data, error } = useJson<{ account: Row; entries: Entry[] }>(`${process.env.NEXT_PUBLIC_API_URL}/bonuses/account/${accountId}`);
  return (
    <div>
      <Link href="/dashboard/bonuses" className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">← Усі бонуси</Link>
      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Завантаження…</p>
      ) : error || !data ? (
        <p className="text-sm text-red-600 dark:text-red-400 mt-3">Бонусів у цього клієнта немає.</p>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-3">{data.account.full_name || `Акаунт #${accountId}`}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{[data.account.email, data.account.number].filter(Boolean).join(' · ')}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <Tile label="Баланс" value={num(data.account.balance)} />
            <Tile label="Нараховано" value={num(data.account.accrued)} />
            <Tile label="Замовлень з бонусами" value={String(data.account.orders)} />
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-x-auto">
            <table className="min-w-full w-full table-auto">
              <thead>
                <tr>
                  {['Дата', 'Подія', 'Замовлення', 'Сума замовлення', 'Бонуси'].map((c, i, all) => (
                    <th key={c} className={`px-3 h-10 text-left bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap ${i === 0 ? 'rounded-l-lg' : ''} ${i === all.length - 1 ? 'rounded-r-lg' : ''}`}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.entries.map((e) => (
                  <tr key={e.id}>
                    <td className="py-3 px-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{when(e.createdAt)}</td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300">{e.type === 'ACCRUE' ? 'Нарахування' : e.type === 'REDEEM' ? 'Списання' : e.type}</td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {e.payment_id ? `№${e.payment_id}` : '—'}
                      {e.order_status && <span className="ml-2 text-xs text-gray-400">{ORDER_STATUS[e.order_status] ?? e.order_status}</span>}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{e.order_amount != null ? `${num(Number(e.order_amount))} грн` : '—'}</td>
                    <td className={`py-3 px-3 text-sm font-semibold whitespace-nowrap ${e.amount > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-600'}`}>{e.amount > 0 ? '+' : ''}{num(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Tile({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`${small ? 'text-sm' : 'text-lg'} font-semibold text-gray-900 dark:text-gray-100 mt-1`}>{value}</p>
    </div>
  );
}
