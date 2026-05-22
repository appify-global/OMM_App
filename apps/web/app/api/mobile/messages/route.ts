import { NextResponse } from "next/server";

import { findOrCreateThreadForOwner } from "@/db/queries";
import { loadMessagesInbox, loadThreadForDetail } from "../../../app/_data/rsc-loaders";
import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await loadMessagesInbox(userId);
    return NextResponse.json(data);
  } catch (e) {
    console.error("[api/mobile/messages]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

type CreateThreadBody = {
  participantName?: string;
  participantFirm?: string;
  context?: string;
  category?: string;
  seedInboundBody?: string;
};

export async function POST(req: Request) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const b = body as CreateThreadBody;
  const participantName =
    typeof b.participantName === "string" ? b.participantName.trim() : "";
  const context = typeof b.context === "string" ? b.context.trim() : "";
  if (!participantName || !context) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const categoryRaw = typeof b.category === "string" ? b.category.toUpperCase() : "LISTING";
  const allowed = ["BUYER", "LISTING", "BRIEF", "VENDOR", "PLATFORM"] as const;
  const category = allowed.includes(categoryRaw as (typeof allowed)[number])
    ? (categoryRaw as (typeof allowed)[number])
    : "LISTING";

  const threadId = await findOrCreateThreadForOwner({
    ownerId: userId,
    participantName,
    participantFirm:
      typeof b.participantFirm === "string" ? b.participantFirm.trim() : undefined,
    context,
    category,
    seedInboundBody:
      typeof b.seedInboundBody === "string" ? b.seedInboundBody : undefined,
  });

  if (!threadId) {
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }

  const thread = await loadThreadForDetail(threadId, userId);
  return NextResponse.json({ ok: true, threadId, thread });
}
