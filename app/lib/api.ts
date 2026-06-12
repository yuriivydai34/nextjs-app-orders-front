export function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('token') ?? '';
  return fetch(input, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  }).then((res) => {
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return res;
  });
}
