import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INACTIVE_RANGES, inactiveQuery, readInactiveRange } from './inactive-range.ts';

test('the bounded ranges follow on from each other, from a week to a year and over', () => {
  const chain = INACTIVE_RANGES.filter((r) => r.key !== '30-');
  for (let i = 1; i < chain.length; i++) assert.equal(chain[i].min, chain[i - 1].max);
  assert.equal(chain[0].min, 7);
  assert.equal(chain[chain.length - 1].max, undefined);
});

test('URL value to API query', () => {
  assert.deepEqual(inactiveQuery(readInactiveRange('60-90')), { inactiveDays: '60', inactiveMaxDays: '90' });
  assert.deepEqual(inactiveQuery(readInactiveRange('365-')), { inactiveDays: '365' });
  assert.deepEqual(inactiveQuery(readInactiveRange('90')), {});
  assert.deepEqual(inactiveQuery(readInactiveRange(null)), {});
});
