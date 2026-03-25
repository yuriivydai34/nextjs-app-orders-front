'use client';

import { useRef } from 'react';
import Image from 'next/image';

const statusLabels: Record<string, string> = {
  WAITING:   'Очікує',
  WORK:      'В роботі',
  CANCELED:  'Скасовано',
  COMPLETED: 'Виконано',
};

const statusStyles: Record<string, string> = {
  WAITING:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  WORK:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELED:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

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

type Props = {
  id: number;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  ttn: string;
  createdAt: number;
  updatedAt: string;
  cashier_check: { id?: string; message?: string } | null;
  catalog_list_id: CatalogItem[];
};

export default function ViewOrderModal(props: Props) {
  const { id, order_id, amount, currency, status, ttn, createdAt, updatedAt, cashier_check, catalog_list_id } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);

  function open() { dialogRef.current?.showModal(); }
  function close() { dialogRef.current?.close(); }

  const statusCls = statusStyles[status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';

  const total = catalog_list_id.reduce((sum, item) => {
    const price = item.model_catalog.is_discount ? item.model_catalog.price_discount : item.model_catalog.price;
    return sum + price * item.count;
  }, 0);

  return (
    <>
      <button
        onClick={open}
        className="px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        Переглянути
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === dialogRef.current) close(); }}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-md"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Замовлення #{id}</h3>
          <button onClick={close} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">×</button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <Row label="№ замовлення">
            <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{order_id}</span>
          </Row>

          <Row label="Сума">
            <span className="font-medium text-gray-900 dark:text-gray-100">{amount.toLocaleString()} {currency}</span>
          </Row>

          <Row label="Статус">
            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${statusCls}`}>
              {statusLabels[status] ?? status}
            </span>
          </Row>

          <Row label="ТТН">
            {ttn ? (
              <span className="text-gray-700 dark:text-gray-300">{ttn}</span>
            ) : (
              <span className="text-gray-300 dark:text-gray-600">—</span>
            )}
          </Row>

          <Row label="Створено">
            <span className="text-gray-700 dark:text-gray-300">
              {new Date(createdAt * 1000).toLocaleString('uk-UA', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </Row>

          <Row label="Оновлено">
            <span className="text-gray-700 dark:text-gray-300">
              {new Date(updatedAt).toLocaleString('uk-UA', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </Row>

          <Row label="Чек">
            {cashier_check?.id ? (
              <a
                href={`https://check.checkbox.ua/${cashier_check.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
              >
                Переглянути чек
              </a>
            ) : (
              <span className="text-gray-300 dark:text-gray-600">—</span>
            )}
          </Row>
        </div>

        {catalog_list_id.length > 0 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <p className="px-5 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Товари ({catalog_list_id.length})
              </p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-52 overflow-y-auto">
              {catalog_list_id.map((item) => {
                const p = item.model_catalog;
                const price = p.is_discount ? p.price_discount : p.price;
                return (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-2.5">
                    <div className="shrink-0">
                      {p.picture ? (
                        <Image
                          src={p.picture}
                          alt={p.header}
                          width={40}
                          height={40}
                          className="rounded-lg object-contain bg-gray-50 dark:bg-gray-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{p.header}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {p.measurement} {p.type_measurement?.toLowerCase() ?? ''}{p.type_packaging ? ` · ${p.type_packaging}` : ''}
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
            <div className="flex justify-end px-5 py-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Разом: {total} ₴</span>
            </div>
          </>
        )}

        <div className="flex justify-end px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Закрити
          </button>
        </div>
      </dialog>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 pt-0.5">{label}</span>
      <div className="text-xs text-right">{children}</div>
    </div>
  );
}
