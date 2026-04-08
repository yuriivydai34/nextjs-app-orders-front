'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/app/actions/auth';

const navItems = [
  { href: '/dashboard', label: 'Огляд', icon: '▦' },
  { href: '/dashboard/orders', label: 'Замовлення', icon: '📋' },
  { href: '/dashboard/customers', label: 'Клієнти', icon: '👥' },
  { href: '/dashboard/products', label: 'Товари', icon: '📦' },
  { href: '/dashboard/report', label: 'Звіти', icon: '📊' },
  { href: '/dashboard/settings', label: 'Налаштування', icon: '⚙' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-30 md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Меню"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={[
          'fixed md:sticky top-0 z-20 h-screen flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
          collapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Header */}
        <div className="h-16 shrink-0 flex items-center border-b border-gray-200 dark:border-gray-800 overflow-hidden px-3 gap-2">
          {!collapsed && (
            <Image
              src="/logo_gaderia.png"
              alt="Gaderia"
              width={120}
              height={32}
              className="object-contain flex-1 min-w-0"
            />
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden md:flex shrink-0 items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label={collapsed ? 'Розгорнути' : 'Згорнути'}
          >
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            >
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {navItems.map(({ href, label, icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <span className="text-base leading-none shrink-0">{icon}</span>
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 shrink-0 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={logout}
            title={collapsed ? 'Вийти' : undefined}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <span className="text-base leading-none shrink-0">↩</span>
            {!collapsed && <span>Вийти</span>}
          </button>
        </div>
      </aside>

      {/* Desktop spacer so content doesn't go under sidebar */}
      <div className={`hidden md:block shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`} />
    </>
  );
}
