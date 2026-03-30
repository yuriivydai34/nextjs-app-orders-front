export type AuthState = { error?: string } | undefined;

export async function login(email: string, password: string): Promise<AuthState> {
  let res: Response;
  try {
    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
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
  localStorage.setItem('token', token);
  window.location.href = '/dashboard';
}

export async function register(name: string, email: string, password: string): Promise<AuthState> {
  let res: Response;
  try {
    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
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

  window.location.href = '/login';
}

export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
