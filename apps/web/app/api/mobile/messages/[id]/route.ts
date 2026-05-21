import { NextResponse } from "next/server";

import { appendMessageFromViewer } from "@/db/queries";
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

export async function POST(req: Request, { params }: Params) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  const { id: threadId } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const text = typeof (body as { body?: unknown }).body === "string"
    ? (body as { body: string }).body.trim()
    : "";
  if (!text) {
    return NextResponse.json({ error: "empty_body" }, { status: 400 });
  }

  const ok = await appendMessageFromViewer({
    threadId,
    viewerUserId: userId,
    body: text,
  });
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const thread = await loadThreadForDetail(threadId, userId);
  return NextResponse.json({ ok: true, thread });
}
