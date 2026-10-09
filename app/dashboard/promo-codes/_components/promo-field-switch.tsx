'use client';

import { useEffect, useState } from 'react';
import { getAppSettings, updateAppSettings } from '@/app/actions/app-settings';

// The promo code field at checkout. App 1.3.3 and newer read this switch from
// app-server GET /app/config when they start; 1.3.2 hides the field in code
// and ignores it. Off, only codes marked "застосовувати автоматично" apply.
export default function PromoFieldSwitch() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAppSettings()
      .then((s) => setEnabled(s.promo_field_enabled))
      .catch((err) => setError(err.message));
  }, []);

  async function toggle() {
    if (enabled === null) return;
    setSaving(true);
    setError(null);
    try {
      const s = await updateAppSettings({ promo_field_enabled: !enabled });
      setEnabled(s.promo_field_enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-6 px-4 py-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Поле «Промокод» у застосунку</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {enabled
            ? 'Клієнти можуть ввести код на оформленні замовлення.'
            : 'Вимкнено: код ввести ніде, працюють лише коди «застосовувати автоматично».'}{' '}
          Діє в застосунку 1.3.3 і новіше, після його перезапуску; у 1.3.2 поле сховане завжди.
        </p>
        {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled === true}
        aria-label="Поле «Промокод» у застосунку"
        disabled={enabled === null || saving}
        onClick={toggle}
        className="flex items-center gap-2 shrink-0 disabled:opacity-50"
      >
        <span className="text-sm text-gray-600 dark:text-gray-300 w-20 text-right">
          {enabled === null ? '…' : enabled ? 'Увімкнено' : 'Вимкнено'}
        </span>
        <span className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
        </span>
      </button>
    </div>
  );
}
