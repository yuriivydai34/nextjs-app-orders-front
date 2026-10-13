// The description editor's toolbar, as pure functions over the text and the
// selection, so they can be tested without a browser. The Markdown subset is
// the one agreed with the app (app-mobile, flutter_markdown_plus) and
// app-server (which strips it for old apps): ## / ### headings, **bold**,
// *italic*, - and 1. lists, GFM tables, https links; a single newline is a
// line break.

export type Edit = { text: string; start: number; end: number };

export type Action = 'h2' | 'h3' | 'bold' | 'italic' | 'list' | 'numbered' | 'table' | 'link';

const TABLE = '| Показник | Значення |\n|---|---|\n| Енергетична цінність | 45 ккал |\n| Об’єм | 1 л |';

function lineBounds(text: string, start: number, end: number): [number, number] {
  const from = text.lastIndexOf('\n', start - 1) + 1;
  const next = text.indexOf('\n', end);
  return [from, next === -1 ? text.length : next];
}

// Put a prefix on every selected line, replacing a heading or list marker
// that is already there instead of stacking a second one.
function prefixLines(e: Edit, prefix: (i: number) => string): Edit {
  const [from, to] = lineBounds(e.text, e.start, e.end);
  const lines = e.text.slice(from, to).split('\n');
  const out = lines
    .map((line, i) => prefix(i) + line.replace(/^(#{1,6}\s+|[-*]\s+|\d+\.\s+)/, ''))
    .join('\n');
  const text = e.text.slice(0, from) + out + e.text.slice(to);
  return { text, start: from, end: from + out.length };
}

function wrap(e: Edit, mark: string, placeholder: string): Edit {
  const selected = e.text.slice(e.start, e.end) || placeholder;
  const text = e.text.slice(0, e.start) + mark + selected + mark + e.text.slice(e.end);
  const start = e.start + mark.length;
  return { text, start, end: start + selected.length };
}

// A block (the table) goes on lines of its own, with a blank line around it.
function insertBlock(e: Edit, block: string): Edit {
  const before = e.text.slice(0, e.start);
  const after = e.text.slice(e.end);
  const lead = before === '' ? '' : before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
  const trail = after === '' ? '' : after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';
  const start = before.length + lead.length;
  return { text: before + lead + block + trail + after, start, end: start + block.length };
}

export function applyMarkdown(e: Edit, action: Action): Edit {
  switch (action) {
    case 'h2': return prefixLines(e, () => '## ');
    case 'h3': return prefixLines(e, () => '### ');
    case 'list': return prefixLines(e, () => '- ');
    case 'numbered': return prefixLines(e, (i) => `${i + 1}. `);
    case 'bold': return wrap(e, '**', 'жирний текст');
    case 'italic': return wrap(e, '*', 'курсив');
    case 'table': return insertBlock(e, TABLE);
    case 'link': {
      const label = e.text.slice(e.start, e.end) || 'текст посилання';
      const link = `[${label}](https://)`;
      const text = e.text.slice(0, e.start) + link + e.text.slice(e.end);
      // Cursor lands inside the URL, after https://.
      const at = e.start + label.length + 'https://'.length + 3;
      return { text, start: at, end: at };
    }
  }
}

// The app shows only https links; anything else as plain text.
export function safeUrl(url: string): string {
  return /^https:\/\//i.test(url) ? url : '';
}
