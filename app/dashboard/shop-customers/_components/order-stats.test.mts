import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orderStats } from './order-stats.ts';

test('last purchase is the newest completed order, not the newest order', () => {
  const s = orderStats([
    { status: 'completed', total: '300', date: '2025-03-01T10:00:00' },
    { status: 'completed', total: '200', date: '2026-01-15T09:00:00' },
    { status: 'cancelled', total: '500', date: '2026-10-01T12:00:00' },
  ]);
  assert.equal(s.lastCompletedAt, '2026-01-15T09:00:00');
  assert.equal(s.completedSum, 500);
});

test('never bought: no last purchase', () => {
  assert.equal(orderStats([{ status: 'pending', total: '100', date: '2026-10-01T12:00:00' }]).lastCompletedAt, null);
  assert.equal(orderStats(undefined).lastCompletedAt, null);
});
