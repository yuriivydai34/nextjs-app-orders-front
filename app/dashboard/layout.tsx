import Sidebar from './_components/sidebar';
import ThemeToggle from './_components/theme-toggle';

export default function DashboardLayout({
  children,
}: LayoutProps<'/dashboard'>) {
  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-16 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6">
          <h1 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dashboard</h1>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
