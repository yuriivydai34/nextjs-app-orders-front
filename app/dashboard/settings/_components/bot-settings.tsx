'use client';

import { FormEvent, useEffect, useState } from 'react';
import { getAppSettings, updateAppSettings } from '@/app/actions/app-settings';

// The Telegram bot reads these within a minute of saving (gaderia_bot,
// services/settings.py). An empty field means what the bot has in its own
// code and .env, as before these settings existed.
export default function BotSettings() {
  const [sale, setSale] = useState('');
  const [manager, setManager] = useState('');
  const [hours, setHours] = useState('');
  const [notify, setNotify] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getAppSettings()
      .then((s) => {
        setSale(s.bot_sale_text ?? '');
        setManager(s.bot_manager_username ?? '');
        setHours(s.bot_manager_work_hours ?? '');
        setNotify(s.bot_notify_enabled !== false);
        setLoaded(true);
      })
      .catch((err) => setMessage({ ok: false, text: err.message }));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const s = await updateAppSettings({
        bot_sale_text: sale,
        bot_manager_username: manager,
        bot_manager_work_hours: hours,
        bot_notify_enabled: notify,
      });
      setSale(s.bot_sale_text ?? '');
      setManager(s.bot_manager_username ?? '');
      setHours(s.bot_manager_work_hours ?? '');
      setNotify(s.bot_notify_enabled !== false);
      setMessage({ ok: true, text: 'Збережено. Бот підхопить протягом хвилини' });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Не вдалося зберегти' });
    } finally {
      setSaving(false);
    }
  }

  const input =
    'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 disabled:opacity-50';

  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Telegram-бот</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Порожнє поле — як у боті зараз (текст і налаштування з його коду).
        </p>
      </div>
      <form onSubmit={save}>
        <label className="px-5 py-3.5 block">
          <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Текст розділу «🔥 Акції»</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
            Можна &lt;b&gt;жирний&lt;/b&gt;, &lt;i&gt;курсив&lt;/i&gt;, &lt;a href=&quot;…&quot;&gt;посилання&lt;/a&gt;. Порожньо — «Зараз активних акцій немає».
          </span>
          <textarea
            value={sale}
            onChange={(e) => setSale(e.target.value)}
            rows={5}
            maxLength={3500}
            disabled={!loaded}
            placeholder="🔥 Зараз активних акцій немає."
            className={`${input} resize-y`}
          />
          <span className="block text-xs text-gray-400 mt-1 text-right">{sale.length} / 3500</span>
        </label>

        <div className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Менеджер у Telegram</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
              Кому відкриває чат кнопка «👩‍💼 Менеджер»
            </span>
            <input value={manager} onChange={(e) => setManager(e.target.value)} disabled={!loaded} placeholder="@ім'я" className={input} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Графік менеджера</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">Показується під кнопкою</span>
            <input value={hours} onChange={(e) => setHours(e.target.value)} maxLength={200} disabled={!loaded} placeholder="Пн–Пт 9:00–18:00" className={input} />
          </label>
        </div>

        <label className="px-5 py-3.5 flex items-start gap-3">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} disabled={!loaded} className="w-4 h-4 mt-0.5" />
          <span>
            <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Сповіщення клієнтам про замовлення</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              «Прийнято», «відправлено з ТТН», «скасовано» тим, хто підписався в боті. Вимкнення — пауза: зміни за цей час
              не надсилаються й після ввімкнення.
            </span>
          </span>
        </label>

        <div className="px-5 py-3.5 flex items-center justify-end gap-3">
          {message && (
            <span className={`text-xs ${message.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {message.text}
            </span>
          )}
          <button
            type="submit"
            disabled={!loaded || saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {saving ? 'Збереження…' : 'Зберегти'}
          </button>
        </div>
      </form>
    </section>
  );
}
