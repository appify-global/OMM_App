/**
 * Call your Railway API with a Clerk session JWT.
 * The server must verify the token with CLERK_SECRET_KEY (see server/).
 */
export async function apiFetch(
  path: string,
  getToken: () => Promise<string | null>,
  init: RequestInit = {},
): Promise<Response> {
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (!base) {
    throw new Error('Set EXPO_PUBLIC_API_URL in .env for this project');
  }
  const token = await getToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(`${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers,
  });
}

/** POST JSON to the Next.js API (e.g. `/api/support/*`). Auth header added when a Clerk token exists. */
export async function postJsonApi(
  path: string,
  getToken: () => Promise<string | null>,
  body: Record<string, unknown>,
): Promise<
  { ok: true; status: number } | { ok: false; error: string; status: number }
> {
  const res = await apiFetch(path, getToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    return { ok: false, error: data.error ?? 'request_failed', status: res.status };
  }
  return { ok: true, status: res.status };
}
