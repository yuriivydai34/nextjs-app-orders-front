export const metadata = { title: 'Налаштування' };

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Налаштування</h2>

      {/* Profile */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Профіль</h3>
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
        <Row label="Повне ім'я" value="Admin Gaderia" />
        <Row label="Email" value="admin@gaderia.com.ua" />
        <Row label="Телефон" value="+38 (050) 123-45-67" />
        <Row label="Роль" value="Адміністратор" muted />
      </section>

      {/* Company */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Компанія</h3>
        </div>
        <Row label="Назва" value="Gaderia" />
        <Row label="Сайт" value="gaderia.com.ua" />
        <Row label="Країна" value="Україна" />
        <Row label="Валюта" value="UAH" muted />
      </section>

      {/* Notifications */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Сповіщення</h3>
        </div>
        <Toggle label="Нове замовлення" description="Отримувати сповіщення при новому замовленні" defaultChecked />
        <Toggle label="Оплата отримана" description="Отримувати сповіщення при підтвердженні оплати" defaultChecked />
        <Toggle label="Замовлення скасовано" description="Отримувати сповіщення при скасуванні замовлення" />
        <Toggle label="Щотижневий звіт" description="Отримувати звіт щопонеділка" defaultChecked />
      </section>

      {/* Danger zone */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-900/50 divide-y divide-red-100 dark:divide-red-900/30">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Небезпечна зона</h3>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Видалити акаунт</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Назавжди видалити акаунт та всі дані</p>
          </div>
          <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            Видалити
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
