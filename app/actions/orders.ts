import { apiFetch } from '../lib/api';

export async function updateOrder(id: number, data: { ttn?: string; status?: string }) {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to update order');
  }
}
