import { apiFetch } from '../lib/api';

export type PushDraft = {
  title: string;
  body: string;
  image?: string;
  // Resend the same text to one person instead of broadcasting to everyone.
  account_id?: number;
};

/**
 * Broadcasts a push notification (or resends one to a single account), via
 * our own API — which holds the app-server token server-side, so it never
 * reaches the browser. See gaderia_mobile_admin_back src/push/push.service.ts.
 */
export async function sendPush(draft: PushDraft): Promise<void> {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/push/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  });
  if (res.ok) return;
  // Our API forwards app-server's own wording (or its own validation
  // message) as { message }, same convention as promotions/products.
  const err = await res.json().catch(() => ({}));
  throw new Error(typeof err?.message === 'string' ? err.message : 'Не вдалося надіслати');
}
