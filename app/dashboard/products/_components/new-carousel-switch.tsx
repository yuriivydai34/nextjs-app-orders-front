'use client';

import { useEffect, useState } from 'react';
import { getAppSettings, updateAppSettings } from '@/app/actions/app-settings';

// The "Новинки" carousel at the top of the app's catalog. Products get into
// it with the "Новинка" checkbox in their form; this turns the whole
// carousel on or off. The app picks the change up the next time the catalog
// opens.
export default function NewCarouselSwitch() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAppSettings()
      .then((s) => setEnabled(s.new_carousel_enabled))
      .catch((err) => setError(err.message));
  }, []);

  async function toggle() {
    if (enabled === null) return;
    setSaving(true);
    setError(null);
    try {
      const s = await updateAppSettings({ new_carousel_enabled: !enabled });
      setEnabled(s.new_carousel_enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-6 px-4 py-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Карусель «Новинки» в застосунку</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Вгорі каталогу. Показує товари з галочкою «Новинка».
        </p>
        {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled === true}
        aria-label="Карусель «Новинки» в застосунку"
        disabled={enabled === null || saving}
        onClick={toggle}
        className="flex items-center gap-2 shrink-0 disabled:opacity-50"
      >
        <span className="text-sm text-gray-600 dark:text-gray-300 w-20 text-right">
          {enabled === null ? '…' : enabled ? 'Увімкнено' : 'Вимкнено'}
        </span>
        <span className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
          {/* left-0.5 is required: without it the knob starts where the button's centred text would, and slides off the track. */}
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
        </span>
      </button>
    </div>
  );
}
