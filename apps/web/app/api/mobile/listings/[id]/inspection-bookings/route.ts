import { NextResponse } from "next/server";

import { createInspectionBooking } from "@/db/queries";
import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  const { id: listingId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slotLabelRaw = (body as { slotLabel?: unknown }).slotLabel;
  const slotLabel =
    typeof slotLabelRaw === "string" ? slotLabelRaw.trim() : "";
  if (!slotLabel) {
    return NextResponse.json({ error: "missing_slot" }, { status: 400 });
  }

  const bookingId = await createInspectionBooking({
    listingId,
    buyerUserId: userId,
    slotLabel,
  });

  if (!bookingId) {
    return NextResponse.json({ error: "not_created" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: bookingId });
}
