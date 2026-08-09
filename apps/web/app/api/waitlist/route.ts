/**
 * Waitlist proxy -> OMM_BACKEND.
 *
 * This site holds NO database access. It used to carry a fork of the product's
 * Drizzle schema plus a production DATABASE_URL and write `waitlist_applications`
 * directly, which meant a marketing site had superuser rights on the product's
 * database (and shipped a Clerk webhook that hard-deleted from `users` behind 17
 * cascading FKs). The table is owned by OMM_BACKEND; we forward to it.
 *
 * Kept as a same-origin route rather than posting to api.offmarketmatch.com.au
 * from the browser so the form does not depend on CORS, and so the backend
 * origin is not baked into client bundles.
 */
import { NextResponse } from "next/server";

import { sendEmail, waitlistThankYouEmail } from "../../../src/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
  "https://api.offmarketmatch.com.au";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;

  // Validate here too so obvious rubbish never reaches the backend, and so the
  // copy in the modal stays the source of truth for the message shown.
  const name = str(b.name, 120);
  const email = str(b.email, 254)?.toLowerCase() ?? null;
  const phone = str(b.phone, 32);
  const licence = str(b.licence, 80);
  if (!name || !email || !EMAIL_RX.test(email) || !phone || !licence) {
    return NextResponse.json(
      { ok: false, error: "Name, email, phone and licence number are required." },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND}/api/waitlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Preserve the applicant's IP for the backend's record and rate limiter.
        "x-forwarded-for":
          req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "",
        "user-agent": req.headers.get("user-agent") ?? "",
      },
      body: JSON.stringify({ ...b, name, email, phone, licence }),
    });
  } catch (err) {
    console.error("[waitlist] backend unreachable", err);
    return NextResponse.json(
      { ok: false, error: "Could not save your application. Please try again." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error(`[waitlist] backend ${upstream.status}: ${detail.slice(0, 300)}`);
    // 429 is a real user-facing state; anything else is our problem, not theirs.
    if (upstream.status === 429) {
      return NextResponse.json(
        { ok: false, error: "Too many applications. Please try again later." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Could not save your application. Please try again." },
      { status: 502 },
    );
  }

  // Thank-you email is sent from here: this repo owns the marketing voice and
  // the Resend sender. Never fail the application on a mail error, but do log
  // it - sendEmail now inspects Resend's { error } instead of assuming success.
  const { subject, html, text } = waitlistThankYouEmail(name);
  const mail = await sendEmail({ to: email, subject, html, text });
  if (!mail.ok) {
    console.error(`[waitlist] saved but thank-you email failed: ${mail.reason}`);
  }

  return NextResponse.json({ ok: true });
}
