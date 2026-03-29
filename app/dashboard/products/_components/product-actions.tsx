'use client';

import { useRef, useState, useTransition } from 'react';
import { updateProduct, deleteProduct } from '@/app/actions/products';

type Product = {
  id: number;
  header: string;
  price: number;
  price_discount: number;
  is_discount: boolean;
  type_product: string | null;
  type_packaging: string | null;
  type_juice: string | null;
  measurement: number;
  type_measurement: string | null;
  article: string | null;
  picture: string | null;
  description?: string | null;
  shipment_weight?: number | null;
  shipment_length?: number | null;
  shipment_width?: number | null;
  shipment_height?: number | null;
};

export default function ProductActions({ product }: { product: Product }) {
  const editRef = useRef<HTMLDialogElement>(null);
  const deleteRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pictureUrl, setPictureUrl] = useState(product.picture ?? '');
  const [showPictureInput, setShowPictureInput] = useState(false);
  const [isDiscount, setIsDiscount] = useState(product.is_discount);

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      header:           form.get('header') as string,
      description:      form.get('description') as string,
      measurement:      Number(form.get('measurement')),
      type_measurement: form.get('type_measurement') as string,
      type_product:     form.get('type_product') as string,
      type_juice:       (form.get('type_juice') as string) || null,
      type_packaging:   form.get('type_packaging') as string,
      shipment_length:  Number(form.get('shipment_length')),
      shipment_width:   Number(form.get('shipment_width')),
      shipment_height:  Number(form.get('shipment_height')),
      shipment_weight:  Number(form.get('shipment_weight')),
      price:            Number(form.get('price')),
      is_discount:      isDiscount,
      price_discount:   Number(form.get('price_discount')),
      picture:          pictureUrl || null,
    };
    setError(null);
    startTransition(async () => {
      try {
        await updateProduct(product.id, data);
        editRef.current?.close();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Помилка збереження');
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProduct(product.id);
        deleteRef.current?.close();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Помилка видалення');
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          onClick={() => { setError(null); editRef.current?.showModal(); }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          title="Редагувати"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z" stroke="#979797" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998" stroke="#979797" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2.5 18.3333H17.5" stroke="#979797" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={() => { setError(null); deleteRef.current?.showModal(); }}
          className="transition-colors"
          title="Видалити"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="#FF0080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169" stroke="#FF0080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664" stroke="#FF0080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.60834 13.75H11.3833" stroke="#FF0080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.91669 10.4167H12.0834" stroke="#FF0080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Edit Modal */}
      <dialog
        ref={editRef}
        onClick={(e) => { if (e.target === editRef.current) editRef.current?.close(); }}
        className="rounded-xl bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-4xl"
      >
        <form id="product-form" onSubmit={handleEditSubmit}>
          <header className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Редагування продукту</p>
          </header>

          <div className="flex flex-1 flex-col gap-3 px-6 py-4">
            <div className="flex gap-4">
              {/* Left column */}
              <div className="flex flex-col gap-4 w-1/2">
                <FloatInput label="Назва" name="header" defaultValue={product.header} required />
                <FloatInput label="Опис" name="description" defaultValue={product.description ?? ''} required />

                <div className="flex gap-4 items-start">
                  <FloatInput label="Міра" name="measurement" type="number" defaultValue={String(product.measurement)} required step="0.1" min="0" className="w-1/2" />
                  <FloatSelect label="Тип міри" name="type_measurement" defaultValue={product.type_measurement ?? ''} required className="w-1/2">
                    <option value="">Оберіть тип міри</option>
                    <option value="KG">Кілограми</option>
                    <option value="LITER">Літри</option>
                  </FloatSelect>
                </div>

                <div className="flex gap-4 items-start">
                  <FloatSelect label="Тип продукту" name="type_product" defaultValue={product.type_product ?? ''} required className="w-1/2">
                    <option value="">Оберіть тип продукту</option>
                    <option value="JUICE">Сік</option>
                    <option value="VINEGAR">Оцет</option>
                    <option value="APPLE">Яблука</option>
                  </FloatSelect>
                  <FloatSelect label="Тип соку" name="type_juice" defaultValue={product.type_juice ?? ''} className="w-1/2">
                    <option value="">Оберіть тип соку</option>
                    <option value="APPLE">Яблучний сік</option>
                    <option value="CARROTAPPLE">Морквяно-яблучний сік</option>
                    <option value="STRAWBERRYAPPLE">Полунично-яблучний сік</option>
                    <option value="PEARAPPLE">Грушево-яблучний сік</option>
                    <option value="APPLEGRAPE">Виноградно-яблучний сік</option>
                  </FloatSelect>
                </div>

                <div className="flex gap-4 items-start">
                  <FloatInput label="Довжина (см)" name="shipment_length" type="number" defaultValue={String(product.shipment_length ?? 0)} required min="0" className="w-1/2" />
                  <FloatInput label="Ширина (см)" name="shipment_width" type="number" defaultValue={String(product.shipment_width ?? 0)} required min="0" className="w-1/2" />
                </div>

                <div className="flex gap-4 items-start">
                  <FloatInput label="Висота (см)" name="shipment_height" type="number" defaultValue={String(product.shipment_height ?? 0)} required min="0" className="w-1/2" />
                  <FloatInput label="Вага (кг)" name="shipment_weight" type="number" defaultValue={String(product.shipment_weight ?? 0)} required min="0" step="0.1" className="w-1/2" />
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-4 w-1/2">
                <FloatSelect label="Тип пакування" name="type_packaging" defaultValue={product.type_packaging ?? ''} required>
                  <option value="">Оберіть тип пакування</option>
                  <option value="GLASS">Скло</option>
                  <option value="BAGINBOX">Коробка</option>
                </FloatSelect>

                <div className="flex gap-4 items-end">
                  <div className="w-2/3">
                    <FloatInput label="Ціна" name="price" type="number" defaultValue={String(product.price)} required min="0" suffix="uah" />
                  </div>
                  <div className="flex items-center gap-2 w-1/3 pb-1">
                    <input
                      type="checkbox"
                      id="is_discount_cb"
                      checked={isDiscount}
                      onChange={(e) => setIsDiscount(e.target.checked)}
                      className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                    />
                    <FloatInput label="Знижка" name="price_discount" type="number" defaultValue={String(product.price_discount)} max="100" min="0" />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm text-gray-500 dark:text-gray-400">Картинка</label>
                  <div className="flex gap-4 items-start">
                    {pictureUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pictureUrl}
                        alt="Picture"
                        width={200}
                        height={200}
                        style={{ objectFit: 'contain', width: 200, height: 200 }}
                        className="rounded-xl bg-gray-50 dark:bg-gray-800"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPictureInput((v) => !v)}
                      className="px-4 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-32"
                    >
                      Змінити
                    </button>
                  </div>
                  {showPictureInput && (
                    <input
                      type="url"
                      value={pictureUrl}
                      onChange={(e) => setPictureUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
          </div>

          <footer className="flex gap-2 px-6 py-4 justify-end border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => editRef.current?.close()}
              className="px-4 h-10 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Закрити
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 h-10 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Збереження…' : 'Зберегти'}
            </button>
          </footer>
        </form>
      </dialog>

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


function FloatInput({
  label, name, defaultValue, type = 'text', required, min, max, step, suffix, className,
}: {
  label: string; name: string; defaultValue?: string;
  type?: string; required?: boolean; min?: string; max?: string; step?: string; suffix?: string; className?: string;
}) {
  return (
    <div className={`relative mt-5 ${className ?? 'w-full'}`}>
      <div className="relative w-full inline-flex items-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 h-10 rounded-lg px-3 gap-1 focus-within:ring-2 focus-within:ring-blue-500 transition-colors">
        <label className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none transition-all duration-150 peer-placeholder-shown:top-1/2 -top-5 text-xs">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          min={min}
          max={max}
          step={step}
          placeholder=" "
          className="peer w-full bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-transparent h-full pt-1"
        />
        {suffix && <span className="text-xs text-gray-400 shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

function FloatSelect({
  label, name, defaultValue, required, children, className,
}: {
  label: string; name: string; defaultValue?: string;
  required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`relative mt-5 ${className ?? 'w-full'}`}>
      <label className="absolute -top-5 left-0 text-xs text-gray-500 pointer-events-none">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          defaultValue={defaultValue}
          required={required}
          className="w-full h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg px-3 pr-8 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors"
        >
          {children}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
