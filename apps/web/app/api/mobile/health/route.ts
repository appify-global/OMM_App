import { NextResponse } from "next/server";

import { getRawPool } from "@/db";
import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      ok: false,
      database: false,
      userId,
      message: "DATABASE_URL is not set on the web service",
    });
  }

  try {
    await getRawPool().query("select 1 as ok");
    return NextResponse.json({
      ok: true,
      database: true,
      userId,
    });
  } catch (e) {
    console.error("[api/mobile/health]", e);
    return NextResponse.json(
      { ok: false, database: false, userId, error: "database_unreachable" },
      { status: 503 },
    );
  }
}
