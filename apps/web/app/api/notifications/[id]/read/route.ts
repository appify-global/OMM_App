import { NextResponse } from "next/server";

import { getAppUserId } from "@/lib/auth-user";
import { markNotificationRead } from "@/db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params;
  const userId = await getAppUserId();
  const ok = await markNotificationRead(id, userId);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
