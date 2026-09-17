'use client';

import { useState } from 'react';
import { apiFetch } from '@/app/lib/api';

type SyncResult = {
  ordersScanned: number;
  contactsFound: number;
  created: number;
  updated: number;
  linkedToExisting: number;
};

/** The customers table listens for this and refetches. */
export const CUSTOMERS_REFRESH_EVENT = 'customers:refresh';

export default function WooSyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/woocommerce/sync`, {
        method: 'POST',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'sync failed');
      }
      const r: SyncResult = await res.json();
      setMessage(
        `Замовлень: ${r.ordersScanned} · нових: ${r.created} · оновлено: ${r.updated} · зіставлено: ${r.linkedToExisting}`,
      );
      // Refetch the table in place, so the summary above stays readable.
      window.dispatchEvent(new CustomEvent(CUSTOMERS_REFRESH_EVENT));
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
      <button
        onClick={handleSync}
        disabled={loading}
        title="Підтягнути покупців із замовлень на сайті"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        <span>⟳</span>
        {loading ? 'Синхронізація…' : 'Синхронізувати сайт'}
      </button>
    </div>
  );
}
