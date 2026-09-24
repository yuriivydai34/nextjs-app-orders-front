'use client';

import { useRef, useState } from 'react';
import { apiFetch } from '@/app/lib/api';

type AccountDocument = {
  id: number;
  file_name: string;
  mime_type: string | null;
  size: number | null;
  createdAt: string;
};

// Documents a legal-entity client attached in the mobile app. Loaded only when
// the dialog is opened, so the customer list stays one request.
export default function CustomerDocuments({ accountId }: { accountId: string | number }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [docs, setDocs] = useState<AccountDocument[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  function open() {
    setDocs(null);
    setError(null);
    dialogRef.current?.showModal();
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/${accountId}/documents`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: AccountDocument[]) => setDocs(data))
      .catch(() => setError('Не вдалося завантажити документи.'));
  }

  // Not a plain link: the endpoint needs the Bearer token, which a browser
  // navigation would not send.
  async function download(doc: AccountDocument) {
    setError(null);
    setDownloading(doc.id);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/documents/${doc.id}/download`);
      if (!res.ok) {
        throw new Error(res.status === 404 ? 'Файл не знайдено на сервері.' : 'Не вдалося скачати файл.');
      }
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося скачати файл.');
    } finally {
      setDownloading(null);
    }
  }

  return (
    <>
      <button
        onClick={open}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        title="Документи"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M17.5 8.33332V12.5C17.5 16.6667 15.8334 18.3333 11.6667 18.3333H8.33335C4.16669 18.3333 2.50002 16.6667 2.50002 12.5V7.49999C2.50002 3.33332 4.16669 1.66666 8.33335 1.66666H12.5" stroke="#979797" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17.5 8.33332H14.1667C11.6667 8.33332 10.8334 7.49999 10.8334 4.99999V1.66666L17.5 8.33332Z" stroke="#979797" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6.66669 10.8333H11.6667M6.66669 14.1667H10" stroke="#979797" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current?.close(); }}
        className="rounded-xl bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/40 w-full max-w-xl"
      >
        <header className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Документи клієнта</p>
        </header>

        <div className="px-6 py-4">
          {docs === null && !error ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>
          ) : docs !== null && docs.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Клієнт не завантажував документів.</p>
          ) : docs !== null ? (
            <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {docs.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate">{doc.file_name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatSize(doc.size)} · {new Date(doc.createdAt).toLocaleString('uk-UA')}
                    </span>
                  </div>
                  <button
                    onClick={() => download(doc)}
                    disabled={downloading === doc.id}
                    className="shrink-0 px-3 h-8 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 transition-colors"
                  >
                    {downloading === doc.id ? 'Скачування…' : 'Скачати'}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {error && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>}
        </div>

        <footer className="flex px-6 py-4 justify-end border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="px-4 h-10 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Закрити
          </button>
        </footer>
      </dialog>
    </>
  );
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}
