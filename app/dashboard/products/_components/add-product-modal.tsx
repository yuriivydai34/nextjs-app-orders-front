'use client';

import { useRef, useState, useTransition } from 'react';
import { createProduct } from '@/app/actions/products';

const TYPE_PRODUCTS = ['JUICE', 'VINEGAR', 'OTHER'];
const TYPE_PACKAGINGS = ['BAGINBOX', 'GLASS', 'BOTTLE', 'OTHER'];
const TYPE_MEASUREMENTS = ['LITER', 'ML', 'KG', 'G'];
const TYPE_JUICES = ['APPLE', 'STRAWBERRYAPPLE', 'APPLEGRAPE', 'OTHER'];

export default function AddProductModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function open() {
    setError(null);
    formRef.current?.reset();
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      header: form.get('header') as string,
      description: form.get('description') as string,
      price: Number(form.get('price')),
      price_discount: Number(form.get('price_discount')),
      is_discount: form.get('is_discount') === 'true',
      measurement: Number(form.get('measurement')),
      type_measurement: form.get('type_measurement') as string,
      type_product: form.get('type_product') as string,
      type_packaging: form.get('type_packaging') as string,
      type_juice: form.get('type_juice') || null,
      article: form.get('article') as string,
      picture: form.get('picture') as string || null,
    };
    setError(null);
    startTransition(async () => {
      try {
        await createProduct(data);
        close();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  }

  return (
    <>
      <button
        onClick={open}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
      >
        + Додати товар
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === dialogRef.current) close(); }}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-lg"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Новий товар</h3>
          <button onClick={close} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">×</button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-5 py-4 space-y-3 max-h-[75vh] overflow-y-auto">
          <Field label="Назва *" name="header" required />
          <Field label="Артикул" name="article" />
          <Field label="URL фото" name="picture" placeholder="https://..." />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ціна (₴) *" name="price" type="number" required />
            <Field label="Ціна зі знижкою (₴)" name="price_discount" type="number" defaultValue="0" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Знижка активна</label>
            <select name="is_discount" defaultValue="false" className={selectCls}>
              <option value="false">Ні</option>
              <option value="true">Так</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Об'єм *" name="measurement" type="number" required />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Одиниця *</label>
              <select name="type_measurement" required className={selectCls}>
                {TYPE_MEASUREMENTS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Тип товару *</label>
              <select name="type_product" required className={selectCls}>
                {TYPE_PRODUCTS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Упаковка *</label>
              <select name="type_packaging" required className={selectCls}>
                {TYPE_PACKAGINGS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Тип соку</label>
            <select name="type_juice" className={selectCls}>
              <option value="">— немає —</option>
              {TYPE_JUICES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Опис</label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={close} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Скасувати
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-50 transition-colors">
              {isPending ? 'Створення…' : 'Створити'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

const selectCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100';

function Field({ label, name, type = 'text', defaultValue, required, placeholder }: {
  label: string; name: string; type?: string;
  defaultValue?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
      />
    </div>
  );
}
