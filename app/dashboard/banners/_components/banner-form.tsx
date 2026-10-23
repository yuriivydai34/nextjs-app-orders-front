'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/app/lib/api';
import {
  Banner,
  BannerDraft,
  BannerTarget,
  bannerImageSrc,
  createBanner,
  updateBanner,
} from '@/app/actions/banners';

const INPUT =
  'w-full h-10 rounded-lg px-3 bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500';

const TARGETS: { value: BannerTarget; label: string }[] = [
  { value: 'none', label: 'Нічого' },
  { value: 'product', label: 'Товар' },
  { value: 'link', label: 'Посилання' },
];

type Product = { id: number; header: string };

/** The API keeps instants; the form edits local days. */
function toInputDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

export default function BannerForm({
  banner,
  onClose,
  onSaved,
}: {
  banner: Banner | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState<BannerTarget>('none');
  const [productId, setProductId] = useState<string>('');
  const [url, setUrl] = useState('');
  const [active, setActive] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ref.current?.showModal();
    setTitle(banner?.title ?? '');
    setTarget(banner?.target_type ?? 'none');
    setProductId(banner?.target_product_id ? String(banner.target_product_id) : '');
    setUrl(banner?.target_url ?? '');
    setActive(banner?.is_active ?? true);
    setFrom(toInputDate(banner?.starts_at));
    setTo(toInputDate(banner?.ends_at));
    setFile(null);
    setPreview(banner ? bannerImageSrc(banner) : null);
    setError(null);
  }, [banner]);

  useEffect(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog?page=1&limit=1000`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setProducts(d?.data ?? []))
      .catch(() => setProducts([]));
  }, []);

  // Object URLs for the chosen file are released, or each pick leaks one.
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!banner && !file) {
      setError('Додайте картинку банера');
      return;
    }

    const draft: BannerDraft = {
      title,
      target_type: target,
      target_product_id: target === 'product' ? Number(productId) || null : null,
      target_url: target === 'link' ? url : null,
      is_active: active,
      // A day in the form means its start; an end date should include that day.
      starts_at: from ? new Date(`${from}T00:00:00`).toISOString() : '',
      ends_at: to ? new Date(`${to}T23:59:59`).toISOString() : '',
      image: file,
    };

    setSaving(true);
    try {
      if (banner) await updateBanner(banner.id, draft);
      else await createBanner(draft);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти');
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="rounded-xl bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-xl"
    >
      <form onSubmit={submit}>
        <header className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {banner ? 'Редагування банера' : 'Новий банер'}
          </p>
        </header>

        <div className="px-6 py-4 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Назва</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
              placeholder="Весняна акція"
              className={`${INPUT} mt-1`}
            />
            <span className="text-xs text-gray-400">Видно лише в панелі та як опис картинки.</span>
          </label>

          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Картинка</span>
            {preview && (
              // Not next/image: the picture comes from the API, whose host is
              // only known at build time through NEXT_PUBLIC_API_URL.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 object-cover max-h-48"
              />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-gray-800 file:text-gray-700 dark:file:text-gray-300"
            />
            <span className="text-xs text-gray-400">
              JPEG, PNG або WebP, до 8 МБ. Ширші за 2000 px зменшуються.
              {banner && ' Без вибору файлу картинка лишиться теперішньою.'}
            </span>
          </div>

          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Натискання відкриває</span>
            <div className="flex gap-4 mt-1">
              {TARGETS.map((t) => (
                <label key={t.value} className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="target"
                    checked={target === t.value}
                    onChange={() => setTarget(t.value)}
                    className="w-4 h-4"
                  />
                  {t.label}
                </label>
              ))}
            </div>

            {target === 'product' && (
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className={`${INPUT} mt-2`}
              >
                <option value="">— оберіть товар —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.header}</option>
                ))}
              </select>
            )}

            {target === 'link' && (
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://gaderia.com.ua/akciya"
                className={`${INPUT} mt-2`}
              />
            )}
          </div>

          <div className="flex gap-3">
            <label className="flex-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Показувати з</span>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`${INPUT} mt-1`} />
            </label>
            <label className="flex-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">до</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={`${INPUT} mt-1`} />
            </label>
          </div>
          <p className="text-xs text-gray-400 -mt-2">Порожньо — показувати без обмеження в часі.</p>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4" />
            Увімкнений
          </label>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <footer className="flex gap-2 px-6 py-4 justify-end border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-10 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 h-10 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Збереження…' : 'Зберегти'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
