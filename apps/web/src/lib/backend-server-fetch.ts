import "server-only";

import { auth } from "@clerk/nextjs/server";

import { getPublicBackendOrigin } from "./backend-public-origin";

const LOCAL_OMM_BACKEND = "http://127.0.0.1:3102";

export function backendServerOrigin(): string {
  const explicit = process.env.BACKEND_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const pub = getPublicBackendOrigin();
  if (pub) return pub;
  /** Web `/app` RSC → `OMM_BACKEND` (`/api/mobile/*`), not marketing Next on 3101. */
  if (process.env.NODE_ENV === "development") {
    return LOCAL_OMM_BACKEND;
  }
  return "";
}

export async function backendAuthorizedFetch(
  pathname: string,
  init?: RequestInit,
): Promise<Response> {
  const base = backendServerOrigin();
  if (!base) {
    throw new Error(
      "BACKEND_URL or NEXT_PUBLIC_BACKEND_URL must be set to load authenticated data.",
    );
  }
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) {
    throw new Error(
      "Missing Clerk session token — sign in again to talk to the API backend.",
    );
  }
  const url =
    pathname.startsWith("http") ? pathname : `${base}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function backendAuthorizedJson<T>(
  pathname: string,
  init?: RequestInit,
): Promise<T> {
  const res = await backendAuthorizedFetch(pathname, init);
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`Backend ${pathname} failed (${res.status}): ${text}`);
  }
  return JSON.parse(text) as T;
}
