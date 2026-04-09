'use client';

import { useRef, useState } from 'react';
import { updateProduct } from '@/app/actions/products';

type Product = {
  id: number;
  header: string;
  picture: string | null;
  id_sort?: number | null;
};

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
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog?page=1&limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        className="w-full max-w-md rounded-2xl shadow-2xl bg-white dark:bg-gray-900 p-0 backdrop:bg-black/40"
        onClick={(e) => { if (e.target === dialogRef.current) close(); }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Сортування товарів</h3>
          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-1">
          {fetching ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Завантаження…</p>
          ) : items.map((p, i) => (
            <div
              key={p.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(e, i)}
              onDrop={onDrop}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-grab active:cursor-grabbing select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-gray-400 dark:text-gray-500 text-sm w-5 shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <circle cx="4" cy="3" r="1.2"/><circle cx="10" cy="3" r="1.2"/>
                  <circle cx="4" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/>
                  <circle cx="4" cy="11" r="1.2"/><circle cx="10" cy="11" r="1.2"/>
                </svg>
              </span>
              {p.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.picture} alt={p.header} width={36} height={36} className="rounded-lg object-contain bg-white dark:bg-gray-900 shrink-0" style={{ width: 36, height: 36 }} />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />
              )}
              <span className="text-sm text-gray-800 dark:text-gray-200 truncate flex-1">{p.header}</span>
              <span className="text-xs text-gray-400 shrink-0">{i + 1}</span>
            </div>
          ))}
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
