import { NextResponse } from "next/server";

import { getAgentHomeMetricsForAgent } from "@/db/queries";
import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  try {
    const metrics = await getAgentHomeMetricsForAgent(userId);
    if (!metrics) {
      return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
    }
    return NextResponse.json(metrics);
  } catch (e) {
    console.error("[api/mobile/agent-home-metrics]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
