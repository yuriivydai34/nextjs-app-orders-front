'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value ?? '';
}

export async function updateCustomer(id: string | number, data: Record<string, unknown>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to update customer');
  }

  revalidatePath('/dashboard/customers');
}

export async function deleteCustomer(id: string | number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${await getToken()}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to delete customer');
  }

  revalidatePath('/dashboard/customers');
}
