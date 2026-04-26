import { apiBaseUrl } from "../config/env";

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export async function apiMobileGetJson<T>(
  path: string,
  getToken: () => Promise<string | null>,
): Promise<
  { ok: true; data: T } | { ok: false; status: number; error: string }
> {
  const base = apiBaseUrl();
  if (!base) {
    return { ok: false, status: 0, error: "EXPO_PUBLIC_API_URL is not set" };
  }
  const token = await getToken();
  if (!token) {
    return { ok: false, status: 401, error: "Not signed in" };
  }
  const url = joinUrl(base, path);
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return { ok: false, status: 0, error: msg };
  }
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    return { ok: false, status: res.status, error: text.slice(0, 200) };
  }
  if (!res.ok) {
    const err =
      typeof json === "object" &&
      json !== null &&
      "error" in json &&
      typeof (json as { error: unknown }).error === "string"
        ? (json as { error: string }).error
        : res.statusText;
    return { ok: false, status: res.status, error: err };
  }
  return { ok: true, data: json as T };
}
