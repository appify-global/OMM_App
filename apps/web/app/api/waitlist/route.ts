import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "../../../src/db";
import { waitlistApplications } from "../../../src/db/schema";
import { sendEmail, waitlistThankYouEmail } from "../../../src/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  agency?: unknown;
  role?: unknown;
  licence?: unknown;
  yearsExperience?: unknown;
  suburbs?: unknown;
  notes?: unknown;
  source?: unknown;
};

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function str(v: unknown, max: number) {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function strArr(v: unknown, max: number, perMax: number) {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    if (typeof item !== "string") continue;
    const t = item.trim();
    if (!t) continue;
    out.push(t.slice(0, perMax));
    if (out.length >= max) break;
  }
  return out;
}

function intOrNull(v: unknown, lo: number, hi: number) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.floor(n);
  if (i < lo || i > hi) return null;
  return i;
}

function newId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `wl_${ts}${rand}`;
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = str(body.name, 120);
  const rawEmail = str(body.email, 254);
  const email = rawEmail?.toLowerCase() ?? null;
  const phone = str(body.phone, 32);
  const licence = str(body.licence, 80);
  if (!name || !email || !EMAIL_RX.test(email) || !phone || !licence) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Full name, valid email, phone number and licence number are all required.",
      },
      { status: 422 },
    );
  }

  const record = {
    id: newId(),
    name,
    email,
    phone,
    agency: str(body.agency, 160),
    role: str(body.role, 80),
    licence,
    yearsExperience: intOrNull(body.yearsExperience, 0, 80),
    suburbs: strArr(body.suburbs, 24, 80),
    notes: str(body.notes, 2000),
    source: str(body.source, 80) ?? "web",
    ipAddress:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null,
    userAgent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
  };

  try {
    // Idempotent on email: if they re-submit, update their entry instead of
    // crashing with a unique-violation. Keeps the user experience clean and
    // means they can refine details (e.g. add more suburbs).
    const existing = await db
      .select({ id: waitlistApplications.id })
      .from(waitlistApplications)
      .where(eq(waitlistApplications.email, email))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(waitlistApplications)
        .set({
          name: record.name,
          phone: record.phone,
          agency: record.agency,
          role: record.role,
          licence: record.licence,
          yearsExperience: record.yearsExperience,
          suburbs: record.suburbs,
          notes: record.notes,
          source: record.source,
          ipAddress: record.ipAddress,
          userAgent: record.userAgent,
          updatedAt: new Date(),
        })
        .where(eq(waitlistApplications.email, email));
    } else {
      await db.insert(waitlistApplications).values(record);
    }
  } catch (err) {
    console.error("[waitlist] DB insert failed", err);
    return NextResponse.json(
      { ok: false, error: "Could not save your application. Please try again." },
      { status: 500 },
    );
  }

  // Fire-and-forget email (await for visibility but never fail the request on it).
  const { subject, html, text } = waitlistThankYouEmail(record.name);
  await sendEmail({ to: email, subject, html, text });

  return NextResponse.json({ ok: true });
}
