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
  // Rules are sent only once edited: saving the mode must not freeze the
  // texts the server writes by default.
  const [rulesDirty, setRulesDirty] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function take(s: AppSettings) {
    setMode(s.own_sets_mode ?? 'off');
    setTesters((s.own_sets_testers ?? []).join(', '));
    setRules(s.pack_rules ?? []);
    setRulesDirty(false);
  }

  function editRule(i: number, patch: Partial<PackRule>) {
    setRules((list) => list.map((r, k) => (k === i ? { ...r, ...patch } : r)));
    setRulesDirty(true);
  }

  function addRule() {
    const used = new Set(rules.map((r) => r.measurement));
    let measurement = 1;
    while (used.has(measurement)) measurement += 1;
    setRules((list) => [
      ...list,
      {
        measurement,
        n: 6,
        label: `Сік ${measurement} л`,
        msg: 'Мінімальне замовлення 6 шт. Додайте ще {N} (можна інший смак).',
        hint: 'По 6 шт. у комплекті — можна обрати різні смаки',
        enabled: true,
      },
    ]);
    setRulesDirty(true);
  }

  function removeRule(i: number) {
    if (!confirm('Видалити правило? Пляшки цього обсягу перестануть вимагати коробку.')) return;
    setRules((list) => list.filter((_, k) => k !== i));
    setRulesDirty(true);
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
      take(
        await updateAppSettings({
          own_sets_mode: mode,
          own_sets_testers: ids as unknown as number[],
          ...(rulesDirty ? { pack_rules: rules } : {}),
        }),
      );
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

        <div className="px-5 py-3.5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Правила коробок</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Скільки пляшок одного обсягу їде в коробці і що бачить покупець. Пляшки різних смаків одного обсягу рахуються разом.
                {' '}У текстах {'{N}'} — скільки бракує (для підпису на картці — розмір коробки). Зміни доходять до застосунку одразу, без оновлення.
              </span>
            </div>
            <button
              type="button"
              onClick={addRule}
              disabled={!loaded}
              className="shrink-0 px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              + Додати правило
            </button>
          </div>

          {rules.map((r, i) => (
            <div key={r.measurement} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                  <input type="checkbox" className="w-4 h-4" checked={r.enabled} onChange={(e) => editRule(i, { enabled: e.target.checked })} />
                  Діє
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">Пляшка {r.measurement} л</span>
                <button type="button" onClick={() => removeRule(i)} className="ml-auto text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded px-2 py-1">
                  Видалити
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
                <label className="block">
                  <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Назва</span>
                  <input value={r.label} maxLength={40} onChange={(e) => editRule(i, { label: e.target.value })} className={input} />
                </label>
                <label className="block">
                  <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">У коробці, шт.</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={r.n}
                    onChange={(e) => editRule(i, { n: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                    className={input}
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Підпис на картці пляшки</span>
                <input
                  value={r.hint ?? ''}
                  maxLength={100}
                  onChange={(e) => editRule(i, { hint: e.target.value })}
                  placeholder="По {N} шт. у комплекті — можна обрати різні смаки"
                  className={input}
                />
                <span className="block text-xs text-gray-400 mt-1">
                  Покупець бачить: {(r.hint ?? '').trim() ? (r.hint ?? '').replaceAll('{N}', String(r.n)) : 'нічого (поле порожнє)'}
                </span>
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Повідомлення, коли коробка неповна</span>
                <textarea value={r.msg} maxLength={200} rows={2} onChange={(e) => editRule(i, { msg: e.target.value })} className={`${input} resize-y`} />
                <span className="block text-xs text-gray-400 mt-1">
                  Покупець бачить (якщо бракує 2): {r.msg.replaceAll('{N}', '2')}. Розмір коробки в тексті впишіть самі: він не підставляється.
                </span>
              </label>
            </div>
          ))}
          {loaded && rules.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Правил нема: пляшки можна замовляти в будь-якій кількості.</p>}
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
