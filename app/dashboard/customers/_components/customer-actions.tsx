'use client';

import { useRef, useState, useTransition } from 'react';
import { updateCustomer, deleteCustomer } from '@/app/actions/customers';

type Customer = {
  id: string | number;
  full_name?: string | null;
  email?: string | null;
  number?: string | null;
  role?: string | null;
  company_name?: string | null;
  company_code?: string | null;
  company_type?: string | null;
  bank_name?: string | null;
  bank_account?: string | null;
  bank_mfo?: string | null;
  region?: string | null;
  city?: string | null;
  address?: string | null;
};

export default function CustomerActions({ customer }: { customer: Customer }) {
  const editRef = useRef<HTMLDialogElement>(null);
  const deleteRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      full_name:    form.get('full_name') as string,
      email:        form.get('email') as string,
      number:       form.get('number') as string,
      role:         form.get('role') as string,
      company_name: form.get('company_name') as string,
      company_code: form.get('company_code') as string,
      company_type: form.get('company_type') as string,
      bank_name:    form.get('bank_name') as string,
      bank_account: form.get('bank_account') as string,
      bank_mfo:     form.get('bank_mfo') as string,
      region:       form.get('region') as string,
      city:         form.get('city') as string,
      address:      form.get('address') as string,
    };
    setError(null);
    startTransition(async () => {
      try {
        await updateCustomer(customer.id, data);
        editRef.current?.close();
        window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Помилка збереження');
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCustomer(customer.id);
        deleteRef.current?.close();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Помилка видалення');
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-3">
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
        className="rounded-xl bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-3xl"
      >
        <form onSubmit={handleEditSubmit}>
          <header className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Редагування клієнта</p>
          </header>

          <div className="flex flex-1 flex-col gap-3 px-6 py-4">
            <div className="flex gap-4">
              {/* Left column */}
              <div className="flex flex-col gap-4 w-1/2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Особисті дані</p>
                <FloatInput label="Повне ім'я" name="full_name" defaultValue={customer.full_name ?? ''} />
                <FloatInput label="Email" name="email" type="email" defaultValue={customer.email ?? ''} />
                <FloatInput label="Телефон" name="number" defaultValue={customer.number ?? ''} />
                <FloatInput label="Роль" name="role" defaultValue={customer.role ?? ''} />

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">Адреса</p>
                <FloatInput label="Область" name="region" defaultValue={customer.region ?? ''} />
                <FloatInput label="Місто" name="city" defaultValue={customer.city ?? ''} />
                <FloatInput label="Адреса" name="address" defaultValue={customer.address ?? ''} />
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-4 w-1/2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Компанія</p>
                <FloatInput label="Назва компанії" name="company_name" defaultValue={customer.company_name ?? ''} />
                <FloatInput label="ЄДРПОУ" name="company_code" defaultValue={customer.company_code ?? ''} />
                <FloatInput label="Тип компанії" name="company_type" defaultValue={customer.company_type ?? ''} />

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">Банк</p>
                <FloatInput label="Назва банку" name="bank_name" defaultValue={customer.bank_name ?? ''} />
                <FloatInput label="Рахунок" name="bank_account" defaultValue={customer.bank_account ?? ''} />
                <FloatInput label="МФО" name="bank_mfo" defaultValue={customer.bank_mfo ?? ''} />
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
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Видалити клієнта?</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">{customer.full_name ?? customer.email ?? String(customer.id)}</span> буде видалено назавжди.
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
  label, name, defaultValue, type = 'text', required, className,
}: {
  label: string; name: string; defaultValue?: string;
  type?: string; required?: boolean; className?: string;
}) {
  return (
    <div className={`relative mt-5 ${className ?? 'w-full'}`}>
      <div className="relative w-full inline-flex items-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 h-10 rounded-lg px-3 gap-1 focus-within:ring-2 focus-within:ring-blue-500 transition-colors">
        <label className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none transition-all duration-150 -top-5 text-xs">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          placeholder=" "
          className="peer w-full bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-transparent h-full pt-1"
        />
      </div>
    </div>
  );
}
