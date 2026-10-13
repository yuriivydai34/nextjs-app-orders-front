'use client';

import { useRef, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { applyMarkdown, safeUrl, type Action } from '@/app/lib/markdown-edit.ts';

// The product description, in the Markdown subset the app renders from 1.3.4
// (agreed with app-mobile; app-server strips it to plain text for older
// apps). The preview mimics the app: its sizes at 480 logical px scaled to a
// 360 px column, its colours, a newline as a line break, no HTML, no images,
// https links only.

const BUTTONS: { action: Action; label: string; title: string }[] = [
  { action: 'h2', label: 'H2', title: 'Заголовок (## )' },
  { action: 'h3', label: 'H3', title: 'Підзаголовок (### )' },
  { action: 'bold', label: 'Ж', title: 'Жирний (**текст**)' },
  { action: 'italic', label: 'К', title: 'Курсив (*текст*)' },
  { action: 'list', label: '•', title: 'Список (- )' },
  { action: 'numbered', label: '1.', title: 'Нумерований список (1. )' },
  { action: 'table', label: 'Таблиця', title: 'Вставити таблицю' },
  { action: 'link', label: 'Посилання', title: 'Посилання ([текст](https://…))' },
];

// App styles (app-mobile, font MacPawFixel) × 0.75.
const APP: Components = {
  h1: ({ children }) => <h2 className="text-[16.5px] font-semibold text-black mt-[9px] mb-[4.5px]">{children}</h2>,
  h2: ({ children }) => <h2 className="text-[16.5px] font-semibold text-black mt-[9px] mb-[4.5px]">{children}</h2>,
  h3: ({ children }) => <h3 className="text-[15px] font-semibold text-black mt-[7.5px] mb-[3px]">{children}</h3>,
  p: ({ children }) => <p className="mb-2">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  // "•" only before items of a bulleted list; numbered ones keep their numbers.
  ul: ({ children }) => <ul className="mb-2 flex flex-col gap-[4.5px] [&>li]:before:content-['•'] [&>li]:before:mr-2">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 flex flex-col gap-[4.5px] list-decimal pl-5">{children}</ol>,
  a: ({ href, children }) => {
    const url = safeUrl(href ?? '');
    return url ? (
      <a href={url} target="_blank" rel="noreferrer" className="text-[#53B175] underline">{children}</a>
    ) : (
      <>{children}</>
    );
  },
  table: ({ children }) => (
    <div className="mb-2 overflow-x-auto">
      <table className="text-[12.75px] border-collapse border border-[#E2E2E2]">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-[#E2E2E2] bg-[#F2F3F2] px-[6px] py-[4.5px] text-left font-semibold text-black">{children}</th>,
  td: ({ children }) => <td className="border border-[#E2E2E2] px-[6px] py-[4.5px] align-top">{children}</td>,
};

export default function DescriptionEditor({ defaultValue }: { defaultValue: string }) {
  const [text, setText] = useState(defaultValue);
  const [showHelp, setShowHelp] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  function apply(action: Action) {
    const el = area.current;
    if (!el) return;
    const next = applyMarkdown({ text, start: el.selectionStart, end: el.selectionEnd }, action);
    setText(next.text);
    // After React has put the new text in, restore focus and the selection.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(next.start, next.end);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1">
        {BUTTONS.map((b) => (
          <button
            key={b.action}
            type="button"
            title={b.title}
            onClick={() => apply(b.action)}
            className={`px-2 h-8 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${b.action === 'bold' ? 'font-bold' : ''} ${b.action === 'italic' ? 'italic' : ''}`}
          >
            {b.label}
          </button>
        ))}
        <button type="button" onClick={() => setShowHelp((v) => !v)} className="ml-auto text-xs text-blue-600 hover:underline">
          {showHelp ? 'Сховати підказку' : 'Як розмічати'}
        </button>
      </div>

      {showHelp && (
        <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 leading-relaxed">
          <code>## Заголовок</code>, <code>### Підзаголовок</code> · <code>**жирний**</code>, <code>*курсив*</code> ·
          рядок з <code>- </code> — пункт списку, з <code>1. </code> — нумерований ·
          таблиця — рядки <code>| a | b |</code>, другий рядок <code>|---|---|</code> ·
          посилання <code>[текст](https://…)</code> · Enter — новий рядок, порожній рядок — новий абзац.
          Картинки й HTML застосунок не показує. Старі версії застосунку (до 1.3.4) отримують цей самий текст без розмітки.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3">
        <textarea
          ref={area}
          name="description"
          rows={14}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'## Склад\nЯблука 100%, без цукру.\n\n## Як зберігати\nПісля відкриття — у холодильнику до 14 днів.'}
          className="w-full rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y min-h-40"
        />
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Як у застосунку</p>
          <div className="rounded-xl bg-white border border-gray-200 dark:border-gray-700 p-3 min-h-40 max-h-[26rem] overflow-y-auto text-[14.25px] leading-[1.3] text-[#7C7C7C]">
            {text.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} skipHtml disallowedElements={['img']} unwrapDisallowed components={APP}>
                {text}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-300">Опис порожній</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
