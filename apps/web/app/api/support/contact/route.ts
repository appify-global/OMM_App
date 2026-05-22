import { NextResponse } from "next/server";

import { sendContactEmail } from "@/lib/support-email";
import { getOptionalSupportUserId } from "@/lib/support-request-user";
import {
  isNonEmptyString,
  isOptionalString,
  isValidContactEmail,
} from "@/lib/support-validate";

export const runtime = "nodejs";

const MAX_MESSAGE = 10000;
const MAX_NAME = 200;
const MAX_PHONE = 40;
const MAX_TOPIC = 120;
const MAX_SUBJECT = 200;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const rawMessage =
    typeof b.message === "string"
      ? b.message
      : typeof b.body === "string"
        ? b.body
        : "";

  const source = b.source === "web" ? "web" : "mobile";

  if (!isValidContactEmail(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  if (!isNonEmptyString(rawMessage, MAX_MESSAGE)) {
    return NextResponse.json({ ok: false, error: "invalid_message" }, { status: 400 });
  }

  const fullName = typeof b.fullName === "string" ? b.fullName : undefined;
  const phone = typeof b.phone === "string" ? b.phone : undefined;
  const topic = typeof b.topic === "string" ? b.topic : undefined;
  const subject = typeof b.subject === "string" ? b.subject : undefined;

  if (!isOptionalString(fullName, MAX_NAME) || !isOptionalString(phone, MAX_PHONE)) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
  }
  if (!isOptionalString(topic, MAX_TOPIC) || !isOptionalString(subject, MAX_SUBJECT)) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
  }

  const userId = await getOptionalSupportUserId(req);

  try {
    await sendContactEmail({
      email,
      message: rawMessage.trim(),
      source,
      userId,
      fullName: fullName?.trim() || undefined,
      phone: phone?.trim() || undefined,
      topic: topic?.trim() || undefined,
      subject: subject?.trim() || undefined,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "send_failed";
    if (msg.includes("RESEND_API_KEY") || msg.includes("SUPPORT_INBOX_EMAIL")) {
      console.error("[api/support/contact]", e);
      return NextResponse.json(
        { ok: false, error: "server_misconfigured", detail: msg },
        { status: 503 },
      );
    }
    console.error("[api/support/contact]", e);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
