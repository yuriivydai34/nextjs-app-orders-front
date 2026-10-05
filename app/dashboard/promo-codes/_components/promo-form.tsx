'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { apiFetch } from '@/app/lib/api';
import { fromDateInput, toDateInput, type DiscountType, type PromoCode } from './promo';

export type PromoFormHandle = { open: (promo?: PromoCode) => void };

type Draft = {
  code: string;
  title: string;
  discount_type: DiscountType;
  discount_value: string;
  usage_limit: string;
  starts: string;
  ends: string;
  first_order_only: boolean;
  max_account_age_days: string;
  is_active: boolean;
  auto_apply: boolean;
};

const EMPTY: Draft = {
  code: '', title: '', discount_type: 'PERCENT', discount_value: '',
  usage_limit: '', starts: '', ends: '', first_order_only: false,
  max_account_age_days: '', is_active: true, auto_apply: false,
};

// Not separate kinds of code — each is a set of conditions filled in for you.
const PRESETS: { label: string; hint: string; patch: Partial<Draft> }[] = [
  {
    label: 'Велком',
    hint: 'Перше замовлення нового користувача',
    patch: { title: 'Welcome', first_order_only: true, max_account_age_days: '30', usage_limit: '', starts: '', ends: '', auto_apply: true },
  },
  {
    label: 'Акція',
    hint: 'Діє в задані дати',
    patch: { first_order_only: false, max_account_age_days: '', usage_limit: '', auto_apply: false },
  },
  {
    label: 'Обмежений',
    hint: 'Перші N замовлень',
    patch: { first_order_only: false, max_account_age_days: '', usage_limit: '100', auto_apply: false },
  },
];

const PromoForm = forwardRef<PromoFormHandle, { onSaved: () => void }>(function PromoForm({ onSaved }, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useImperativeHandle(ref, () => ({
    open(promo) {
      setEditing(promo ?? null);
      setDraft(promo ? {
        code: promo.code,
        title: promo.title ?? '',
        discount_type: promo.discount_type,
        discount_value: String(promo.discount_value),
        usage_limit: promo.usage_limit === null ? '' : String(promo.usage_limit),
        starts: toDateInput(promo.starts_at),
        ends: toDateInput(promo.ends_at),
        first_order_only: promo.first_order_only,
        max_account_age_days: promo.max_account_age_days === null ? '' : String(promo.max_account_age_days),
        is_active: promo.is_active,
        auto_apply: promo.auto_apply ?? false,
      } : EMPTY);
      setError(null);
      dialogRef.current?.showModal();
    },
  }));

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      code: draft.code,
      title: draft.title,
      discount_type: draft.discount_type,
      discount_value: draft.discount_value,
      usage_limit: draft.usage_limit,
      starts_at: fromDateInput(draft.starts, false),
      ends_at: fromDateInput(draft.ends, true),
      first_order_only: draft.first_order_only,
      max_account_age_days: draft.max_account_age_days,
      is_active: draft.is_active,
      auto_apply: draft.auto_apply,
    };
    try {
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/promo-codes${editing ? `/${editing.id}` : ''}`,
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(err?.message) ? err.message.join(', ') : err?.message ?? 'Не вдалося зберегти');
      }
      dialogRef.current?.close();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти');
    } finally {
      setSaving(false);
    }
  }

  const used = editing?.used ?? 0;

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current?.close(); }}
      className="rounded-xl bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-2xl"
    >
      <form onSubmit={submit}>
        <header className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {editing ? `Промокод ${editing.code}` : 'Новий промокод'}
          </p>
        </header>

        <div className="flex flex-col gap-5 px-6 py-4">
          {!editing && (
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, ...p.patch }))}
                  className="px-3 py-1.5 rounded-lg text-left bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{p.label}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{p.hint}</span>
                </button>
              ))}
            </div>
          )}

          {editing && used > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Код уже використали {used} раз(и). Зміни діятимуть на нові замовлення; суми в минулих лишаться як були.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Код" hint="Латиниця або кирилиця, цифри, «-», «_»">
              <input required value={draft.code} onChange={(e) => set('code', e.target.value.toUpperCase())} className={INPUT} placeholder="AUTUMN10" />
            </Field>
            <Field label="Акція / назва" hint="Для себе, клієнт не бачить">
              <input value={draft.title} onChange={(e) => set('title', e.target.value)} className={INPUT} placeholder="Осінь 2026" />
            </Field>

            <Field label="Знижка">
              <div className="flex gap-2">
                <input
                  required type="number" min="0.01" step="0.01"
                  max={draft.discount_type === 'PERCENT' ? 100 : undefined}
                  value={draft.discount_value} onChange={(e) => set('discount_value', e.target.value)}
                  className={INPUT}
                />
                <select value={draft.discount_type} onChange={(e) => set('discount_type', e.target.value as DiscountType)} className={`${INPUT} w-28`}>
                  <option value="PERCENT">%</option>
                  <option value="FIXED">грн</option>
                </select>
              </div>
            </Field>
            <Field label="Ліміт використань" hint="Порожньо — без ліміту">
              <input type="number" min="1" step="1" value={draft.usage_limit} onChange={(e) => set('usage_limit', e.target.value)} className={INPUT} />
            </Field>

            <Field label="Діє з" hint="Порожньо — одразу">
              <input type="date" value={draft.starts} onChange={(e) => set('starts', e.target.value)} className={INPUT} />
            </Field>
            <Field label="Діє по (включно)" hint="Порожньо — безстроково">
              <input type="date" value={draft.ends} onChange={(e) => set('ends', e.target.value)} className={INPUT} />
            </Field>

            <Field label="Лише для нових акаунтів, днів" hint="Від реєстрації. Порожньо — для всіх">
              <input type="number" min="1" step="1" value={draft.max_account_age_days} onChange={(e) => set('max_account_age_days', e.target.value)} className={INPUT} />
            </Field>
            <div className="flex flex-col gap-3 justify-end pb-1">
              <Check checked={draft.first_order_only} onChange={(v) => set('first_order_only', v)} label="Лише на перше замовлення" />
              <Check checked={draft.is_active} onChange={(v) => set('is_active', v)} label="Увімкнено" />
              <Check
                checked={draft.auto_apply}
                onChange={(v) => set('auto_apply', v)}
                label="Застосовувати автоматично — клієнт не вводить код, знижка вже в ціні"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Знижка рахується від суми товарів (з акційними цінами), без доставки. Скасоване замовлення звільняє місце в ліміті.
          </p>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <footer className="flex gap-2 px-6 py-4 justify-end border-t border-gray-100 dark:border-gray-800">
          <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 h-10 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            Закрити
          </button>
          <button type="submit" disabled={saving} className="px-4 h-10 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Збереження…' : 'Зберегти'}
          </button>
        </footer>
      </form>
    </dialog>
  );
});

export default PromoForm;

const INPUT = 'w-full h-10 rounded-lg px-3 bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-400 dark:text-gray-500">{hint}</span>}
    </label>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4" />
      {label}
    </label>
  );
}
