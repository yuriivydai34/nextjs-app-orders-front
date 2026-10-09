'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';
import WooSyncButton, { SHOP_CUSTOMERS_REFRESH_EVENT } from '../../shop-customers/_components/woo-sync-button';
import { describeSyncResult, type SyncResult } from '@/app/lib/sync-result.ts';

// gaderia_mobile_admin_back GET /system/status.
type SystemStatus = {
  health: {
    status: 'ok' | 'degraded' | 'down';
    uptimeSeconds: number;
    checks: {
      database: { ok: boolean; latencyMs: number | null; error?: string };
      // false once the last sync is over two hours old.
      shopSync: { ok: boolean };
    };
  };
  shopSync: {
    running: boolean;
    cronEnabled: boolean;
    lastRunAt: string | null;
    lastError: { at: string; message: string } | null;
    lastResult: SyncResult | null;
    imported: number;
  };
  admins: { id: number; email: string | null; full_name: string | null; createdAt: string | null }[];
};

const STATUS: Record<SystemStatus['health']['status'], { label: string; className: string }> = {
  ok: { label: 'Усе працює', className: 'bg-green-100 text-green-700' },
  degraded: { label: 'Є проблема', className: 'bg-orange-100 text-orange-700' },
  down: { label: 'Не працює', className: 'bg-red-100 text-red-700' },
};

// `now` is when the status was loaded, so the text does not change on re-render.
function ago(iso: string | null, now: number): string {
  if (!iso) return 'ще не було';
  const minutes = Math.round((now - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'щойно';
  if (minutes < 60) return `${minutes} хв тому`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} год тому`;
  return `${Math.floor(hours / 24)} дн. тому`;
}

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString('uk-UA') : '');

// The system itself: is the API healthy, is the site's buyer list still being
// imported, and who can get into this panel.
export default function SystemStatusSections() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loadedAt, setLoadedAt] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/system/status`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: SystemStatus) => { setStatus(data); setLoadedAt(Date.now()); setError(null); })
      .catch(() => setError('Не вдалося завантажити стан системи'));
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    // A sync started from the button below reports when it is done.
    window.addEventListener(SHOP_CUSTOMERS_REFRESH_EVENT, load);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(SHOP_CUSTOMERS_REFRESH_EVENT, load);
    };
  }, [load]);

  if (error) return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  if (!status) return <p className="text-sm text-gray-500 dark:text-gray-400">Завантаження стану системи…</p>;

  const badge = STATUS[status.health.status];
  const { database } = status.health.checks;
  const sync = status.shopSync;
  const stale = !status.health.checks.shopSync.ok;

  return (
    <>
      <section className={SECTION}>
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Стан системи</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>{badge.label}</span>
        </div>
        <Row label="База даних">
          {database.ok ? `працює · ${database.latencyMs} мс` : <span className="text-red-600">не відповідає{database.error ? `: ${database.error}` : ''}</span>}
        </Row>
        <Row
          label="Синхронізація покупців з сайту"
          hint={`Щогодини, лише замовлення, змінені з минулого разу. Покупців з сайту в базі: ${sync.imported.toLocaleString('uk-UA')} — зростає, лише коли замовляє нова людина`}
        >
          {!sync.cronEnabled ? (
            <span className="text-orange-600">вимкнена (WOO_SYNC_CRON=off)</span>
          ) : sync.running ? (
            'триває зараз'
          ) : (
            <span className={stale ? 'text-orange-600' : ''} title={when(sync.lastRunAt)}>
              остання {ago(sync.lastRunAt, loadedAt)}
            </span>
          )}
        </Row>
        {sync.lastResult && (() => {
          const d = describeSyncResult(sync.lastResult);
          return (
            <div className="px-5 py-3.5 text-xs text-gray-600 dark:text-gray-400">
              <span className="text-gray-500">Останній запуск:</span> {d.summary}
              {d.detail && <span className="block text-gray-400 mt-0.5">{d.detail}</span>}
            </div>
          );
        })()}
        {sync.lastError && (
          <div className="px-5 py-3.5 text-xs text-red-600 dark:text-red-400">
            Остання помилка ({ago(sync.lastError.at, loadedAt)}): {sync.lastError.message}
          </div>
        )}
        <div className="px-5 py-3.5 flex justify-end">
          <WooSyncButton />
        </div>
      </section>

      <section className={SECTION}>
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Доступ до адмінки</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Акаунти з роллю ADMIN. Незнайомий — зніміть роль у «Користувачі» (поле «Роль»: USER).
          </p>
        </div>
        {status.admins.length === 0 ? (
          <p className="px-5 py-3.5 text-sm text-gray-500">Немає жодного.</p>
        ) : (
          status.admins.map((a) => (
            <Row key={a.id} label={a.full_name || '—'} hint={a.createdAt ? `з ${new Date(a.createdAt).toLocaleDateString('uk-UA')}` : undefined}>
              <span className="font-mono text-xs">{a.email ?? '—'}</span>
              <span className="ml-2 text-xs text-gray-400">#{a.id}</span>
            </Row>
          ))
        )}
      </section>
    </>
  );
}

const SECTION =
  'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800';

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-3.5 flex items-center justify-between gap-4">
      <span>
        <span className="block text-sm text-gray-700 dark:text-gray-300">{label}</span>
        {hint && <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{hint}</span>}
      </span>
      <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{children}</span>
    </div>
  );
}
