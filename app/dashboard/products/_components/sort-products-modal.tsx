'use client';

import { useRef, useState } from 'react';
import { updateProduct } from '@/app/actions/products';
import { apiFetch } from '@/app/lib/api';

type Product = {
  id: number;
  header: string;
  picture: string | null;
  id_sort?: number | null;
  is_active?: boolean;
};

// The app lays the catalog out two cards to a row, left to right, row by row
// (app-mobile catalog_screen.dart, a Wrap of half-width cards). The dialog
// uses the same grid, so the first row here is the first row on the phone.
const COLUMNS = 2;

export default function SortProductsModal({ onSaved }: { onSaved: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const dragIndex = useRef<number | null>(null);

  async function open() {
    setError(null);
    setFetching(true);
    dialogRef.current?.showModal();
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog?page=1&limit=1000`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const sorted = [...(data.data ?? [])].sort((a, b) => (a.id_sort ?? 0) - (b.id_sort ?? 0));
      setItems(sorted);
    } catch {
      setError('Не вдалося завантажити товари.');
    } finally {
      setFetching(false);
    }
  }

  function close() {
    dialogRef.current?.close();
  }

  function onDragStart(index: number) {
    dragIndex.current = index;
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === index) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    dragIndex.current = index;
    setItems(next);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    dragIndex.current = null;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        items.map((p, i) => updateProduct(p.id, { id_sort: i + 1 }))
      );
      onSaved();
      close();
    } catch {
      setError('Не вдалося зберегти порядок.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={open}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        Змінити порядок
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-xl rounded-2xl shadow-2xl bg-white dark:bg-gray-900 p-0 backdrop:bg-black/40"
        onClick={(e) => { if (e.target === dialogRef.current) close(); }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Сортування товарів</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Як у застосунку: по {COLUMNS} в ряд, зліва направо. Перетягніть картку на нове місце.</p>
          </div>
          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 max-h-[65vh] overflow-y-auto">
          {fetching ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Завантаження…</p>
          ) : (
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}>
              {items.map((p, i) => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={(e) => onDragOver(e, i)}
                  onDrop={onDrop}
                  title={p.is_active === false ? 'Прихований — у застосунку не показується' : undefined}
                  className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 cursor-grab active:cursor-grabbing select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    p.is_active === false ? 'opacity-40' : ''
                  }`}
                >
                  <span className="absolute top-1.5 left-2 text-[11px] text-gray-400">
                    {i + 1}
                    <span className="ml-1 text-gray-300 dark:text-gray-600">· ряд {Math.floor(i / COLUMNS) + 1}</span>
                  </span>
                  {p.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.picture} alt={p.header} className="mt-4 w-24 h-24 rounded-lg object-contain bg-white dark:bg-gray-900" />
                  ) : (
                    <div className="mt-4 w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  )}
                  <span className="text-xs text-center text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">{p.header}</span>
                  {p.is_active === false && <span className="text-[10px] text-gray-500">Приховано</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="px-6 pb-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {saving ? 'Збереження…' : 'Зберегти'}
          </button>
        </div>
      </dialog>
    </>
  );
}
