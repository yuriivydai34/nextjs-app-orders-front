import { apiFetch } from '../lib/api';

// Switches in the app that the panel turns on and off without a release
// (gaderia_mobile_admin_back src/app-setting).
export type AppSettings = {
  new_carousel_enabled: boolean;
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
