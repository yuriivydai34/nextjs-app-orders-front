'use client';

import { useRef, useState, useTransition } from 'react';
import { deleteProduct } from '@/app/actions/products';
import type { Product } from './product-form';

// The row's buttons. Editing and duplicating open the page's one product form.
export default function ProductActions({
  product, onEdit, onDuplicate, onDeleted,
}: {
  product: Product;
  onEdit: () => void;
  onDuplicate: () => void;
  onDeleted: () => void;
}) {
  const deleteRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProduct(product.id);
        deleteRef.current?.close();
        onDeleted();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Помилка видалення');
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Редагувати">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z" stroke="#979797" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998" stroke="#979797" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2.5 18.3333H17.5" stroke="#979797" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={onDuplicate} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Дублювати — новий товар на основі цього">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="6.5" y="6.5" width="10" height="10" rx="2" stroke="#979797" strokeWidth="1.5" />
            <path d="M13.5 6.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v7A1.5 1.5 0 0 0 5 13.5h1.5" stroke="#979797" strokeWidth="1.5" />
          </svg>
        </button>
        <button onClick={() => { setError(null); deleteRef.current?.showModal(); }} className="transition-colors" title="Видалити">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="#FF0080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169" stroke="#FF0080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664" stroke="#FF0080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.60834 13.75H11.3833" stroke="#FF0080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.91669 10.4167H12.0834" stroke="#FF0080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Delete Modal */}
      <dialog
        ref={deleteRef}
        onClick={(e) => { if (e.target === deleteRef.current) deleteRef.current?.close(); }}
        className="rounded-xl bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-sm"
      >
        <div className="px-6 py-6 space-y-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Видалити товар?</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">{product.header}</span> буде видалено назавжди.
          </p>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => deleteRef.current?.close()} className="px-4 h-10 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Скасувати</button>
            <button onClick={handleDelete} disabled={isPending} className="px-4 h-10 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
              {isPending ? 'Видалення…' : 'Видалити'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
