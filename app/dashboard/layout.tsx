'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './_components/sidebar';
import ThemeToggle from './_components/theme-toggle';
import { logout } from '@/app/actions/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-16 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between pl-14 pr-6 md:px-6">
          <h1 className="text-sm font-medium text-gray-500 dark:text-gray-400"></h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              Вийти
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
