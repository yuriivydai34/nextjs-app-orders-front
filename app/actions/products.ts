import { apiFetch } from '../lib/api';

export async function createProduct(data: Record<string, unknown>) {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to create product');
  }
}

export async function updateProduct(id: number, data: Record<string, unknown>) {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to update product');
  }
}

export async function deleteProduct(id: number) {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to delete product');
  }
}
