'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Banner,
  bannerImageSrc,
  deleteBanner,
  listBanners,
  reorderBanners,
  updateBanner,
} from '@/app/actions/promotions';
import { getAppSettings, updateAppSettings } from '@/app/actions/app-settings';
import BannerForm from './_components/promotion-form';

function day(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('uk-UA');
}

/** Why a banner is not on screen right now, or null if it is. */
function hiddenBecause(b: Banner): string | null {
  if (!b.is_active) return 'вимкнений';
  const now = Date.now();
  if (b.starts_at && new Date(b.starts_at).getTime() > now) return `з ${day(b.starts_at)}`;
  if (b.ends_at && new Date(b.ends_at).getTime() <= now) return `завершився ${day(b.ends_at)}`;
  return null;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Banner | null | undefined>(undefined);
  const dragIndex = useRef<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [list, settings] = await Promise.all([listBanners(), getAppSettings()]);
      setBanners(list);
      setEnabled(Boolean(settings?.banners_enabled));
    } catch {
      setError('Не вдалося завантажити банери.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function toggleCarousel(on: boolean) {
    setEnabled(on);
    try {
      await updateAppSettings({ banners_enabled: on });
    } catch {
      setEnabled(!on);
      setError('Не вдалося перемкнути карусель.');
    }
  }

  async function toggleBanner(b: Banner) {
    // Only the switch is sent; the rest of the banner stays as it is.
    setBanners((list) => list.map((x) => (x.id === b.id ? { ...x, is_active: !x.is_active } : x)));
    try {
      await updateBanner(b.id, {
        title: b.title,
        target_type: b.target_type,
        target_product_id: b.target_product_id,
        target_url: b.target_url,
        starts_at: b.starts_at,
        ends_at: b.ends_at,
        is_active: !b.is_active,
      });
    } catch {
      void load();
    }
  }

  async function remove(b: Banner) {
    if (!confirm(`Видалити банер «${b.title}»?`)) return;
    try {
      await deleteBanner(b.id);
      setBanners((list) => list.filter((x) => x.id !== b.id));
    } catch {
      setError('Не вдалося видалити банер.');
    }
  }

  function onDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === index) return;
    const next = [...banners];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    setBanners(next);
    reorderBanners(next.map((b) => b.id)).catch(() => void load());
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Акції</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Карусель угорі застосунку. Порядок — перетягуванням; перший у списку показується першим.
        </p>
      </div>

      <label className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => void toggleCarousel(e.target.checked)}
          className="w-4 h-4 mt-0.5"
        />
        <span>
          <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Показувати карусель у застосунку
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            Поки вимкнено, застосунок не показує жодного банера, навіть увімкненого.
          </span>
        </span>
      </label>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {banners.length > 0 ? `Банерів: ${banners.length}` : ''}
        </p>
        <button
          onClick={() => setEditing(null)}
          className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          + Додати банер
        </button>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>
      ) : banners.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Банерів ще немає — натисніть «Додати банер».
        </p>
      ) : (
        <ul className="space-y-2">
          {banners.map((b, i) => {
            const hidden = hiddenBecause(b);
            return (
              <li
                key={b.id}
                draggable
                onDragStart={() => { dragIndex.current = i; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 cursor-move"
              >
                <span className="text-gray-300 dark:text-gray-600 select-none">⠿</span>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bannerImageSrc(b)}
                  alt={b.title}
                  className="w-28 h-16 object-cover rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{b.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {b.target_type === 'product' && `Товар #${b.target_product_id}`}
                    {b.target_type === 'link' && b.target_url}
                    {b.target_type === 'none' && 'Без переходу'}
                  </p>
                  {(b.starts_at || b.ends_at) && (
                    <p className="text-xs text-gray-400">
                      {day(b.starts_at) || '…'} – {day(b.ends_at) || '…'}
                    </p>
                  )}
                </div>

                {hidden && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {hidden}
                  </span>
                )}

                <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={b.is_active}
                    onChange={() => void toggleBanner(b)}
                    className="w-4 h-4"
                  />
                  Увімк.
                </label>

                <button
                  onClick={() => setEditing(b)}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Змінити
                </button>
                <button
                  onClick={() => void remove(b)}
                  className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  Видалити
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {editing !== undefined && (
        <BannerForm
          banner={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => void load()}
        />
      )}
    </div>
  );
}
