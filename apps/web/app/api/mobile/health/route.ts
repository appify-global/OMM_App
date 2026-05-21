import { NextResponse } from "next/server";

import { getRawPool } from "@/db";
import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Same contract as OMM_BACKEND — DB probe without requiring Bearer auth. */
export async function GET(req: Request) {
  const userId = await getUserIdFromMobileRequest(req);

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      ok: false,
      database: false,
      authenticated: Boolean(userId),
      message: "DATABASE_URL is not set",
    });
  }

  try {
    await getRawPool().query("select 1 as ok");
    return NextResponse.json({
      ok: true,
      database: true,
      authenticated: Boolean(userId),
      ...(userId ? { userId } : {}),
    });
  } catch (e) {
    console.error("[api/mobile/health]", e);
    return NextResponse.json(
      {
        ok: false,
        database: false,
        authenticated: Boolean(userId),
        error: "database_unreachable",
      },
      { status: 503 },
    );
  }
}
