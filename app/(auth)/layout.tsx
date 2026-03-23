export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      {children}
    </div>
  );
}
