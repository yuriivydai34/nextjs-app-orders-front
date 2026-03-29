import { cookies } from 'next/headers';
import ExportButton from '../orders/_components/export-button';

export default async function ReportPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? '';

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Звіти</h2>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Експорт замовлень</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Оберіть дату та завантажте звіт у форматі .xlsx</p>
          <ExportButton token={token} />
        </div>
      </div>
    </div>
  );
}
