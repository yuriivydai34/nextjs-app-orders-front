export type DiscountType = 'PERCENT' | 'FIXED';

export type PromoCode = {
  id: number;
  code: string;
  title: string | null;
  discount_type: DiscountType;
  discount_value: number;
  usage_limit: number | null;
  starts_at: string | null;
  ends_at: string | null;
  first_order_only: boolean;
  max_account_age_days: number | null;
  is_active: boolean;
  createdAt: string;
  // Statistics. `used` counts towards the limit; `cancelled` freed its place.
  used: number;
  cancelled: number;
  discount_total: number;
  order_total: number;
  last_used_at: string | null;
};

export type Redemption = {
  id: number;
  source: 'APP' | 'WOO';
  payment_id: number | null;
  external_order_id: string | null;
  order_amount: number;
  discount_amount: number;
  createdAt: string;
  account_id: number | null;
  email: string | null;
  full_name: string | null;
  order_id: string | null;
  status: string | null;
  payment_amount: number | null;
};

export type Status = { label: string; className: string };

// What a manager needs at a glance: does the code work right now, and if not, why.
export function promoStatus(p: PromoCode, now = new Date()): Status {
  if (!p.is_active) return { label: 'Вимкнено', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
  if (p.starts_at && new Date(p.starts_at) > now) return { label: 'Заплановано', className: 'bg-blue-100 text-blue-700' };
  if (p.ends_at && new Date(p.ends_at) < now) return { label: 'Завершено', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
  if (p.usage_limit !== null && p.used >= p.usage_limit) return { label: 'Вичерпано', className: 'bg-orange-100 text-orange-700' };
  return { label: 'Діє', className: 'bg-green-100 text-green-700' };
}

export function formatDiscount(p: Pick<PromoCode, 'discount_type' | 'discount_value'>): string {
  return p.discount_type === 'PERCENT' ? `−${p.discount_value}%` : `−${money(p.discount_value)}`;
}

export function money(value: number): string {
  return `${value.toLocaleString('uk-UA', { maximumFractionDigits: 2 })} грн`;
}

export function day(value: string | null): string {
  return value ? new Date(value).toLocaleDateString('uk-UA') : '';
}

// The conditions in words, for the list.
export function conditions(p: PromoCode): string[] {
  const out: string[] = [];
  if (p.starts_at && p.ends_at) out.push(`${day(p.starts_at)} – ${day(p.ends_at)}`);
  else if (p.starts_at) out.push(`з ${day(p.starts_at)}`);
  else if (p.ends_at) out.push(`до ${day(p.ends_at)}`);
  if (p.usage_limit !== null) out.push(`ліміт ${p.usage_limit}`);
  if (p.first_order_only) out.push('лише перше замовлення');
  if (p.max_account_age_days) out.push(`акаунт до ${p.max_account_age_days} дн.`);
  return out;
}

export const ORDER_STATUS: Record<string, string> = {
  WAITING: 'Очікування',
  WORK: 'Оплачено',
  CANCELED: 'Скасовано',
  COMPLETED: 'Виконано',
};
