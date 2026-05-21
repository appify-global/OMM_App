import {
  resolveExpoMobileApiOrigin,
  resolveExpoWebOrigin,
} from '@/lib/resolve-expo-api-origin';

/**
 * Resolve the origin for an Expo `fetch` path.
 * - `/api/mobile/*` → `OMM_BACKEND` (`EXPO_PUBLIC_MOBILE_API_ORIGIN` / `EXPO_PUBLIC_API_URL`, port 3102).
 * - `/api/support/*` → `apps/web` (`EXPO_PUBLIC_WEB_ORIGIN`, port 3101).
 * Web `/app` uses `BACKEND_URL` → same `OMM_BACKEND` host as mobile.
 */
function expoApiBaseForPath(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;

  if (p.startsWith('/api/support/')) {
    const web = resolveExpoWebOrigin();
    if (web) return web;
  }

  if (p.startsWith('/api/mobile/')) {
    const mobile = resolveExpoMobileApiOrigin();
    if (mobile) return mobile;
  }

  throw new Error(
    'Set EXPO_PUBLIC_MOBILE_API_ORIGIN or EXPO_PUBLIC_API_URL to OMM_BACKEND — e.g. http://127.0.0.1:3102 while `npm run dev:backend` runs.',
  );
}

/** Last-resolved mobile API origin (for error messages). */
export function getExpoMobileApiBase(): string | null {
  return resolveExpoMobileApiOrigin();
}

/**
 * Call the API with a Clerk session JWT (`CLERK_SECRET_KEY` on the service that handles the route).
 */
export async function apiFetch(
  path: string,
  getToken: () => Promise<string | null>,
  init: RequestInit = {},
): Promise<Response> {
  const base = expoApiBaseForPath(path);
  const token = await getToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(`${base}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers,
  });
}

/** POST JSON (supports split origins via `expoApiBaseForPath`). */
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
