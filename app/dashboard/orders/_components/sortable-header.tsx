'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function SortableHeader({
  column,
  label,
}: {
  column: string;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sortBy') ?? 'createdAt';
  const currentOrder = searchParams.get('sortOrder') ?? 'DESC';

  const isActive = currentSort === column;
  const nextOrder = isActive && currentOrder === 'DESC' ? 'ASC' : 'DESC';

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', column);
    params.set('sortOrder', nextOrder);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
    >
      {label}
      <span className="text-xs leading-none">
        {isActive ? (currentOrder === 'DESC' ? '↓' : '↑') : <span className="opacity-30">↕</span>}
      </span>
    </button>
  );
}
