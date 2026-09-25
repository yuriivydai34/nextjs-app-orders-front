// WooCommerce order statuses, grouped the same way the API sorts on them
// (gaderia_mobile_admin_back, customer.service.ts).
const COMPLETED = ['completed'];
const CANCELLED = ['cancelled', 'refunded', 'failed'];

export const STATUS_LABELS: Record<string, string> = {
  completed: 'виконано',
  processing: 'в обробці',
  'on-hold': 'на утриманні',
  pending: 'очікує оплати',
  cancelled: 'скасовано',
  refunded: 'повернено',
  failed: 'не вдалося',
  'checkout-draft': 'чернетка',
};

type Order = { status?: string | null; total?: string | null };

export function orderStats(orders: Order[] | undefined) {
  let completed = 0;
  let cancelled = 0;
  let completedSum = 0;
  for (const o of orders ?? []) {
    if (COMPLETED.includes(o.status ?? '')) {
      completed++;
      completedSum += Number(o.total) || 0;
    } else if (CANCELLED.includes(o.status ?? '')) {
      cancelled++;
    }
  }
  const total = orders?.length ?? 0;
  return {
    total,
    completed,
    cancelled,
    inProgress: total - completed - cancelled,
    completedSum: Number(completedSum.toFixed(2)),
  };
}
