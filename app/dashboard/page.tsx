export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Overview</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value="1,284" change="+12%" up />
        <StatCard label="Revenue" value="₴ 284,500" change="+8.2%" up />
        <StatCard label="Customers" value="287" change="+3%" up />
        <StatCard label="Canceled" value="34" change="+2" up={false} />
      </div>

      {/* Recent orders + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400">Order ID</th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400">Customer</th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400">Amount</th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id} className="border-b last:border-0 border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{o.id}</td>
                  <td className="px-5 py-3 text-gray-900 dark:text-gray-100">{o.customer}</td>
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">{o.amount} ₴</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Top Products</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} className="px-5 py-3 flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.orders} orders</p>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 shrink-0">{p.revenue} ₴</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {ACTIVITY.map((a, i) => (
            <div key={i} className="px-5 py-3 flex items-start gap-3">
              <span className="mt-0.5 text-base leading-none">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100">{a.text}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, up }: { label: string; value: string; change: string; up: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-5 py-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
      <p className={`text-xs mt-1 font-medium ${up ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
        {up ? '↑' : '↓'} {change} vs last month
      </p>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  PAID:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  PENDING:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>{status}</span>;
}

const RECENT_ORDERS = [
  { id: '#4821', customer: 'Олексій Мороз',    amount: '535',   status: 'PAID' },
  { id: '#4820', customer: 'Ірина Коваль',     amount: '270',   status: 'PENDING' },
  { id: '#4819', customer: 'Василь Бондар',    amount: '1 120', status: 'PAID' },
  { id: '#4818', customer: 'Тетяна Шевченко',  amount: '395',   status: 'CANCELED' },
  { id: '#4817', customer: 'Микола Лисенко',   amount: '840',   status: 'PAID' },
];

const TOP_PRODUCTS = [
  { name: 'Сік яблучний 5л BIB',       orders: 214, revenue: '98 440' },
  { name: 'Сік яблуко-полуниця 1л×6',  orders: 187, revenue: '73 865' },
  { name: 'Яблучно-виноградний 3л×2',  orders: 153, revenue: '35 955' },
  { name: 'Оцет яблучний 0.5л',        orders: 98,  revenue: '19 600' },
  { name: 'Сік прямого віджиму 5л',    orders: 76,  revenue: '26 600' },
];

const ACTIVITY = [
  { icon: '🛒', text: 'New order #4821 placed by Олексій Мороз — 535 ₴',       time: '2m ago' },
  { icon: '✅', text: 'Payment confirmed for order #4819 — 1 120 ₴',            time: '18m ago' },
  { icon: '❌', text: 'Order #4818 was canceled by Тетяна Шевченко',            time: '1h ago' },
  { icon: '👤', text: 'New customer registered: Ірина Коваль',                  time: '2h ago' },
  { icon: '📦', text: 'Product "Сік яблучний 5л BIB" stock updated to 0',       time: '3h ago' },
  { icon: '🚚', text: 'TTN 20450897645231 added to order #4815',                time: '5h ago' },
];
