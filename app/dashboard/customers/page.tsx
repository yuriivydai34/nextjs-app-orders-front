import { cookies } from 'next/headers';
import Link from 'next/link';
import CustomerActions from './_components/customer-actions';

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
  [key: string]: unknown;
};

type CustomersResponse = {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
};

async function getCustomers(token: string, page: number): Promise<CustomersResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts?page=${page}&limit=20`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

const COLS = ['ID', 'Компанія', 'Користувач', 'Роль', 'Банк', 'Адреса', ''];

export default async function CustomersPage(props: PageProps<'/dashboard/customers'>) {
  const { page: pageParam } = await props.searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? '';

  let result: CustomersResponse | null = null;
  let error: string | null = null;

  try {
    result = await getCustomers(token, page);
  } catch {
    error = 'Не вдалося завантажити клієнтів.';
  }

  const customers = result?.data ?? [];
  const total = result?.total ?? 0;
  const limit = result?.limit ?? 20;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Клієнти
        {total > 0 && <span className="ml-2 text-sm font-normal text-gray-400">{total}</span>}
      </h2>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Клієнтів не знайдено.</p>
      ) : (
        <>
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-x-auto">
            <table className="min-w-full w-full table-auto">
              <thead>
                <tr>
                  {COLS.map((col, i) => (
                    <th
                      key={i}
                      className={`px-3 h-10 text-left align-middle bg-gray-100 dark:bg-gray-800 whitespace-nowrap text-xs font-semibold text-gray-500 dark:text-gray-400
                        ${i === 0 ? 'rounded-l-lg' : ''}
                        ${i === COLS.length - 1 ? 'rounded-r-lg' : ''}
                      `}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="py-3 px-3 align-middle text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {String(c.id)}
                    </td>
                    <td className="py-3 px-3 align-middle" style={{ maxWidth: 180 }}>
                      <div className="flex flex-col gap-1">
                        {c.company_name && (
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.company_name}</span>
                        )}
                        {c.company_code && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">ЄДРПОУ: {c.company_code}</span>
                        )}
                        {c.company_type && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">{c.company_type}</span>
                        )}
                        {!c.company_name && !c.company_code && (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 align-middle" style={{ maxWidth: 200 }}>
                      <div className="flex flex-col gap-1">
                        {c.full_name && (
                          <span className="text-sm text-gray-900 dark:text-gray-100">{c.full_name}</span>
                        )}
                        {c.email && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{c.email}</span>
                        )}
                        {c.number && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{c.number}</span>
                        )}
                        {!c.full_name && !c.email && !c.number && (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 align-middle text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap" style={{ maxWidth: 150 }}>
                      {c.role ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="py-3 px-3 align-middle" style={{ maxWidth: 200 }}>
                      <div className="flex flex-col gap-1">
                        {c.bank_name && (
                          <span className="text-sm text-gray-700 dark:text-gray-300">{c.bank_name}</span>
                        )}
                        {c.bank_account && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{c.bank_account}</span>
                        )}
                        {c.bank_mfo && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">МФО: {c.bank_mfo}</span>
                        )}
                        {!c.bank_name && !c.bank_account && !c.bank_mfo && (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 align-middle text-xs text-gray-600 dark:text-gray-400" style={{ maxWidth: 200 }}>
                      {(() => {
                        const parts = [c.region, c.city, c.address].filter(Boolean);
                        return parts.length > 0
                          ? <span className="line-clamp-3">{parts.join(', ')}</span>
                          : <span className="text-gray-300 dark:text-gray-600">—</span>;
                      })()}
                    </td>
                    <td className="py-3 px-3 align-middle">
                      <CustomerActions customer={c} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} з {total}
            </p>
            <div className="flex items-center gap-1">
              <PaginationLink href={`?page=${page - 1}`} disabled={page <= 1}>← Назад</PaginationLink>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === 'ellipsis' ? (
                    <span key={`e-${i}`} className="px-2 text-gray-400">…</span>
                  ) : (
                    <PaginationLink key={p} href={`?page=${p}`} active={p === page}>{p}</PaginationLink>
                  )
                )}
              <PaginationLink href={`?page=${page + 1}`} disabled={page >= totalPages}>Далі →</PaginationLink>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PaginationLink({
  href, children, active, disabled,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  const base = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
  if (disabled) return <span className={`${base} text-gray-300 dark:text-gray-600 cursor-not-allowed`}>{children}</span>;
  if (active) return <span className={`${base} bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900`}>{children}</span>;
  return <Link href={href} className={`${base} text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800`}>{children}</Link>;
}
