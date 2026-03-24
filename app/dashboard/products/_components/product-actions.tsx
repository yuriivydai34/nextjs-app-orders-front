'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { updateProduct, deleteProduct } from '@/app/actions/products';

type Product = {
  id: number;
  header: string;
  price: number;
  price_discount: number;
  is_discount: boolean;
  type_product: string | null;
  type_packaging: string | null;
  measurement: number;
  type_measurement: string | null;
  article: string | null;
  picture: string | null;
  description?: string | null;
  type_juice?: string | null;
  type_apple?: string | null;
  type_vinegar?: string | null;
  shipment_weight?: number | null;
  shipment_length?: number | null;
  shipment_width?: number | null;
  shipment_height?: number | null;
};

export default function ProductActions({ product }: { product: Product }) {
  const viewRef = useRef<HTMLDialogElement>(null);
  const editRef = useRef<HTMLDialogElement>(null);
  const deleteRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      header: form.get('header') as string,
      price: Number(form.get('price')),
      price_discount: Number(form.get('price_discount')),
      is_discount: form.get('is_discount') === 'true',
      article: form.get('article') as string,
      measurement: Number(form.get('measurement')),
    };
    setError(null);
    startTransition(async () => {
      try {
        await updateProduct(product.id, data);
        editRef.current?.close();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProduct(product.id);
        deleteRef.current?.close();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  }

  return (
    <>
      {/* Buttons */}
      <div className="flex items-center gap-1.5">
        <ActionBtn onClick={() => viewRef.current?.showModal()}>Переглянути</ActionBtn>
        <ActionBtn onClick={() => { setError(null); editRef.current?.showModal(); }}>Редагувати</ActionBtn>
        <ActionBtn
          onClick={() => { setError(null); deleteRef.current?.showModal(); }}
          variant="danger"
        >
          Видалити
        </ActionBtn>
      </div>

      {/* View Modal */}
      <dialog
        ref={viewRef}
        onClick={(e) => { if (e.target === viewRef.current) viewRef.current?.close(); }}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-lg"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Товар #{product.id}</h3>
          <button onClick={() => viewRef.current?.close()} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">×</button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {product.picture && (
            <Image
              src={product.picture}
              alt={product.header}
              width={80}
              height={80}
              className="rounded-lg object-contain bg-gray-50 dark:bg-gray-800"
            />
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ViewField label="Назва" value={product.header} wide />
            <ViewField label="Артикул" value={product.article} />
            <ViewField label="Ціна" value={`${product.price} ₴`} />
            <ViewField label="Ціна зі знижкою" value={product.is_discount ? `${product.price_discount} ₴` : '—'} />
            <ViewField label="Об'єм" value={`${product.measurement} ${product.type_measurement?.toLowerCase() ?? ''}`} />
            <ViewField label="Тип" value={product.type_product} />
            <ViewField label="Упаковка" value={product.type_packaging} />
            <ViewField label="Тип соку" value={product.type_juice} />
            {product.shipment_weight != null && (
              <ViewField label="Вага відправлення (кг)" value={String(product.shipment_weight)} />
            )}
            {product.description && (
              <div className="col-span-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Опис</p>
                <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </dialog>

      {/* Edit Modal */}
      <dialog
        ref={editRef}
        onClick={(e) => { if (e.target === editRef.current) editRef.current?.close(); }}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-sm"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Редагувати товар #{product.id}</h3>
          <button onClick={() => editRef.current?.close()} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">×</button>
        </div>
        <form onSubmit={handleEditSubmit} className="px-5 py-4 space-y-3">
          <Field label="Назва" name="header" defaultValue={product.header} />
          <Field label="Артикул" name="article" defaultValue={product.article ?? ''} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ціна (₴)" name="price" type="number" defaultValue={String(product.price)} />
            <Field label="Ціна зі знижкою (₴)" name="price_discount" type="number" defaultValue={String(product.price_discount)} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Знижка активна</label>
            <select
              name="is_discount"
              defaultValue={String(product.is_discount)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
            >
              <option value="false">Ні</option>
              <option value="true">Так</option>
            </select>
          </div>
          <Field label={`Об'єм (${product.type_measurement?.toLowerCase() ?? ''})`} name="measurement" type="number" defaultValue={String(product.measurement)} />

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => editRef.current?.close()} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Скасувати</button>
            <button type="submit" disabled={isPending} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-50 transition-colors">
              {isPending ? 'Збереження…' : 'Зберегти'}
            </button>
          </div>
        </form>
      </dialog>

      {/* Delete Modal */}
      <dialog
        ref={deleteRef}
        onClick={(e) => { if (e.target === deleteRef.current) deleteRef.current?.close(); }}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-sm"
      >
        <div className="px-5 py-6 space-y-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Видалити товар?</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">{product.header}</span> буде видалено назавжди.
          </p>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => deleteRef.current?.close()} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Скасувати</button>
            <button onClick={handleDelete} disabled={isPending} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
              {isPending ? 'Видалення…' : 'Видалити'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

function ActionBtn({ onClick, children, variant }: { onClick: () => void; children: React.ReactNode; variant?: 'danger' }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
        variant === 'danger'
          ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      {children}
    </button>
  );
}

function ViewField({ label, value, wide }: { label: string; value: string | null | undefined; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-gray-800 dark:text-gray-200 text-sm">{value ?? '—'}</p>
    </div>
  );
}

function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
      />
    </div>
  );
}
