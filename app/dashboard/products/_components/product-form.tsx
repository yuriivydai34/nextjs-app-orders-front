'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { createProduct, updateProduct } from '@/app/actions/products';
import { MEASUREMENT_TYPES, PACKAGING_TYPES, PRODUCT_TYPES, SUBTYPE } from '@/app/lib/product-types.ts';
import { BADGE_MAX_LENGTH, BADGE_PRESET, DEFAULT_BADGE_COLOR } from '@/app/lib/product-badges';

export type Product = {
  id: number;
  header: string;
  price: number;
  price_discount: number;
  is_discount: boolean;
  type_product: string | null;
  type_packaging: string | null;
  type_juice: string | null;
  type_vinegar?: string | null;
  type_apple?: string | null;
  measurement: number;
  type_measurement: string | null;
  article: string | null;
  picture: string | null;
  // With a badge, `picture` is the copy with it drawn on and this is the clean one.
  picture_original?: string | null;
  badge?: string | null;
  badge_color?: string | null;
  id_sort?: number | null;
  is_active?: boolean;
  description?: string | null;
  shipment_weight?: number | null;
  shipment_length?: number | null;
  shipment_width?: number | null;
  shipment_height?: number | null;
};

type Mode = 'create' | 'edit' | 'duplicate';

export type ProductFormHandle = {
  create: () => void;
  edit: (product: Product) => void;
  // A new product that starts as a copy: most products are variants of a few
  // (bag-in-box 3 л, скло 1 л × 6, …) with the same sizes and weight.
  duplicate: (product: Product) => void;
};

const TITLES: Record<Mode, string> = {
  create: 'Новий товар',
  edit: 'Редагування товару',
  duplicate: 'Новий товар — копія',
};

const str = (v: number | string | null | undefined) => (v === null || v === undefined ? '' : String(v));

// One form for adding, editing and duplicating. It offers only what the app
// understands, and the one type field that fits the kind of product.
const ProductForm = forwardRef<ProductFormHandle, { onSaved: () => void }>(function ProductForm({ onSaved }, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>('create');
  const [source, setSource] = useState<Product | null>(null);
  // Remounts the form so defaultValues come from the product just opened.
  const [openCount, setOpenCount] = useState(0);
  const [kind, setKind] = useState('');
  const [onSale, setOnSale] = useState(false);
  const [picture, setPicture] = useState('');
  const [badge, setBadge] = useState('');
  const [badgeColor, setBadgeColor] = useState(DEFAULT_BADGE_COLOR);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function open(nextMode: Mode, product: Product | null) {
    setMode(nextMode);
    setSource(product);
    setKind(product?.type_product ?? '');
    setOnSale(nextMode !== 'create' && Boolean(product?.is_discount));
    // The clean picture: the API draws the badge on it again when saving.
    setPicture(product?.picture_original ?? product?.picture ?? '');
    setBadge(product?.badge ?? '');
    setBadgeColor(product?.badge_color ?? DEFAULT_BADGE_COLOR);
    setError(null);
    setOpenCount((n) => n + 1);
    dialogRef.current?.showModal();
  }

  useImperativeHandle(ref, () => ({
    create: () => open('create', null),
    edit: (p) => open('edit', p),
    duplicate: (p) => open('duplicate', p),
  }));

  const sub = SUBTYPE[kind];
  const p = source;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (name: string) => (form.get(name) as string | null) ?? '';
    const data: Record<string, unknown> = {
      header: get('header'),
      article: get('article'),
      description: get('description'),
      picture,
      badge: badge.trim(),
      badge_color: badge.trim() ? badgeColor : '',
      type_product: kind,
      type_packaging: get('type_packaging'),
      measurement: get('measurement'),
      type_measurement: get('type_measurement'),
      price: get('price'),
      is_discount: onSale,
      price_discount: onSale ? get('price_discount') : 0,
      shipment_length: get('shipment_length'),
      shipment_width: get('shipment_width'),
      shipment_height: get('shipment_height'),
      shipment_weight: get('shipment_weight'),
      is_active: form.get('is_active') === 'on',
    };
    if (sub) data[sub.field] = get(sub.field);

    setSaving(true);
    setError(null);
    try {
      if (mode === 'edit' && p) await updateProduct(p.id, data);
      else await createProduct(data);
      dialogRef.current?.close();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти');
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current?.close(); }}
      className="rounded-xl bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-4xl"
    >
      <form key={openCount} onSubmit={submit}>
        <header className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{TITLES[mode]}</p>
          {mode === 'duplicate' && p && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Усе скопійовано з «{p.header}». Змініть назву, артикул, ціну й картинку.
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 px-6 py-4 max-h-[75vh] overflow-y-auto">
          {/* Left: what it is */}
          <div className="flex flex-col gap-4">
            <Field label="Назва" required>
              <input name="header" required defaultValue={p?.header ?? ''} className={INPUT} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Тип товару" required>
                <select value={kind} onChange={(e) => setKind(e.target.value)} required className={INPUT}>
                  <option value="">Оберіть…</option>
                  {PRODUCT_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              {sub ? (
                <Field label={sub.label} required hint={kind === 'VINEGAR' ? 'Смак — у назві' : undefined}>
                  <select
                    key={kind}
                    name={sub.field}
                    required
                    defaultValue={p?.type_product === kind ? str(p?.[sub.field]) : ''}
                    className={INPUT}
                  >
                    <option value="">Оберіть…</option>
                    {sub.choices.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
              ) : <div />}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Пакування" required>
                <select name="type_packaging" required defaultValue={p?.type_packaging ?? ''} className={INPUT}>
                  <option value="">Оберіть…</option>
                  {PACKAGING_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Об'єм / вага" required hint="Однієї одиниці: 0,25">
                <input name="measurement" type="number" step="0.01" min="0.01" required defaultValue={str(p?.measurement)} className={INPUT} />
              </Field>
              <Field label="Одиниця" required>
                <select name="type_measurement" required defaultValue={p?.type_measurement ?? 'LITER'} className={INPUT}>
                  {MEASUREMENT_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Артикул" hint="Штрихкод з 1С">
              <input name="article" defaultValue={mode === 'duplicate' ? '' : p?.article ?? ''} className={INPUT} />
            </Field>
          </div>

          {/* Right: price, delivery, picture */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ціна, грн" required>
                <input name="price" type="number" step="0.01" min="0.01" required defaultValue={str(p?.price)} className={INPUT} />
              </Field>
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 h-4">
                  <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} className="w-4 h-4" />
                  Акційна ціна, грн
                </label>
                <input
                  name="price_discount" type="number" step="0.01" min="0.01"
                  required={onSale} disabled={!onSale}
                  defaultValue={p?.is_discount ? str(p.price_discount) : ''}
                  placeholder={onSale ? 'нижча за ціну' : 'вимкнено'}
                  className={`${INPUT} disabled:opacity-40`}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Коробка для доставки <span className="text-red-500">*</span>
                <span className="font-normal text-gray-400"> — з цього рахується вартість Нової Пошти</span>
              </p>
              <div className="grid grid-cols-4 gap-2">
                <input name="shipment_length" type="number" step="0.1" min="0.1" required placeholder="Д, см" title="Довжина, см" defaultValue={str(p?.shipment_length)} className={INPUT} />
                <input name="shipment_width" type="number" step="0.1" min="0.1" required placeholder="Ш, см" title="Ширина, см" defaultValue={str(p?.shipment_width)} className={INPUT} />
                <input name="shipment_height" type="number" step="0.1" min="0.1" required placeholder="В, см" title="Висота, см" defaultValue={str(p?.shipment_height)} className={INPUT} />
                <input name="shipment_weight" type="number" step="0.1" min="0.1" required placeholder="кг" title="Вага, кг" defaultValue={str(p?.shipment_weight)} className={INPUT} />
              </div>
              {mode === 'create' && (
                <p className="text-xs text-gray-400 mt-1">Швидше — «Дублювати» схожий товар: габарити й вага скопіюються.</p>
              )}
            </div>

            <Field label="Картинка (посилання)">
              <input type="url" value={picture} onChange={(e) => setPicture(e.target.value)} placeholder="https://…" className={INPUT} />
            </Field>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Бейдж на картинці</span>
              <div className="flex items-center gap-2">
                <input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  maxLength={BADGE_MAX_LENGTH}
                  placeholder="без бейджа"
                  aria-label="Текст бейджа"
                  className={`${INPUT} flex-1`}
                />
                <input
                  type="color"
                  value={badgeColor}
                  onChange={(e) => setBadgeColor(e.target.value)}
                  disabled={!badge.trim()}
                  title="Колір бейджа"
                  aria-label="Колір бейджа"
                  className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent disabled:opacity-40"
                />
                {!badge.trim() && (
                  <button
                    type="button"
                    onClick={() => { setBadge(BADGE_PRESET); setBadgeColor(DEFAULT_BADGE_COLOR); }}
                    className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: DEFAULT_BADGE_COLOR }}
                  >
                    {BADGE_PRESET}
                  </button>
                )}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Малюється на самій картинці — у застосунку з&apos;явиться одразу. Порожнє поле прибирає бейдж.
              </span>
            </div>
            {picture && (
              // A preview only: the real badge is drawn by the API on save.
              <div className="relative w-40 h-40 rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={picture} alt="" className="w-full h-full object-contain" />
                {badge.trim() && (
                  <span
                    className="absolute left-0 top-2 pl-2 pr-2.5 py-0.5 rounded-r-full text-[11px] font-bold text-white whitespace-nowrap"
                    style={{ backgroundColor: badgeColor }}
                  >
                    {badge.trim()}
                  </span>
                )}
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                name="is_active" type="checkbox"
                defaultChecked={mode === 'edit' ? p?.is_active !== false : true}
                className="w-4 h-4"
              />
              Показувати в застосунку
              <span className="text-xs text-gray-400">(зніміть, поки товар готується до запуску)</span>
            </label>
          </div>

          {/* The description is what the app shows under the product: often
              several paragraphs, so it gets the full width and room to grow. */}
          <div className="md:col-span-2">
            <Field label="Опис" hint="Так, як побачить клієнт у застосунку; порожній рядок — новий абзац">
              <textarea
                name="description"
                rows={10}
                defaultValue={p?.description ?? ''}
                className={`${INPUT} h-auto min-h-40 py-2 leading-relaxed resize-y`}
              />
            </Field>
          </div>
        </div>

        {error && <p className="px-6 pb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <footer className="flex gap-2 px-6 py-4 justify-end border-t border-gray-100 dark:border-gray-800">
          <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 h-10 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            Закрити
          </button>
          <button type="submit" disabled={saving} className="px-4 h-10 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Збереження…' : mode === 'edit' ? 'Зберегти' : 'Створити'}
          </button>
        </footer>
      </form>
    </dialog>
  );
});

export default ProductForm;

const INPUT = 'w-full h-10 rounded-lg px-3 bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-gray-400 dark:text-gray-500">{hint}</span>}
    </label>
  );
}
