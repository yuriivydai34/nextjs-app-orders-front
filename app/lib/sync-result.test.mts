import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeSyncResult } from './sync-result.ts';

test('one re-read order and nobody new is "no changes", with the reason', () => {
  const d = describeSyncResult({ ordersScanned: 1, created: 0, updated: 1, linkedToExisting: 0 });
  assert.equal(d.summary, 'Змін на сайті немає');
  assert.match(d.detail ?? '', /останнє відоме замовлення/);
});

test('nothing read at all is "no changes" without the explanation', () => {
  assert.deepEqual(describeSyncResult({ ordersScanned: 0, created: 0, updated: 0, linkedToExisting: 0 }), {
    summary: 'Змін на сайті немає',
    detail: undefined,
  });
});

test('real changes are counted', () => {
  assert.equal(
    describeSyncResult({ ordersScanned: 4, created: 1, updated: 2, linkedToExisting: 1 }).summary,
    'Замовлень: 4 · нових покупців: 1 · оновлено: 2 · зіставлено: 1',
  );
  // A single order from a new buyer is a change too.
  assert.match(describeSyncResult({ ordersScanned: 1, created: 1, updated: 0, linkedToExisting: 0 }).summary, /нових покупців: 1/);
});
