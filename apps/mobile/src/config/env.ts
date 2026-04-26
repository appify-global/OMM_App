/**
 * Expo inlines `EXPO_PUBLIC_*` at bundle time. Set in `.env` / EAS env / `app.config`.
 * @see https://docs.expo.dev/guides/environment-variables/
 */
export const clerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? '';

export function hasClerkConfigured(): boolean {
  return clerkPublishableKey.length > 0;
}

/** Next.js app origin (no trailing slash), e.g. `http://192.168.1.5:3101` or production `https://…`. */
export const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "";

export function hasApiConfigured(): boolean {
  return apiBaseUrl.length > 0;
}
