/**
 * Clerk webhook → upsert user into Postgres.
 *
 * Configure in Clerk Dashboard → Webhooks:
 *   Endpoint: https://<your-domain>/api/webhooks/clerk
 *   Events:   user.created, user.updated, user.deleted
 *
 * The CLERK_WEBHOOK_SECRET env var must be set to the signing secret
 * shown next to the endpoint in the Clerk dashboard.
 */

import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { Webhook } from "svix";

import { db, schema } from "@/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ClerkUserEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses?: { email_address: string; id: string }[];
    primary_email_address_id?: string | null;
    phone_numbers?: { phone_number: string; id: string }[];
    primary_phone_number_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    public_metadata?: Record<string, unknown>;
  };
};

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("CLERK_WEBHOOK_SECRET not set", { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();
  let evt: ClerkUserEvent;
  try {
    evt = new Webhook(secret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = evt;

  if (type === "user.deleted") {
    await db.delete(schema.users).where(eq(schema.users.id, data.id));
    return new Response("ok");
  }

  const primaryEmail = data.email_addresses?.find(
    (e) => e.id === data.primary_email_address_id,
  )?.email_address;
  const fallbackEmail = data.email_addresses?.[0]?.email_address;
  const email = primaryEmail ?? fallbackEmail;
  if (!email) {
    return new Response("no email on user", { status: 400 });
  }

  const phone =
    data.phone_numbers?.find((p) => p.id === data.primary_phone_number_id)
      ?.phone_number ??
    data.phone_numbers?.[0]?.phone_number ??
    null;

  const fullName =
    [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
    email.split("@")[0];

  // Role can be set via Clerk public metadata; default AGENT.
  const role =
    (data.public_metadata?.role as
      | typeof schema.userRoleEnum.enumValues[number]
      | undefined) ?? "AGENT";

  const values = {
    id: data.id,
    email,
    phone,
    name: fullName,
    avatarUrl: data.image_url ?? null,
    role,
    updatedAt: new Date(),
  };

  await db
    .insert(schema.users)
    .values(values)
    .onConflictDoUpdate({
      target: schema.users.id,
      set: {
        email: values.email,
        phone: values.phone,
        name: values.name,
        avatarUrl: values.avatarUrl,
        role: values.role,
        updatedAt: values.updatedAt,
      },
    });

  return new Response("ok");
}
