import { verifyToken } from "@clerk/backend";

/**
 * Verifies `Authorization: Bearer <session_jwt>` from the native app (Clerk Expo `getToken()`).
 */
export async function getUserIdFromMobileRequest(
  req: Request,
): Promise<string | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token) return null;

  /** Local integration tests only (`scripts/test-mobile-publish.sh`). Never set in production. */
  const devBypassId = process.env.DEV_MOBILE_BYPASS_USER_ID?.trim();
  if (
    process.env.NODE_ENV === "development" &&
    devBypassId &&
    token === "dev-bypass"
  ) {
    return devBypassId;
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  try {
    const payload = await verifyToken(token, { secretKey });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
