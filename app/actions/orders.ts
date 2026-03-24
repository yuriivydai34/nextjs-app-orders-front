'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateOrder(id: number, data: { ttn?: string; status?: string }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? '';

  const res = await fetch(`http://localhost:3000/payments/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to update order');
  }

  revalidatePath('/dashboard/orders');
}
