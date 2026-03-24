'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';

const navItems = [
  { href: '/dashboard', label: 'Огляд', icon: '▦' },
  { href: '/dashboard/orders', label: 'Замовлення', icon: '📋' },
  { href: '/dashboard/customers', label: 'Клієнти', icon: '👥' },
  { href: '/dashboard/products', label: 'Товари', icon: '📦' },
  { href: '/dashboard/settings', label: 'Налаштування', icon: '⚙' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <Image src="/logo_gaderia.png" alt="Gaderia" width={120} height={32} className="object-contain" />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <span className="text-base leading-none">↩</span>
            Вийти
          </button>
        </form>
      </div>
    </aside>
  );
}
