'use client';

import { FormEvent, useEffect, useState } from 'react';
import { getAppSettings, updateAppSettings, type AppSettings, type PackRule } from '@/app/actions/app-settings';

const MODES: { value: AppSettings['own_sets_mode']; label: string; hint: string }[] = [
  { value: 'off', label: 'Вимкнено', hint: 'Як досі: у застосунку коробки, пляшок не видно нікому' },
  { value: 'testers', label: 'Лише тестувальники', hint: 'Пляшки замість коробок бачать тільки акаунти зі списку нижче' },
  { value: 'on', label: 'Для всіх', hint: 'Пляшки бачать усі. Вмикати разом із сайтом' },
];

// Juices by the bottle in the app, as on the website: which side of the
// catalog people see, and who tries it first. Products are marked "Пляшка" or
// "Коробка" in their form; app-server refuses an order with a short box.
export default function OwnSetsSettings() {
  const [mode, setMode] = useState<AppSettings['own_sets_mode']>('off');
  const [testers, setTesters] = useState('');
  const [rules, setRules] = useState<PackRule[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function take(s: AppSettings) {
    setMode(s.own_sets_mode ?? 'off');
    setTesters((s.own_sets_testers ?? []).join(', '));
    setRules(s.pack_rules ?? []);
  }

  useEffect(() => {
    getAppSettings()
      .then((s) => {
        take(s);
        setLoaded(true);
      })
      .catch((err) => setMessage({ ok: false, text: err.message }));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (mode === 'on' && !confirm('Пляшки побачать усі покупці застосунку, коробки зникнуть. Увімкнути?')) return;
    setSaving(true);
    setMessage(null);
    try {
      const ids = testers.split(/[\s,;]+/).filter(Boolean);
      take(await updateAppSettings({ own_sets_mode: mode, own_sets_testers: ids as unknown as number[] }));
      setMessage({ ok: true, text: 'Збережено' });
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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Соки поштучно</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Пляшки замість готових коробок, як на сайті. Товар позначається «Пляшка» чи «Коробка» в його формі. Неповну коробку
          сервер не пропустить до оформлення.
        </p>
      </div>
      <form onSubmit={save}>
        <div className="px-5 py-3.5 space-y-2">
          {MODES.map((m) => (
            <label key={m.value} className="flex items-start gap-3">
              <input type="radio" name="own_sets_mode" checked={mode === m.value} onChange={() => setMode(m.value)} disabled={!loaded} className="w-4 h-4 mt-0.5" />
              <span>
                <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{m.label}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">{m.hint}</span>
              </span>
            </label>
          ))}
        </div>

        <label className="px-5 py-3.5 block">
          <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Тестувальники</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
            ID акаунтів через кому — перша колонка в «Користувачах». Діє, коли вибрано «Лише тестувальники».
          </span>
          <input value={testers} onChange={(e) => setTesters(e.target.value)} disabled={!loaded} placeholder="129, 42" className={input} />
        </label>

        <div className="px-5 py-3.5">
          <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Правила кратності</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">Як на сайті. Пляшки одного обсягу рахуються разом, смаки можна змішувати.</span>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            {rules.map((r) => (
              <li key={r.measurement} className={r.enabled ? '' : 'opacity-50'}>
                {r.label} — по {r.n} у коробці{r.enabled ? '' : ' (вимкнено)'}
              </li>
            ))}
          </ul>
        </div>

        <div className="px-5 py-3.5 flex items-center justify-end gap-3">
          {message && (
            <span className={`text-xs ${message.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{message.text}</span>
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
