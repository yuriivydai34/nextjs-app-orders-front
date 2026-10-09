'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import PromoForm, { type PromoFormHandle } from './_components/promo-form';
import PromoFieldSwitch from './_components/promo-field-switch';
import {
  ORDER_STATUS, audience, autoDiscounts, conditions, formatDiscount, money, promoStatus,
  type PromoCode, type Redemption,
} from './_components/promo';

// Codes are made here; app-server checks and applies them at checkout. A
// static export has no /promo-codes/[id], so one code's page is ?id=.
function PromoContent() {
  const id = Number(useSearchParams().get('id')) || 0;
  useEffect(() => { document.title = 'Промокоди | Gaderia'; }, []);
  return id ? <PromoDetail id={id} /> : <PromoList />;
}

export default function PromoCodesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>}>
      <PromoContent />
    </Suspense>
  );
}

// Keyed by what it answers, so a reload shows "loading" instead of stale rows.
function useLoad<T>(url: string, version: number, errorText: string) {
  const key = `${url}#${version}`;
  const [loaded, setLoaded] = useState<{ key: string; data?: T; error?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(url)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: T) => { if (!cancelled) setLoaded({ key, data }); })
      .catch(() => { if (!cancelled) setLoaded({ key, error: errorText }); });
    return () => { cancelled = true; };
  }, [url, key, errorText]);

  const loading = loaded?.key !== key;
  return { loading, data: loading ? undefined : loaded?.data, error: loading ? undefined : loaded?.error };
}

function PromoList() {
  const formRef = useRef<PromoFormHandle>(null);
  const [version, setVersion] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const { loading, data: codes, error } = useLoad<PromoCode[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/promo-codes`, version, 'Не вдалося завантажити промокоди.',
  );

  async function remove(p: PromoCode) {
    if (!confirm(`Видалити промокод ${p.code}?`)) return;
    setActionError(null);
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/promo-codes/${p.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setActionError(err?.message ?? 'Не вдалося видалити');
      return;
    }
    setVersion((v) => v + 1);
  }

  const totals = (codes ?? []).reduce(
    (acc, p) => ({ used: acc.used + p.used, discount: acc.discount + p.discount_total, orders: acc.orders + p.order_total }),
    { used: 0, discount: 0, orders: 0 },
  );
  const activeCount = (codes ?? []).filter((p) => promoStatus(p).label === 'Діє').length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Промокоди
          {codes && codes.length > 0 && <span className="ml-2 text-sm font-normal text-gray-400">{codes.length}</span>}
        </h2>
        <button
          onClick={() => formRef.current?.open()}
          className="px-4 h-10 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          + Новий промокод
        </button>
      </div>

      {codes && codes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Tile label="Діють зараз" value={String(activeCount)} />
          <Tile label="Використань" value={String(totals.used)} />
          <Tile label="Знижок надано" value={money(totals.discount)} />
          <Tile label="Замовлень на суму" value={money(totals.orders)} hint="товари до знижки" />
        </div>
      )}

      <PromoFieldSwitch />

      {codes && <AutoDiscounts codes={codes} />}

      {actionError && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : !codes || codes.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Промокодів ще немає.</p>
      ) : (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-x-auto">
          <table className="min-w-full w-full table-auto">
            <thead>
              <tr>
                {['Код', 'Знижка', 'Умови', 'Використано', 'Знижок надано', 'Статус', ''].map((col, i, all) => (
                  <th
                    key={i}
                    className={`px-3 h-10 text-left align-middle bg-gray-100 dark:bg-gray-800 whitespace-nowrap text-xs font-semibold text-gray-500 dark:text-gray-400
                      ${i === 0 ? 'rounded-l-lg' : ''} ${i === all.length - 1 ? 'rounded-r-lg' : ''}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map((p) => {
                const status = promoStatus(p);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="py-3 px-3 align-middle">
                      <Link href={`?id=${p.id}`} className="flex flex-col gap-0.5">
                        <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">{p.code}</span>
                        {p.title && <span className="text-xs text-gray-500 dark:text-gray-400">{p.title}</span>}
                      </Link>
                    </td>
                    <td className="py-3 px-3 align-middle text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatDiscount(p)}</td>
                    <td className="py-3 px-3 align-middle text-xs text-gray-600 dark:text-gray-400" style={{ maxWidth: 240 }}>
                      {conditions(p).join(' · ') || <span className="text-gray-300 dark:text-gray-600">без умов</span>}
                    </td>
                    <td className="py-3 px-3 align-middle text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {p.used}{p.usage_limit !== null && <span className="text-gray-400"> / {p.usage_limit}</span>}
                    </td>
                    <td className="py-3 px-3 align-middle text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{money(p.discount_total)}</td>
                    <td className="py-3 px-3 align-middle"><Badge {...status} /></td>
                    <td className="py-3 px-3 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button onClick={() => formRef.current?.open(p)} className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">Змінити</button>
                        {/* A used code keeps its history: it is switched off, not deleted. */}
                        {p.used + p.cancelled === 0 && (
                          <button onClick={() => remove(p)} className="text-sm text-red-500 hover:text-red-700">Видалити</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <PromoForm ref={formRef} onSaved={() => setVersion((v) => v + 1)} />
    </div>
  );
}

function PromoDetail({ id }: { id: number }) {
  const formRef = useRef<PromoFormHandle>(null);
  const [version, setVersion] = useState(0);
  const { loading, data: promo, error } = useLoad<PromoCode & { redemptions: Redemption[] }>(
    `${process.env.NEXT_PUBLIC_API_URL}/promo-codes/${id}`, version, 'Не вдалося завантажити промокод.',
  );

  if (loading) return <p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>;
  if (error || !promo) {
    return (
      <div className="flex flex-col gap-3">
        <BackLink />
        <p className="text-sm text-red-600 dark:text-red-400">{error ?? 'Промокод не знайдено.'}</p>
      </div>
    );
  }

  const status = promoStatus(promo);
  const left = promo.usage_limit === null ? null : Math.max(0, promo.usage_limit - promo.used);

  return (
    <div>
      <BackLink />

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 mb-1">
        <div className="flex items-center gap-3">
          <h2 className="font-mono text-xl font-semibold text-gray-900 dark:text-gray-100">{promo.code}</h2>
          <Badge {...status} />
        </div>
        <button onClick={() => formRef.current?.open(promo)} className="px-4 h-10 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          Змінити
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {[promo.title, formatDiscount(promo), ...conditions(promo)].filter(Boolean).join(' · ')}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Tile label="Використано" value={String(promo.used)} hint={promo.cancelled ? `ще ${promo.cancelled} скасовано` : undefined} />
        <Tile label="Лишилось" value={left === null ? '∞' : String(left)} />
        <Tile label="Знижок надано" value={money(promo.discount_total)} />
        <Tile label="Замовлень на суму" value={money(promo.order_total)} hint="товари до знижки" />
        <Tile
          label="Середня знижка"
          value={promo.used ? money(Math.round((promo.discount_total / promo.used) * 100) / 100) : '—'}
        />
      </div>

      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Хто використав</h3>
      {promo.redemptions.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Ще ніхто.</p>
      ) : (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-x-auto">
          <table className="min-w-full w-full table-auto">
            <thead>
              <tr>
                {['Дата', 'Клієнт', 'Замовлення', 'Товари', 'Знижка', 'До сплати'].map((col, i, all) => (
                  <th
                    key={i}
                    className={`px-3 h-10 text-left align-middle bg-gray-100 dark:bg-gray-800 whitespace-nowrap text-xs font-semibold text-gray-500 dark:text-gray-400
                      ${i === 0 ? 'rounded-l-lg' : ''} ${i === all.length - 1 ? 'rounded-r-lg' : ''}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {promo.redemptions.map((r) => {
                // Freed its place: an app order cancelled, or a site order released.
                const cancelled = r.status === 'CANCELED' || Boolean(r.released_at);
                return (
                  <tr key={r.id} className={cancelled ? 'opacity-50' : ''}>
                    <td className="py-3 px-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-0.5">
                        {r.full_name && <span className="text-sm text-gray-900 dark:text-gray-100">{r.full_name}</span>}
                        {r.email && <span className="text-xs text-gray-500 dark:text-gray-400">{r.email}</span>}
                        {!r.full_name && !r.email && <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {r.source === 'WOO' ? `Сайт №${r.external_order_id ?? '—'}` : r.payment_id !== null ? `№${r.payment_id}` : '—'}
                      {r.status && <span className="ml-2 text-xs text-gray-400">{ORDER_STATUS[r.status] ?? r.status}</span>}
                      {r.released_at && <span className="ml-2 text-xs text-gray-400">скасовано на сайті</span>}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{money(r.order_amount)}</td>
                    <td className="py-3 px-3 text-sm text-green-700 dark:text-green-400 whitespace-nowrap">−{money(r.discount_amount)}</td>
                    <td className="py-3 px-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {r.payment_amount !== null ? money(r.payment_amount) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            «До сплати» — з доставкою, якщо її оплачували разом із замовленням. Скасовані замовлення (у застосунку чи на сайті) приглушені й не рахуються в ліміт і статистику.
          </p>
        </div>
      )}

      <PromoForm ref={formRef} onSaved={() => setVersion((v) => v + 1)} />
    </div>
  );
}

// Answers "does anyone get a discount right now without typing a code?".
// Automatic codes are the ones with "застосовувати автоматично": the app
// (1.3.2+) asks the server for one at checkout and shows the lower price.
function AutoDiscounts({ codes }: { codes: PromoCode[] }) {
  const { working, idle } = autoDiscounts(codes);
  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Автоматичні знижки зараз</p>
      {working.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ніхто не отримує знижку автоматично — лише ті, хто вводить код сам.
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1">
          {working.map((p) => (
            <li key={p.id} className="text-sm text-gray-700 dark:text-gray-300">
              <Link href={`?id=${p.id}`} className="font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline">{p.code}</Link>
              {' '}{formatDiscount(p)} — {audience(p)}
            </li>
          ))}
        </ul>
      )}
      {idle.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Позначені «автоматично», але зараз не діють: {idle.map((p) => `${p.code} (${promoStatus(p).label.toLowerCase()})`).join(', ')}
        </p>
      )}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Знижку бачать клієнти із застосунком 1.3.2 і новіше, ще до оплати. Інших автоматичних знижок немає.
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        Застосунок підписує автоматичну знижку як «на перше замовлення», тож автоматичним варто робити лише привітальний код.
      </p>
    </div>
  );
}

function BackLink() {
  return <Link href="/dashboard/promo-codes" className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">← Усі промокоди</Link>;
}

function Badge({ label, className }: { label: string; className: string }) {
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${className}`}>{label}</span>;
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}
