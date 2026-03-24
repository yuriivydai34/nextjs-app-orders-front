import { cookies } from 'next/headers';
import Link from 'next/link';

type Customer = {
  id: string | number;
  full_name?: string;
  email?: string;
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
    error = 'Could not load customers.';
  }

  const customers = result?.data ?? [];
  const total = result?.total ?? 0;
  const limit = result?.limit ?? 20;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Клієнти</h2>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>

      ) : customers.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Клієнтів не знайдено.</p>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Ім'я</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{String(c.id)}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{c.full_name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.email ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <PaginationLink href={`?page=${page - 1}`} disabled={page <= 1}>
                ← Назад
              </PaginationLink>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === 'ellipsis' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                  ) : (
                    <PaginationLink key={p} href={`?page=${p}`} active={p === page}>
                      {p}
                    </PaginationLink>
                  )
                )}
              <PaginationLink href={`?page=${page + 1}`} disabled={page >= totalPages}>
                Далі →
              </PaginationLink>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PaginationLink({
  href,
  children,
  active,
  disabled,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  const base = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
  if (disabled) {
    return <span className={`${base} text-gray-300 dark:text-gray-600 cursor-not-allowed`}>{children}</span>;
  }
  if (active) {
    return <span className={`${base} bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900`}>{children}</span>;
  }
  return (
    <Link href={href} className={`${base} text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800`}>
      {children}
    </Link>
  );
}
