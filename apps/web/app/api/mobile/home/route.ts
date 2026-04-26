import { NextResponse } from "next/server";

import { loadHomePageData } from "../../../app/_data/rsc-loaders";
import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Authenticated mobile home payload (same shape as web RSC `loadHomePageData`).
 */
export async function GET(req: Request) {
  const auth = await getUserIdFromMobileRequest(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const data = await loadHomePageData(auth.userId);
    return NextResponse.json(data);
  } catch (e) {
    console.error("[api/mobile/home]", e);
    return NextResponse.json(
      { error: "Failed to load home data" },
      { status: 500 },
    );
  }
}
