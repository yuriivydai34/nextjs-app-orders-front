'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value ?? '';
}

export async function createProduct(data: Record<string, unknown>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to create product');
  }

  revalidatePath('/dashboard/products');
}

export async function updateProduct(id: number, data: Record<string, unknown>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to update product');
  }

  revalidatePath('/dashboard/products');
}

export async function deleteProduct(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${await getToken()}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to delete product');
  }

  revalidatePath('/dashboard/products');
}
