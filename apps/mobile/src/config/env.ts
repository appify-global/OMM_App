/**
 * Expo inlines `EXPO_PUBLIC_*` at bundle time. Set in `.env` / EAS env / `app.config`.
 * @see https://docs.expo.dev/guides/environment-variables/
 */
export const clerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? '';

export function hasClerkConfigured(): boolean {
  return clerkPublishableKey.length > 0;
}
