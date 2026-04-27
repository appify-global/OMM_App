import { NextResponse } from "next/server";

import { loadThreadForDetail } from "../../../../app/_data/rsc-loaders";
import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const thread = await loadThreadForDetail(id, userId);
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(thread);
  } catch (e) {
    console.error("[api/mobile/messages/[id]]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
