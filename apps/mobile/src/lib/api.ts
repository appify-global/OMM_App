import { apiBaseUrl } from "./env";

export async function mobileFetch<T>(
  path: string,
  getToken: () => Promise<string | null>,
  init?: RequestInit,
): Promise<T> {
  const token = await getToken();
  const url = `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) {
    throw new Error("Session expired. Sign in again.");
  }
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function mobilePost<T>(
  path: string,
  getToken: () => Promise<string | null>,
  body?: unknown,
): Promise<T> {
  return mobileFetch<T>(path, getToken, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
