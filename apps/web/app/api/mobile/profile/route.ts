import { NextResponse } from "next/server";

import {
  accountHealth,
  agentProfile,
  agentReviews,
  disputes,
  invoices,
  payouts,
} from "../../../app/_data/fixtures";
import { getCurrentUser } from "@/db/queries";
import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HAS_DB = Boolean(process.env.DATABASE_URL);

export async function GET(req: Request) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let displayName = agentProfile.name;
  let email = agentProfile.email;
  if (HAS_DB) {
    const u = await getCurrentUser(userId);
    if (u?.name) displayName = u.name;
    if (u?.email) email = u.email;
  }

  return NextResponse.json({
    user: { id: userId, name: displayName, email },
    profile: { ...agentProfile, name: displayName, email },
    accountHealth,
    disputes,
    invoices,
    payouts,
    agentReviews,
  });
}
