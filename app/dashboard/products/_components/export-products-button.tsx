'use client';

import { useState } from 'react';
import { apiFetch } from '@/app/lib/api';
import { productTypeLabel } from '@/app/lib/product-types.ts';

type Row = Record<string, unknown>;

const PAGE_SIZE = 200;

// Texts first, for checking against the website's wording; everything else
// after, for context while reading the file.
const COLUMNS: { label: string; get: (row: Row) => unknown }[] = [
  { label: 'ID',          get: (r) => r.id },
  { label: 'Артикул',     get: (r) => r.article },
  { label: 'Тип',         get: (r) => productTypeLabel(r as Parameters<typeof productTypeLabel>[0]) },
  { label: 'Назва',       get: (r) => r.header },
  { label: 'Опис',        get: (r) => r.description },
  { label: 'Ціна',        get: (r) => r.price },
  { label: 'Показується', get: (r) => r.is_active !== false },
];

// Excel in a uk locale splits on ';', so that is the separator here.
const SEP = ';';

function cell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'так' : 'ні';
  const text = String(value);
  // A leading =, @, or +/- before a non-digit makes Excel treat the cell as a
  // formula.
  const risky = /^[=@]/.test(text) || /^[+-](?![\d\s])/.test(text);
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

export default function ExportProductsButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPage(page: number): Promise<{ data: Row[]; total: number }> {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/catalog`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(PAGE_SIZE));
    url.searchParams.set('sortBy', 'id_sort');
    url.searchParams.set('sortOrder', 'ASC');

    const res = await apiFetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch products');
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
      link.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
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
