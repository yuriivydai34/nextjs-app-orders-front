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

type Payment = {
  id: number;
  order_id: string;
  currency: string;
  amount: number;
  status: string;
  ttn: string | null;
  createdAt: number;
  updatedAt: string;
  cashier_check: { id?: string; message?: string } | null;
  full_name?: string | null;
  email?: string | null;
  number?: string | null;
  comment?: string | null;
  payment_method?: string | null;
  url_payment?: string | null;
  type_delivery?: string | null;
  delivery_description?: Record<string, unknown> | null;
  delivery_address?: string | null;
  delivery_payment?: number | null;
  is_delivery_payment?: boolean;
  catalog_list_id: CatalogItem[];
};

const STATUS_LABELS: Record<string, string> = {
  WAITING:   'Очікування',
  WORK:      'Оплачено',
  CANCELED:  'Скасовано',
  COMPLETED: 'Виконано',
};

const STATUS_STYLES: Record<string, string> = {
  WAITING:   'bg-yellow-100 text-yellow-700',
  WORK:      'bg-blue-100 text-blue-700',
  CANCELED:  'bg-red-100 text-red-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

const DELIVERY_LABELS: Record<string, string> = {
  MAIL:    'Нова Пошта',
  UKRMAIL: 'Укрпошта',
};

const JUICE_LABELS: Record<string, string> = {
  APPLE:           'Яблучний',
  APPLEGRAPE:      'Виноградно-яблучний',
  CARROTAPPLE:     'Морквяно-яблучний',
  PEARAPPLE:       'Грушево-яблучний',
  STRAWBERRYAPPLE: 'Полунично-яблучний',
};

function getDeliveryAddress(type: string | null | undefined, desc: Record<string, unknown> | null | undefined): string | null {
  if (!desc) return null;
  if (type === 'MAIL') return (desc.ShortAddress as string) ?? null;
  if (type === 'UKRMAIL') {
    const city = desc.CITY_UA as string;
    const addr = desc.ADDRESS as string;
    return [city, addr].filter(Boolean).join(', ') || null;
  }
  return null;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-44 shrink-0 text-gray-400 dark:text-gray-500">{label}</span>
      <span className="text-gray-800 dark:text-gray-200 break-all">{children}</span>
    </div>
  );
}

export default function OrderDetailsModal({ payment }: { payment: Payment }) {
  const ref = useRef<HTMLDialogElement>(null);

  const createdDate = new Date(payment.createdAt).toLocaleString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const deliveryAddress = getDeliveryAddress(payment.type_delivery, payment.delivery_description);
  const checkId = payment.cashier_check?.id;

  return (
    <>
      <button
        onClick={() => ref.current?.showModal()}
        title="Деталі замовлення"
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z" stroke="#979797" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 16.8917C12.9417 16.8917 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 10 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8917 10 16.8917Z" stroke="#979797" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <dialog
        ref={ref}
        onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
        className="rounded-xl bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-2xl"
      >
        <header className="flex items-center justify-between py-4 px-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Деталі замовлення</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{payment.order_id}</p>
          </div>
          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[payment.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABELS[payment.status] ?? payment.status}
          </span>
        </header>

        <div className="px-6 py-5 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">

          {/* Customer */}
          <section className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Клієнт</p>
            {payment.full_name   && <Row label="Ім'я">{payment.full_name}</Row>}
            {payment.email       && <Row label="Email">{payment.email}</Row>}
            {payment.number      && <Row label="Телефон">{payment.number}</Row>}
            {payment.comment     && <Row label="Коментар">{payment.comment}</Row>}
          </section>

          {/* Payment */}
          <section className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Оплата</p>
            <Row label="Сума">{payment.amount.toLocaleString()} {payment.currency}</Row>
            {payment.payment_method && <Row label="Метод оплати">{payment.payment_method}</Row>}
            {payment.url_payment && (
              <Row label="Посилання на оплату">
                <a href={payment.url_payment} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">{payment.url_payment}</a>
              </Row>
            )}
            {checkId && (
              <Row label="Чек">
                <a href={`https://check.checkbox.ua/${checkId}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{checkId}</a>
              </Row>
            )}
            {payment.cashier_check?.message && !checkId && (
              <Row label="Чек">{payment.cashier_check.message}</Row>
            )}
          </section>

          {/* Delivery */}
          <section className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Доставка</p>
            {payment.type_delivery && (
              <Row label="Тип доставки">{DELIVERY_LABELS[payment.type_delivery] ?? payment.type_delivery}</Row>
            )}
            {deliveryAddress && <Row label="Адреса">{deliveryAddress}</Row>}
            {payment.delivery_address && <Row label="Адреса (введена)">{payment.delivery_address}</Row>}
            {payment.ttn && <Row label="ТТН">{payment.ttn}</Row>}
            {payment.delivery_payment != null && (
              <Row label="Вартість доставки">{payment.delivery_payment} грн</Row>
            )}
            {payment.is_delivery_payment != null && (
              <Row label="Оплата доставки">{payment.is_delivery_payment ? 'Так' : 'Ні'}</Row>
            )}
          </section>

          {/* Meta */}
          <section className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Інформація</p>
            <Row label="Дата створення">{createdDate}</Row>
            <Row label="ID платежу">{String(payment.id)}</Row>
          </section>

          {/* Products */}
          {payment.catalog_list_id?.length > 0 && (
            <section className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Товари</p>
              <div className="rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500">
                      <th className="text-left px-3 py-2 font-medium">Назва</th>
                      <th className="text-left px-3 py-2 font-medium">Тип соку</th>
                      <th className="text-right px-3 py-2 font-medium">К-сть</th>
                      <th className="text-right px-3 py-2 font-medium">Ціна</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payment.catalog_list_id.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{item.model_catalog.header}</td>
                        <td className="px-3 py-2 text-gray-500">
                          {item.model_catalog.type_juice ? (JUICE_LABELS[item.model_catalog.type_juice] ?? item.model_catalog.type_juice) : '—'}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{item.count}</td>
                        <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                          {item.model_catalog.is_discount
                            ? `${item.model_catalog.price_discount} грн`
                            : `${item.model_catalog.price} грн`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        <footer className="flex justify-end px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => ref.current?.close()}
            className="px-4 h-10 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Закрити
          </button>
        </footer>
      </dialog>
    </>
  );
}
