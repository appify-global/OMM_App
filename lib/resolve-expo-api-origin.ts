import Constants from 'expo-constants';
import { Platform } from 'react-native';

function stripTrailingSlash(s: string): string {
  return s.replace(/\/$/, '');
}

function firstOrigin(...candidates: (string | undefined)[]): string | null {
  for (const c of candidates) {
    const t = c?.trim();
    if (t) return stripTrailingSlash(t);
  }
  return null;
}

/**
 * Metro host (e.g. `192.168.0.12:8081`) — use the IP so a physical device can reach Next on the Mac.
 */
function metroLanHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } })
      .manifest2?.extra?.expoClient?.hostUri;
  if (typeof hostUri !== 'string' || !hostUri.includes(':')) return null;
  const host = hostUri.split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  return host;
}

/** Rewrite loopback in dev so emulators / physical devices reach the Mac running `npm run dev`. */
function rewriteLocalOriginForPlatform(origin: string): string {
  if (!__DEV__) return origin;

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return origin;
  }

  const isLoopback = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
  if (!isLoopback) return origin;

  if (Platform.OS === 'android') {
    url.hostname = '10.0.2.2';
    return stripTrailingSlash(url.toString());
  }

  const lan = metroLanHost();
  if (lan && Platform.OS === 'ios') {
    url.hostname = lan;
    return stripTrailingSlash(url.toString());
  }

  return origin;
}

/**
 * Origin for Expo `fetch` to `/api/mobile/*` — `OMM_BACKEND` (port 3102) when split locally.
 * Do not fall back to `EXPO_PUBLIC_WEB_ORIGIN` before `EXPO_PUBLIC_API_URL` (web is 3101, API is 3102).
 */
export function resolveExpoMobileApiOrigin(): string | null {
  const configured = firstOrigin(
    process.env.EXPO_PUBLIC_MOBILE_API_ORIGIN,
    process.env.EXPO_PUBLIC_API_URL,
    process.env.EXPO_PUBLIC_WEB_ORIGIN,
  );
  if (!configured) return null;
  return rewriteLocalOriginForPlatform(configured);
}

/** Marketing / support routes on the Next site (same host locally). */
export function resolveExpoWebOrigin(): string | null {
  const configured = firstOrigin(
    process.env.EXPO_PUBLIC_WEB_ORIGIN,
    process.env.EXPO_PUBLIC_SITE_URL,
    process.env.EXPO_PUBLIC_MOBILE_API_ORIGIN,
    process.env.EXPO_PUBLIC_API_URL,
  );
  if (!configured) return null;
  return rewriteLocalOriginForPlatform(configured);
}
