'use client';

import { useEffect, useState } from 'react';
import { getAppSettings, updateAppSettings, type PackMix, type PackRule } from '@/app/actions/app-settings';
import { JUICE_TYPES } from '@/app/lib/juice-types';

const newId = () => `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

// Ready-made mixes for the app, as on the website: a tap puts a whole box of
// different flavours in the cart. The flavours must fill exactly one box of
// the volume (the box rules above); the app-server then finds the bottles.
export default function PackMixesSettings() {
  const [mixes, setMixes] = useState<PackMix[]>([]);
  const [rules, setRules] = useState<PackRule[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getAppSettings()
      .then((s) => {
        setMixes(s.pack_mixes ?? []);
        setRules((s.pack_rules ?? []).filter((r) => r.enabled));
        setLoaded(true);
      })
      .catch((err) => setMessage({ ok: false, text: err.message }));
  }, []);

  const edit = (id: string, patch: Partial<PackMix>) => {
    setMixes((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    setDirty(true);
    setMessage(null);
  };
  const setQty = (m: PackMix, juice: string, qty: number) =>
    edit(m.id, {
      items: [...m.items.filter((i) => i.juice !== juice), ...(qty > 0 ? [{ juice, qty }] : [])],
    });
  const qtyOf = (m: PackMix, juice: string) => m.items.find((i) => i.juice === juice)?.qty ?? 0;
  const boxOf = (m: PackMix) => rules.find((r) => r.measurement === m.measurement)?.n;

  function add() {
    const first = rules[0];
    if (!first) return;
    setMixes((list) => [...list, { id: newId(), name: '', measurement: first.measurement, items: [], enabled: false }]);
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const s = await updateAppSettings({ pack_mixes: mixes });
      setMixes(s.pack_mixes ?? []);
      setDirty(false);
      setMessage({ ok: true, text: 'Збережено' });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Не вдалося зберегти' });
    } finally {
      setSaving(false);
    }
  }

  const input =
    'px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100';

  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Готові мікси</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Одним дотиком у кошик іде вся коробка різних смаків. Це не товар: у кошику будуть звичайні пляшки. Смаки мають
            скласти рівно одну коробку.
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={!loaded || rules.length === 0 || mixes.length >= 20}
          className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          + Додати мікс
        </button>
      </div>

      {loaded && mixes.length === 0 && <p className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">Мікси не задані — у застосунку їх не буде.</p>}

      {mixes.map((m) => {
        const total = m.items.reduce((sum, i) => sum + i.qty, 0);
        const n = boxOf(m);
        const full = n !== undefined && total === n;
        return (
          <div key={m.id} className="px-5 py-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                <input type="checkbox" className="w-4 h-4" checked={m.enabled} onChange={(e) => edit(m.id, { enabled: e.target.checked })} />
                Показувати
              </label>
              <input value={m.name} maxLength={60} placeholder="Мікс «Груша + Полуниця»" onChange={(e) => edit(m.id, { name: e.target.value })} className={`${input} flex-1 min-w-[220px]`} />
              <select value={m.measurement} onChange={(e) => edit(m.id, { measurement: Number(e.target.value) })} className={input}>
                {rules.map((r) => (
                  <option key={r.measurement} value={r.measurement}>
                    {r.label} (по {r.n})
                  </option>
                ))}
                {!rules.some((r) => r.measurement === m.measurement) && <option value={m.measurement}>{m.measurement} л (правило вимкнено)</option>}
              </select>
              <span className={`text-xs px-2 py-0.5 rounded-full ${full ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                {total} з {n ?? '?'}
              </span>
              <button
                type="button"
                onClick={() => confirm('Видалити мікс?') && (setMixes((l) => l.filter((x) => x.id !== m.id)), setDirty(true))}
                className="ml-auto text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded px-2 py-1"
              >
                Видалити
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {JUICE_TYPES.map((j) => (
                <label key={j.value} className="flex items-center justify-between gap-3 text-sm text-gray-700 dark:text-gray-300">
                  {j.label}
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={qtyOf(m, j.value) || ''}
                    placeholder="0"
                    onChange={(e) => setQty(m, j.value, Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                    className={`${input} w-20 text-right`}
                  />
                </label>
              ))}
            </div>
          </div>
        );
      })}

      <div className="px-5 py-3.5 flex items-center justify-end gap-3">
        {message && <span className={`text-xs ${message.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{message.text}</span>}
        {dirty && !message && <span className="text-xs text-gray-500 dark:text-gray-400">Є незбережені зміни</span>}
        <button
          type="button"
          onClick={save}
          disabled={!loaded || saving || !dirty}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          {saving ? 'Збереження…' : 'Зберегти'}
        </button>
      </div>
    </section>
  );
}
