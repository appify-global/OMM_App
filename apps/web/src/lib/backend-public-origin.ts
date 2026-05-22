/** Public backend origin — same value as Expo `EXPO_PUBLIC_API_URL`. */
export function getPublicBackendOrigin(): string {
  return (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").trim().replace(/\/$/, "");
}
