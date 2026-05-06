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
