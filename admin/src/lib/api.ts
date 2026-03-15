import { auth } from './auth.svelte.ts';

async function tryRefresh(): Promise<boolean> {
  const rt = auth.refreshToken;
  if (!rt) return false;
  try {
    const res = await fetch('/api/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    auth.save(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const headers = new Headers(opts.headers);
  headers.set('Authorization', 'Bearer ' + auth.token);
  opts = { ...opts, headers };

  let res = await fetch(url, opts);

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (!refreshed) {
      auth.clear();
      location.reload();
      return res;
    }
    const retryHeaders = new Headers(opts.headers);
    retryHeaders.set('Authorization', 'Bearer ' + auth.token);
    res = await fetch(url, { ...opts, headers: retryHeaders });
    if (res.status === 401) {
      auth.clear();
      location.reload();
    }
  }

  return res;
}
