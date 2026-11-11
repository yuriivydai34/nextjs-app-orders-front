'use client';

import { FormEvent, useEffect, useState } from 'react';
import { sendPush } from '@/app/actions/push';

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
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required className={INPUT} placeholder="Зігрійся по-стародавньому!" />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Текст</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} required rows={3} className={`${INPUT} resize-y`} placeholder="Стародавні цілителі лікували імбиром…" />
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
    </div>
  );
}
