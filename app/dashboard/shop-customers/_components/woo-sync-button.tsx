'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/app/lib/api';

type SyncResult = {
  ordersScanned: number;
  contactsFound: number;
  created: number;
  updated: number;
  linkedToExisting: number;
};

/** The table on this page listens for this and refetches. */
export const SHOP_CUSTOMERS_REFRESH_EVENT = 'shop-customers:refresh';

const STATUS_URL = `${process.env.NEXT_PUBLIC_API_URL}/integrations/woocommerce/status`;
const POLL_MS = 5000;

async function isSyncRunning(): Promise<boolean> {
  const res = await apiFetch(STATUS_URL);
  if (!res.ok) return false;
  const body = await res.json().catch(() => ({}));
  return Boolean(body?.running);
}

export default function WooSyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // A sync started elsewhere - the hourly cron, another tab, another admin, or
  // this page before a reload. It keeps going on the server regardless.
  const [runningElsewhere, setRunningElsewhere] = useState(false);
  const wasRunning = useRef(false);

  const checkRunning = useCallback(async () => {
    const running = await isSyncRunning().catch(() => false);
    // It just finished: show what it brought in.
    if (wasRunning.current && !running) window.dispatchEvent(new CustomEvent(SHOP_CUSTOMERS_REFRESH_EVENT));
    wasRunning.current = running;
    setRunningElsewhere(running);
  }, []);

  useEffect(() => {
    // Deferred so the state update happens in a callback, not in the effect body.
    const timer = setTimeout(checkRunning, 0);
    return () => clearTimeout(timer);
  }, [checkRunning]);

  useEffect(() => {
    if (!runningElsewhere) return;
    const timer = setInterval(checkRunning, POLL_MS);
    return () => clearInterval(timer);
  }, [runningElsewhere, checkRunning]);

  async function handleSync() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/woocommerce/sync`, {
        method: 'POST',
      });
      if (res.status === 409) {
        wasRunning.current = true;
        setRunningElsewhere(true);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'sync failed');
      }
      const r: SyncResult = await res.json();
      setMessage(
        `Замовлень: ${r.ordersScanned} · нових: ${r.created} · оновлено: ${r.updated} · зіставлено: ${r.linkedToExisting}`,
      );
      // Refetch the table in place, so the summary above stays readable.
      window.dispatchEvent(new CustomEvent(SHOP_CUSTOMERS_REFRESH_EVENT));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка синхронізації');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {message && <span className="text-xs text-gray-500 dark:text-gray-400">{message}</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
      {runningElsewhere && !loading && (
        <span className="text-xs text-gray-500 dark:text-gray-400">Синхронізація вже триває, таблиця оновиться сама</span>
      )}
      <button
        onClick={handleSync}
        disabled={loading || runningElsewhere}
        title="Підтягнути покупців із замовлень на сайті"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        <span>⟳</span>
        {loading || runningElsewhere ? 'Синхронізація…' : 'Синхронізувати сайт'}
      </button>
    </div>
  );
}
