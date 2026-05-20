import { NextResponse } from "next/server";

import { incrementListingEnquiryCount, patchListingMobileMeta } from "@/db/queries";
import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";
import type { OmmListingMobileMeta } from "@/lib/mobile-published-listings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
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

  const b = body as Record<string, unknown>;
  const action = typeof b.action === "string" ? b.action : "patch_meta";

  if (action === "buyer_enquiry") {
    await incrementListingEnquiryCount(listingId);
    return NextResponse.json({ ok: true });
  }

  const metaPatch =
    b.mobileMeta && typeof b.mobileMeta === "object"
      ? (b.mobileMeta as Partial<OmmListingMobileMeta>)
      : null;

  if (metaPatch && Object.keys(metaPatch).length > 0) {
    const ok = await patchListingMobileMeta(listingId, userId, metaPatch);
    if (!ok) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
  }

  return NextResponse.json({ ok: true });
}
