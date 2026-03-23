'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = 'http://localhost:3000';

export type AuthState = { error?: string } | undefined;

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { error: 'Could not connect to server.' };
  }

  if (!res.ok) {
    return { error: 'Invalid email or password.' };
  }

  const data = await res.json();
  const token: string = data.token ?? data.access_token;

  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect('/dashboard');
}

export async function register(state: AuthState, formData: FormData): Promise<AuthState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
  } catch {
    return { error: 'Could not connect to server.' };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: data?.message ?? 'Registration failed.' };
  }

  redirect('/login');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}
