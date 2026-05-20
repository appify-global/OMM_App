/**
 * Railway healthcheck endpoint - returns 200 immediately with no DB, no auth,
 * no rendering. Used by Railway's deploy promotion to confirm the new
 * container is alive before switching traffic. Keep this dependency-free.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return NextResponse.json({ ok: true });
}
