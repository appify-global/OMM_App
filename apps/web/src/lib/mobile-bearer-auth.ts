import { verifyToken } from "@clerk/backend";

/**
 * Validates `Authorization: Bearer <session_jwt>` from the Expo app.
 * Requires `CLERK_SECRET_KEY` (same as Clerk Dashboard → API keys → Secret).
 */
export async function getUserIdFromMobileRequest(
  req: Request,
): Promise<{ userId: string } | { error: string; status: number }> {
  const auth = req.headers.get("authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }
  const token = auth.slice(7).trim();
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    return { error: "Server missing CLERK_SECRET_KEY", status: 500 };
  }
  try {
    const payload = await verifyToken(token, { secretKey });
    const sub = payload.sub;
    if (!sub || typeof sub !== "string") {
      return { error: "Invalid token", status: 401 };
    }
    return { userId: sub };
  } catch {
    return { error: "Unauthorized", status: 401 };
  }
}
