/**
 * Expo resolves `EXPO_PUBLIC_*` at bundle time. Mobile API origin is separate from the
 * marketing web URL in production, but locally both often point at Next on port **3101**.
 */

import { resolveExpoMobileApiOrigin } from '@/lib/resolve-expo-api-origin';

/** Resolved origin for `/api/mobile/*` (includes dev emulator/LAN rewrites). */
export function getExpoMobileApiOriginHint(): string | null {
  return resolveExpoMobileApiOrigin();
}

/** True when the Expo bundle has an origin for `/api/mobile/*` (+ support uses WEB when set). */
export function isMobileApiConfigured(): boolean {
  return getExpoMobileApiOriginHint() != null;
}
