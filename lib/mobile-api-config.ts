/** True when Expo can reach the Next.js API (`EXPO_PUBLIC_API_URL`). */
export function isMobileApiConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_API_URL?.trim());
}
