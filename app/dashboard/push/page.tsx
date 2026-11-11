'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { fetchRecentPush, PushLogEntry, sendPush } from '@/app/actions/push';

const INPUT =
  'w-full rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500';

export default function PushPage() {
  useEffect(() => { document.title = 'Push-сповіщення | Gaderia'; }, []);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState('');
  const [testOnly, setTestOnly] = useState(true);
  const [accountId, setAccountId] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [recent, setRecent] = useState<PushLogEntry[] | null>(null);

  const loadRecent = useCallback(() => {
    fetchRecentPush().then(setRecent).catch(() => setRecent([]));
  }, []);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const canSend = title.trim() !== '' && body.trim() !== '' && (!testOnly || accountId.trim() !== '');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSend) return;

    const broadcast = !testOnly;
    if (broadcast && !confirm('Це піде всім, хто має застосунок. Надіслати?')) return;

    setSending(true);
    setMessage(null);
    try {
      await sendPush({
        title: title.trim(),
        body: body.trim(),
        ...(image.trim() ? { image: image.trim() } : {}),
        ...(testOnly ? { account_id: Number(accountId) } : {}),
      });
      setMessage({
        ok: true,
        text: testOnly ? `Надіслано акаунту ${accountId}` : 'Надіслано всім',
      });
      loadRecent();
      if (broadcast) {
        setTitle('');
        setBody('');
        setImage('');
      }
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Не вдалося надіслати' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Push-сповіщення</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Надсилається через Firebase, усім, хто має застосунок і не вимкнув сповіщення.
      </p>

      <form onSubmit={submit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <label className="block">
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Заголовок</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required className={INPUT} placeholder="Текст заголовку" />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Текст</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} required rows={3} className={`${INPUT} resize-y`} placeholder="Текст повідомлення" />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Картинка (посилання, необов&apos;язково)</span>
          <input
            type="url" value={image} onChange={(e) => setImage(e.target.value)} className={INPUT}
            placeholder="https://gaderia.com.ua/wp-content/…"
          />
          {image.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.trim()} alt="" className="mt-2 max-h-32 rounded-lg object-contain bg-gray-50 dark:bg-gray-800" />
          )}
        </label>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
            <input type="checkbox" checked={testOnly} onChange={(e) => setTestOnly(e.target.checked)} className="w-4 h-4" />
            Надіслати тільки одному акаунту (перевірка)
          </label>
          {testOnly ? (
            <label className="block">
              <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">ID акаунта</span>
              <input
                value={accountId} onChange={(e) => setAccountId(e.target.value)} className={`${INPUT} max-w-[160px]`}
                placeholder="129" inputMode="numeric"
              />
              <span className="block text-xs text-gray-400 mt-1">Перша колонка на сторінці «Користувачі».</span>
            </label>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Зніміть галочку, лише коли впевнені в тексті — це піде всім одразу, без можливості відкликати.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          {message && (
            <span className={`text-xs ${message.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {message.text}
            </span>
          )}
          <button
            type="submit"
            disabled={!canSend || sending}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {sending ? 'Надсилання…' : testOnly ? 'Надіслати собі на перевірку' : 'Надіслати всім'}
          </button>
        </div>
      </form>

      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-3">Останні надіслані</h3>
      {recent === null ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Завантаження…</p>
      ) : recent.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Ще нічого не надсилали.</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {recent.map((r) => (
            <div key={r.id} className="px-5 py-3 flex items-start gap-3">
              {r.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.image} alt="" title={r.image}
                  className="w-12 h-12 shrink-0 rounded-lg object-contain bg-gray-50 dark:bg-gray-800"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.title}</p>
                  <span className="shrink-0 text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleString('uk-UA')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{r.body}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {r.account_id ? `Акаунту ${r.account_id}` : 'Усім'}
                  {r.sent_by && ` · ${r.sent_by}`}
                  {r.message_id ? ' · прийнято Firebase' : ' · без message_id'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
