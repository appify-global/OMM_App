import "server-only";

import { createClerkClient } from "@clerk/backend";
import { eq } from "drizzle-orm";

import { db, schema } from "@/db";

/**
 * First mobile API hits can run before the Clerk webhook inserts the user row.
 * Hydrates `users` from Clerk when missing (same fields as webhook).
 */
export async function ensureClerkUserInDatabase(userId: string): Promise<
  { ok: true } | { ok: false; reason: "missing_clerk_secret" | "clerk_fetch_failed" | "no_email" }
> {
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  if (existing.length) return { ok: true };

  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) {
    return { ok: false, reason: "missing_clerk_secret" };
  }

  const clerk = createClerkClient({ secretKey: secret });
  let u: Awaited<ReturnType<typeof clerk.users.getUser>>;
  try {
    u = await clerk.users.getUser(userId);
  } catch {
    return { ok: false, reason: "clerk_fetch_failed" };
  }

  const primaryEmail =
    u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ??
    u.emailAddresses[0]?.emailAddress;
  if (!primaryEmail) {
    return { ok: false, reason: "no_email" };
  }

  const phone =
    u.phoneNumbers.find((p) => p.id === u.primaryPhoneNumberId)?.phoneNumber ??
    u.phoneNumbers[0]?.phoneNumber ??
    null;

  const fullName =
    [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
    primaryEmail.split("@")[0];

  const role =
    (u.publicMetadata?.role as typeof schema.userRoleEnum.enumValues[number] | undefined) ??
    "AGENT";

  const now = new Date();
  await db
    .insert(schema.users)
    .values({
      id: userId,
      email: primaryEmail,
      phone,
      name: fullName,
      avatarUrl: u.imageUrl ?? null,
      role,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: {
        email: primaryEmail,
        phone,
        name: fullName,
        avatarUrl: u.imageUrl ?? null,
        role,
        updatedAt: now,
      },
    });

  return { ok: true };
}
