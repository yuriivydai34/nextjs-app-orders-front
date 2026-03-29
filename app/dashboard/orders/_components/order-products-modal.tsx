'use client';

import { useRef } from 'react';

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
    type_juice: string | null;
    picture: string | null;
    shipment_weight: number | null;
    shipment_length: number | null;
    shipment_width: number | null;
    shipment_height: number | null;
  };
};

const JUICE_LABELS: Record<string, string> = {
  APPLE:          'Яблучний',
  APPLEGRAPE:     'Яблучно-виноградний',
  CARROTAPPLE:    'Морквяно-яблучний',
  PEARAPPLE:      'Грушево-яблучний',
  STRAWBERRYAPPLE:'Полунично-яблучний',
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
        Товари ({items.length})
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current?.close(); }}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-5xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Замовлення #{orderId} — Товари
          </h3>
          <button
            onClick={() => dialogRef.current?.close()}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr>
                {['Картинка','Назва','Кількість','Довжина','Ширина','Висота','Вага','Ціна','Тип соку'].map((h) => (
                  <th
                    key={h}
                    className="px-3 h-10 text-left align-middle bg-gray-100 dark:bg-gray-800 whitespace-nowrap text-xs font-semibold text-gray-500 dark:text-gray-400 first:rounded-l-lg last:rounded-r-lg"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const p = item.model_catalog;
                const price = p.is_discount ? p.price_discount : p.price;
                return (
                  <tr key={item.id} className="border-b last:border-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="py-2 px-3 align-middle">
                      {p.picture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.picture}
                          alt={p.header}
                          width={120}
                          height={120}
                          style={{ objectFit: 'contain', width: 120, height: 120 }}
                          className="rounded-lg bg-gray-50 dark:bg-gray-800"
                        />
                      ) : (
                        <div className="w-[120px] h-[120px] rounded-lg bg-gray-100 dark:bg-gray-800" />
                      )}
                    </td>
                    <td className="py-2 px-3 align-middle text-gray-900 dark:text-gray-100 max-w-[200px]">
                      <div className="line-clamp-2">{p.header}</div>
                    </td>
                    <td className="py-2 px-3 align-middle text-gray-700 dark:text-gray-300">{item.count}</td>
                    <td className="py-2 px-3 align-middle text-gray-700 dark:text-gray-300 whitespace-nowrap">{p.shipment_length ?? '—'} см</td>
                    <td className="py-2 px-3 align-middle text-gray-700 dark:text-gray-300 whitespace-nowrap">{p.shipment_width ?? '—'} см</td>
                    <td className="py-2 px-3 align-middle text-gray-700 dark:text-gray-300 whitespace-nowrap">{p.shipment_height ?? '—'} см</td>
                    <td className="py-2 px-3 align-middle text-gray-700 dark:text-gray-300 whitespace-nowrap">{p.shipment_weight ?? '—'} кг</td>
                    <td className="py-2 px-3 align-middle font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{price} ₴</td>
                    <td className="py-2 px-3 align-middle text-gray-600 dark:text-gray-400">
                      {p.type_juice ? (JUICE_LABELS[p.type_juice] ?? p.type_juice) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">{items.length} поз.</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Разом: {total} ₴</span>
        </div>
      </dialog>
    </>
  );
}
