import { NextResponse } from "next/server";

import { loadNotificationsList } from "../../../app/_data/rsc-loaders";
import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const items = await loadNotificationsList(userId);
    return NextResponse.json({ items });
  } catch (e) {
    console.error("[api/mobile/notifications]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
