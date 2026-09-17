'use client';

import { useState } from 'react';
import { apiFetch } from '@/app/lib/api';

type Row = Record<string, unknown>;
type Seen = { value: string; firstSeen: string | null; lastSeen: string | null };

const PAGE_SIZE = 500;

// Flat columns first, then what only exists in source_data. Everything a person
// ever used is exported, not just the newest value.
const COLUMNS: { label: string; get: (row: Row) => unknown }[] = [
  { label: 'ID',            get: (r) => r.id },
  { label: "Ім'я",          get: (r) => r.full_name },
  { label: 'По батькові',   get: (r) => list(r, 'patronymics').join(' / ') },
  { label: 'Email',         get: (r) => r.email },
  { label: 'Усі email',     get: (r) => seen(r, 'emails').map((e) => e.value).join(' / ') },
  { label: 'Email з',       get: (r) => seen(r, 'emails')[0]?.firstSeen ?? '' },
  { label: 'Телефон',       get: (r) => r.number },
  { label: 'Усі телефони',  get: (r) => seen(r, 'phones').map((p) => p.value).join(' / ') },
  { label: 'Телефон з',     get: (r) => seen(r, 'phones')[0]?.firstSeen ?? '' },
  { label: 'Компанія',      get: (r) => r.name_company },
  { label: 'Область',       get: (r) => r.region },
  { label: 'Місто',         get: (r) => r.settlement },
  { label: 'Адреса',        get: (r) => r.address },
  { label: 'Усі адреси',    get: (r) => list(r, 'addresses').join(' / ') },
  { label: 'Замовлень',     get: (r) => data(r).ordersCount ?? 0 },
  { label: 'Сума',          get: (r) => data(r).totalSpent ?? 0 },
  { label: 'Перше замовлення',   get: (r) => r.first_order_at },
  { label: 'Останнє замовлення', get: (r) => r.last_order_at },
  { label: 'Коментарі',     get: (r) => list(r, 'notes').join(' / ') },
];

function data(row: Row): Record<string, unknown> {
  return (row.source_data ?? {}) as Record<string, unknown>;
}
function seen(row: Row, key: string): Seen[] {
  return (data(row)[key] as Seen[]) ?? [];
}
function list(row: Row, key: string): string[] {
  return (data(row)[key] as string[]) ?? [];
}

// Excel in a uk locale splits on ';', so that is the separator here.
const SEP = ';';

function cell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'так' : 'ні';
  const text = String(value);
  // A leading =, @, or +/- before a non-digit makes Excel treat the cell as a
  // formula. Phone numbers like +380... and negative numbers stay untouched.
  const risky = /^[=@]/.test(text) || /^[+\-](?![\d\s])/.test(text);
  const safe = risky ? `'${text}` : text;
  return /[";\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function toCsv(rows: Row[]): string {
  const lines = [COLUMNS.map((c) => cell(c.label)).join(SEP)];
  for (const row of rows) {
    lines.push(COLUMNS.map((c) => cell(c.get(row))).join(SEP));
  }
  return lines.join('\r\n');
}

export default function ExportShopCustomersButton({ search }: { search?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPage(page: number): Promise<{ data: Row[]; total: number }> {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/customers`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(PAGE_SIZE));
    if (search) url.searchParams.set('search', search);

    const res = await apiFetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch customers');
    const json = await res.json();
    return { data: json.data ?? [], total: json.total ?? 0 };
  }

  async function handleExport() {
    setLoading(true);
    setError(null);
    try {
      const first = await fetchPage(1);
      const rows = [...first.data];
      const pages = Math.ceil(first.total / PAGE_SIZE);
      for (let page = 2; page <= pages; page++) {
        rows.push(...(await fetchPage(page)).data);
      }

      // BOM so Excel detects UTF-8 and does not mangle Cyrillic.
      const blob = new Blob(['﻿' + toCsv(rows)], { type: 'text/csv;charset=utf-8;' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `shop-customers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
    } catch {
      setError('Помилка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-500">{error}</span>}
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        <span>↓</span>
        {loading ? 'Завантаження…' : 'Експорт .csv'}
      </button>
    </div>
  );
}
