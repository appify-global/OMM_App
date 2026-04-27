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
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  try {
    const payload = await verifyToken(token, { secretKey });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
