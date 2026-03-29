'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function ReportDatePicker({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('date', e.target.value);
    } else {
      params.delete('date');
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <input
      type="date"
      defaultValue={value}
      onChange={handleChange}
      className="px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
    />
  );
}
