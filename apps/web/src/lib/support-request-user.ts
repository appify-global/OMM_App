import { auth } from "@clerk/nextjs/server";

import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";

/**
 * Prefer Bearer JWT (Expo); fall back to Clerk session cookie (web).
 */
export async function getOptionalSupportUserId(req: Request): Promise<string | null> {
  const fromBearer = await getUserIdFromMobileRequest(req);
  if (fromBearer) return fromBearer;
  const { userId } = await auth();
  return userId ?? null;
}
