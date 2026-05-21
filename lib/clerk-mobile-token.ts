/**
 * Clerk Expo can report `isSignedIn` before `getToken()` returns a session JWT.
 * Mobile API calls must wait briefly or they hit the backend as anonymous → 401.
 */

export type ClerkGetToken = () => Promise<string | null | undefined>;

export async function getClerkMobileBearerToken(
  getToken: ClerkGetToken,
  options?: { retries?: number; delayMs?: number },
): Promise<string | null> {
  const retries = options?.retries ?? 4;
  const delayMs = options?.delayMs ?? 150;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const token = await getToken();
      if (typeof token === 'string' && token.length > 0) {
        return token;
      }
    } catch {
      /* session still hydrating */
    }
    if (attempt < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  return null;
}
