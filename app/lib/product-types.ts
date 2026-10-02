import { JUICE_LABELS, JUICE_TYPES } from './juice-types.ts';

// Every choice a product has, with the codes the app (lib/config/enum.dart)
// and app-server (enum_declare.js) understand. Anything else stored in the
// catalog is invisible to the app's filters, so the form offers only these.
// gaderia_mobile_admin_back/src/catalog/catalog-input.ts checks the same lists.

type Choice = { value: string; label: string };

export const PRODUCT_TYPES: readonly Choice[] = [
  { value: 'JUICE', label: 'Сік' },
  { value: 'VINEGAR', label: 'Оцет' },
  { value: 'APPLE', label: 'Яблука' },
  // One kind for now, so no type field of its own (no SUBTYPE entry).
  { value: 'HONEY', label: 'Мед' },
];

export const VINEGAR_TYPES: readonly Choice[] = [
  { value: 'FILTERED', label: 'Фільтрований' },
  { value: 'UNFILTERED', label: 'Нефільтрований' },
  { value: 'BALSAMIC', label: 'Бальзамічний' },
];

export const APPLE_TYPES: readonly Choice[] = [
  { value: 'REDJONAPRINCE', label: 'Ред Джонапринс' },
  { value: 'MODI', label: 'Моді' },
  { value: 'IDARED', label: 'Айдаред' },
  { value: 'FLORINA', label: 'Флоріна' },
  { value: 'FUJI', label: 'Фуджі' },
  { value: 'GALA', label: 'Гала' },
  { value: 'GOLDENDELICIOUS', label: 'Голден Делішес' },
  { value: 'REDCHIEF', label: 'Ред Чіф' },
  { value: 'GRANNYSMITH', label: 'Гренні Сміт' },
];

export const PACKAGING_TYPES: readonly Choice[] = [
  { value: 'GLASS', label: 'Скло' },
  { value: 'BAGINBOX', label: 'Bag-in-box' },
];

export const MEASUREMENT_TYPES: readonly Choice[] = [
  { value: 'LITER', label: 'л' },
  { value: 'KG', label: 'кг' },
];

// The one type field that belongs to each kind of product.
export const SUBTYPE: Record<string, { field: 'type_juice' | 'type_vinegar' | 'type_apple'; label: string; choices: readonly Choice[] }> = {
  JUICE: { field: 'type_juice', label: 'Смак', choices: JUICE_TYPES },
  VINEGAR: { field: 'type_vinegar', label: 'Вид оцту', choices: VINEGAR_TYPES },
  APPLE: { field: 'type_apple', label: 'Сорт', choices: APPLE_TYPES },
};

const labelOf = (choices: readonly Choice[], value: string | null | undefined) =>
  value ? choices.find((c) => c.value === value)?.label ?? null : null;

type Typed = {
  type_product?: string | null;
  type_juice?: string | null;
  type_vinegar?: string | null;
  type_apple?: string | null;
};

/**
 * "Оцет · Бальзамічний", "Сік · Яблучний". A code the lists do not know is
 * shown with a "?" so it can be spotted and fixed, rather than passed off as
 * a real type.
 */
export function productTypeLabel(p: Typed): string {
  const kind = labelOf(PRODUCT_TYPES, p.type_product) ?? (p.type_product ? `${p.type_product}?` : '—');
  const sub = p.type_product ? SUBTYPE[p.type_product] : undefined;
  const code = sub ? p[sub.field] : null;
  if (!code) return kind;
  const label = sub?.field === 'type_juice' ? JUICE_LABELS[code] : labelOf(sub?.choices ?? [], code);
  return `${kind} · ${label ?? `${code}?`}`;
}
