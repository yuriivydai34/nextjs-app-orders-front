import { test } from 'node:test';
import assert from 'node:assert/strict';
import { productTypeLabel } from './product-types.ts';

test('the type column in words, as the products actually are', () => {
  assert.equal(productTypeLabel({ type_product: 'JUICE', type_juice: 'PEARAPPLE' }), 'Сік · Яблучно-грушевий');
  assert.equal(productTypeLabel({ type_product: 'VINEGAR', type_vinegar: 'BALSAMIC' }), 'Оцет · Бальзамічний');
  assert.equal(productTypeLabel({ type_product: 'APPLE', type_apple: 'GALA' }), 'Яблука · Гала');
});

// The pear balsamic: a vinegar with a juice flavour and no vinegar kind. The
// flavour belongs to no vinegar, so it is not shown; the missing kind is.
test('a vinegar without its kind shows just "Оцет", whatever else is stored', () => {
  assert.equal(productTypeLabel({ type_product: 'VINEGAR', type_juice: 'PEAR', type_vinegar: null }), 'Оцет');
});

test('codes the app does not know are marked, not passed off as real', () => {
  assert.equal(productTypeLabel({ type_product: 'JUICE', type_juice: 'PEAR' }), 'Сік · PEAR?');
  assert.equal(productTypeLabel({ type_product: 'OTHER' }), 'OTHER?');
  assert.equal(productTypeLabel({}), '—');
});
