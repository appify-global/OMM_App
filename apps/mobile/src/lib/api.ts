import { apiBaseUrl } from "../config/env";

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function fetchJsonAuthorized(
  url: string,
  bearer: string,
): Promise<{ res: Response; text: string }> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${bearer}`,
    },
  });
  const text = await res.text();
  return { res, text };
}

function parseBody(
  res: Response,
  text: string,
):
  | { ok: true; data: unknown }
  | { ok: false; status: number; error: string } {
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
  return { ok: true, data: json };
}

export type ApiMobileGetJsonOptions = {
  /**
   * Invoked when there is no token or the server still returns 401 after one retry
   * with a freshly requested token (session revoked / expired).
   */
  onSessionInvalid?: () => void | Promise<void>;
};

export async function apiMobileGetJson<T>(
  path: string,
  getToken: () => Promise<string | null>,
  options?: ApiMobileGetJsonOptions,
): Promise<
  { ok: true; data: T } | { ok: false; status: number; error: string }
> {
  const base = apiBaseUrl();
  if (!base) {
    return { ok: false, status: 0, error: "EXPO_PUBLIC_API_URL is not set" };
  }
  const url = joinUrl(base, path);

  let token = await getToken();
  if (!token) {
    return { ok: false, status: 401, error: "Not signed in" };
  }

  let attempt: { res: Response; text: string };
  try {
    attempt = await fetchJsonAuthorized(url, token);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return { ok: false, status: 0, error: msg };
  }

  if (attempt.res.status === 401) {
    token = await getToken();
    if (token) {
      try {
        attempt = await fetchJsonAuthorized(url, token);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Network error";
        return { ok: false, status: 0, error: msg };
      }
    } else {
      await options?.onSessionInvalid?.();
      return {
        ok: false,
        status: 401,
        error: "Session expired. Please sign in again.",
      };
    }
  }

  if (attempt.res.status === 401) {
    await options?.onSessionInvalid?.();
    let err = "Session expired. Please sign in again.";
    try {
      const j = attempt.text ? JSON.parse(attempt.text) : null;
      if (
        j &&
        typeof j === "object" &&
        "error" in j &&
        typeof (j as { error: unknown }).error === "string"
      ) {
        err = (j as { error: string }).error;
      }
    } catch {
      /* keep default */
    }
    return { ok: false, status: 401, error: err };
  }

  const parsed = parseBody(attempt.res, attempt.text);
  if (!parsed.ok) return parsed;
  return { ok: true, data: parsed.data as T };
}
