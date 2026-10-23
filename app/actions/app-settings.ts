import { apiFetch } from '../lib/api';

// A box rule for juices by the bottle: bottles of `measurement` litres go in
// boxes of `n`; `msg` has {N} for how many are missing.
export type PackRule = { measurement: number; n: number; label: string; msg: string; enabled: boolean };

// A ready-made mix: one tap puts a whole box of these bottles in the app's
// cart. Flavours are juice codes (JUICE_TYPES); together they fill one box.
export type PackMix = {
  id: string;
  name: string;
  measurement: number;
  items: { juice: string; qty: number }[];
  enabled: boolean;
};

// Switches in the app that the panel turns on and off without a release
// (gaderia_mobile_admin_back src/app-setting).
export type AppSettings = {
  new_carousel_enabled: boolean;
  /** The promotions carousel at the top of the app (dashboard/banners). */
  banners_enabled: boolean;
  // As 1.3.2; null when not set.
  min_app_version: string | null;
  latest_app_version: string | null;
  // The promo code field at checkout, app 1.3.3+.
  promo_field_enabled: boolean;
  // Juices by the bottle (admin back src/app-setting/own-sets.ts).
  own_sets_mode: 'off' | 'testers' | 'on';
  own_sets_testers: number[];
  pack_rules: PackRule[];
  pack_mixes: PackMix[];
  // The Telegram bot. null: the bot's own text or .env value.
  bot_sale_text: string | null;
  bot_manager_username: string | null;
  bot_manager_work_hours: string | null;
  bot_notify_enabled: boolean;
};

export async function getAppSettings(): Promise<AppSettings> {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/app-settings`);
  if (!res.ok) throw new Error('Не вдалося завантажити налаштування');
  return res.json();
}

export async function updateAppSettings(data: Partial<AppSettings>): Promise<AppSettings> {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/app-settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Не вдалося зберегти');
  }
  return res.json();
}
