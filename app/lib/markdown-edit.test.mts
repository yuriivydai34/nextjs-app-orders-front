import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyMarkdown, safeUrl } from './markdown-edit.ts';

const at = (text: string, start = text.length, end = start) => ({ text, start, end });

test('heading goes on the start of the line, replacing one already there', () => {
  assert.equal(applyMarkdown(at('Склад', 2), 'h2').text, '## Склад');
  assert.equal(applyMarkdown(at('## Склад', 4), 'h3').text, '### Склад');
});

test('list marks every selected line', () => {
  assert.equal(applyMarkdown(at('яблуко\nгруша', 0, 12), 'list').text, '- яблуко\n- груша');
  assert.equal(applyMarkdown(at('яблуко\nгруша', 0, 12), 'numbered').text, '1. яблуко\n2. груша');
});

test('bold wraps the selection, or a placeholder that stays selected', () => {
  assert.equal(applyMarkdown(at('100% сік', 0, 4), 'bold').text, '**100%** сік');
  const e = applyMarkdown(at(''), 'bold');
  assert.equal(e.text, '**жирний текст**');
  assert.equal(e.text.slice(e.start, e.end), 'жирний текст');
});

test('a table is its own block, with blank lines around it', () => {
  const e = applyMarkdown(at('Опис'), 'table');
  assert.match(e.text, /^Опис\n\n\| Показник \| Значення \|\n\|---\|---\|/);
});

test('link puts the cursor where the address goes', () => {
  const e = applyMarkdown(at('сайт', 0, 4), 'link');
  assert.equal(e.text, '[сайт](https://)');
  assert.equal(e.start, '[сайт](https://'.length);
});

test('only https links survive, as in the app', () => {
  assert.equal(safeUrl('https://gaderia.com.ua'), 'https://gaderia.com.ua');
  assert.equal(safeUrl('http://x.com'), '');
  assert.equal(safeUrl('javascript:alert(1)'), '');
});
