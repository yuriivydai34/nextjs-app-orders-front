export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>

      {/* Profile */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Profile</h3>
        </div>
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-semibold text-lg">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Admin Gaderia</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">admin@gaderia.com.ua</p>
          </div>
        </div>
        <Row label="Full name" value="Admin Gaderia" />
        <Row label="Email" value="admin@gaderia.com.ua" />
        <Row label="Phone" value="+38 (050) 123-45-67" />
        <Row label="Role" value="Administrator" muted />
      </section>

      {/* Company */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Company</h3>
        </div>
        <Row label="Name" value="Gaderia" />
        <Row label="Website" value="gaderia.com.ua" />
        <Row label="Country" value="Ukraine" />
        <Row label="Currency" value="UAH" muted />
      </section>

      {/* Notifications */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
        </div>
        <Toggle label="New order" description="Get notified when a new order is placed" defaultChecked />
        <Toggle label="Payment received" description="Get notified when a payment is confirmed" defaultChecked />
        <Toggle label="Order canceled" description="Get notified when an order is canceled" />
        <Toggle label="Weekly summary" description="Receive a weekly report every Monday" defaultChecked />
      </section>

      {/* Danger zone */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-900/50 divide-y divide-red-100 dark:divide-red-900/30">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger zone</h3>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Delete account</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Permanently remove your account and all data</p>
          </div>
          <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            Delete
          </button>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="px-5 py-3.5 flex items-center justify-between">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-sm ${muted ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
        {value}
      </span>
    </div>
  );
}

function Toggle({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="px-5 py-3.5 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
      <div className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${defaultChecked ? 'bg-gray-900 dark:bg-gray-100' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-gray-900 shadow transition-transform ${defaultChecked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </div>
  );
}
