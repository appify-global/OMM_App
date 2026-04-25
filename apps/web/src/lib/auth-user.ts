import { auth } from "@clerk/nextjs/server";

import { DEMO_AGENT_ID } from "./app-constants";

/**
 * Clerk user id, or a stable dev id when `BYPASS_CLERK_AUTH` is on.
 * `users.id` in Postgres should match the Clerk `userId` (webhook).
 */
export async function getAppUserId(): Promise<string> {
  const bypass =
    process.env.BYPASS_CLERK_AUTH === "true" ||
    process.env.BYPASS_CLERK_AUTH === "1";
  if (bypass) {
    return process.env.DEV_IMPERSONATE_USER_ID?.trim() || DEMO_AGENT_ID;
  }
  const a = await auth();
  if (a.userId) return a.userId;
  return DEMO_AGENT_ID;
}
