'use client';

import { useRef, useState, useTransition } from 'react';
import { updateCustomer } from '@/app/actions/customers';

type Customer = {
  id: string | number;
  full_name?: string | null;
  email?: string | null;
  number?: string | null;
  role?: string | null;
  name_company?: string | null;
  code_company?: string | number | null;
  type_account_subject?: string | null;
  name_bank?: string | null;
  number_bank?: string | null;
  region?: string | null;
  settlement?: string | null;
  address?: string | null;
};

export default function CustomerActions({ customer }: { customer: Customer }) {
  const editRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      full_name:            form.get('full_name') as string,
      email:                form.get('email') as string,
      number:               form.get('number') as string,
      role:                 form.get('role') as string,
      name_company:         form.get('name_company') as string,
      code_company:         form.get('code_company') as string,
      type_account_subject: form.get('type_account_subject') as string,
      name_bank:            form.get('name_bank') as string,
      number_bank:          form.get('number_bank') as string,
      region:               form.get('region') as string,
      settlement:           form.get('settlement') as string,
      address:              form.get('address') as string,
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
                <FloatInput label="Місто" name="settlement" defaultValue={customer.settlement ?? ''} />
                <FloatInput label="Адреса" name="address" defaultValue={customer.address ?? ''} />
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-4 w-1/2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Компанія</p>
                <FloatInput label="Назва компанії" name="name_company" defaultValue={customer.name_company ?? ''} />
                <FloatInput label="ЄДРПОУ" name="code_company" defaultValue={customer.code_company != null ? String(customer.code_company) : ''} />
                <FloatInput label="Тип компанії" name="type_account_subject" defaultValue={customer.type_account_subject ?? ''} />

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">Банк</p>
                <FloatInput label="Назва банку" name="name_bank" defaultValue={customer.name_bank ?? ''} />
                <FloatInput label="Рахунок" name="number_bank" defaultValue={customer.number_bank ?? ''} />
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
