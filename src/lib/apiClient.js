'use client';
export default async function apiFetch(url, opts = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) };
  let res = await fetch(url, { ...opts, headers, credentials: 'include' });
  if (res.status === 401 && !opts._retry) {
    const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    if (r.ok) {
      const d = await r.json();
      if (d.data?.accessToken) {
        localStorage.setItem('accessToken', d.data.accessToken);
        res = await fetch(url, { ...opts, headers: { ...headers, Authorization: `Bearer ${d.data.accessToken}` }, credentials: 'include', _retry: true });
      }
    } else {
      localStorage.removeItem('accessToken'); localStorage.removeItem('user');
      window.location.href = '/login'; return null;
    }
  }
  return res;
}
