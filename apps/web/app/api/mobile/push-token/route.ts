import { NextResponse } from "next/server";

import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PushTokenBody = {
  token?: string;
  platform?: string;
};

/**
 * Registers an Expo push token for the signed-in Clerk user.
 * When DATABASE_URL is wired, persist tokens here for broadcast via Expo Push API.
 */
export async function POST(req: Request) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PushTokenBody;
  try {
    body = (await req.json()) as PushTokenBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token.startsWith("ExponentPushToken")) {
    return NextResponse.json({ error: "Invalid Expo push token" }, { status: 400 });
  }

  const platform =
    typeof body.platform === "string" ? body.platform.slice(0, 32) : "unknown";

  if (process.env.NODE_ENV !== "production") {
    console.info("[api/mobile/push-token]", {
      userId,
      platform,
      tokenPrefix: `${token.slice(0, 28)}…`,
    });
  }

  /* Future: upsert into Postgres keyed by userId + token for Expo Push broadcasts */
  return NextResponse.json({ ok: true });
}
