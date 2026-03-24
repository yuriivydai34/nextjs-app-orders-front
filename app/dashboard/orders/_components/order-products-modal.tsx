'use client';

import { useRef } from 'react';
import Image from 'next/image';

type CatalogItem = {
  id: number;
  count: number;
  model_catalog: {
    id: number;
    header: string;
    price: number;
    price_discount: number;
    is_discount: boolean;
    measurement: number;
    type_measurement: string | null;
    type_packaging: string | null;
    picture: string | null;
  };
};

export default function OrderProductsModal({
  orderId,
  items,
}: {
  orderId: number;
  items: CatalogItem[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const total = items.reduce((sum, item) => {
    const price = item.model_catalog.is_discount
      ? item.model_catalog.price_discount
      : item.model_catalog.price;
    return sum + price * item.count;
  }, 0);

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        Products ({items.length})
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current?.close(); }}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-lg"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Order #{orderId} — Products
          </h3>
          <button
            onClick={() => dialogRef.current?.close()}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[60vh] overflow-y-auto">
          {items.map((item) => {
            const p = item.model_catalog;
            const price = p.is_discount ? p.price_discount : p.price;
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                <div className="shrink-0">
                  {p.picture ? (
                    <Image
                      src={p.picture}
                      alt={p.header}
                      width={48}
                      height={48}
                      className="rounded-lg object-contain bg-gray-50 dark:bg-gray-800"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{p.header}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {p.measurement} {p.type_measurement?.toLowerCase() ?? ''} · {p.type_packaging}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{price} ₴</p>
                  <p className="text-xs text-gray-400">× {item.count}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total: {total} ₴</span>
        </div>
      </dialog>
    </>
  );
}
