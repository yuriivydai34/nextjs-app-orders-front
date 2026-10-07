'use client';

import { FormEvent, useEffect, useState } from 'react';
import { getAppSettings, updateAppSettings } from '@/app/actions/app-settings';

// Which app versions still work. The app checks on launch (app-server
// GET /app/config): older than the minimum shows only "Оновіть застосунок";
// older than the recommended one asks once and can be dismissed. Empty means
// no check.
export default function AppVersions() {
  const [min, setMin] = useState('');
  const [latest, setLatest] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getAppSettings()
      .then((s) => {
        setMin(s.min_app_version ?? '');
        setLatest(s.latest_app_version ?? '');
        setLoaded(true);
      })
      .catch((err) => setMessage({ ok: false, text: err.message }));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const s = await updateAppSettings({ min_app_version: min.trim() || null, latest_app_version: latest.trim() || null });
      setMin(s.min_app_version ?? '');
      setLatest(s.latest_app_version ?? '');
      setMessage({ ok: true, text: 'Збережено' });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Не вдалося зберегти' });
    } finally {
      setSaving(false);
    }
  }

  const input =
    'w-28 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100';

  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Версія застосунку</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Застосунок перевіряє це при запуску. Формат — 1.3.2. Порожнє поле — без перевірки.
        </p>
      </div>
      <form onSubmit={save}>
        <label className="px-5 py-3.5 flex items-center justify-between gap-4">
          <span>
            <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Мінімальна версія</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Старіша не працює: лише екран «Оновіть застосунок». Для випадків, коли стара версія вже зламана.
            </span>
          </span>
          <input value={min} onChange={(e) => setMin(e.target.value)} placeholder="—" disabled={!loaded} className={input} />
        </label>
        <label className="px-5 py-3.5 flex items-center justify-between gap-4">
          <span>
            <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Рекомендована версія</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Старіша один раз пропонує оновитись, можна відкласти. Ставте, коли нова версія вже є в обох магазинах.
            </span>
          </span>
          <input value={latest} onChange={(e) => setLatest(e.target.value)} placeholder="—" disabled={!loaded} className={input} />
        </label>
        <div className="px-5 py-3.5 flex items-center justify-end gap-3">
          {message && (
            <span className={`text-xs ${message.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {message.text}
            </span>
          )}
          <button
            type="submit"
            disabled={!loaded || saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {saving ? 'Збереження…' : 'Зберегти'}
          </button>
        </div>
      </form>
    </section>
  );
}
