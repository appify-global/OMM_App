import { NextResponse } from "next/server";

import { sendFeedbackEmail } from "@/lib/support-email";
import { getOptionalSupportUserId } from "@/lib/support-request-user";
import { isNonEmptyString } from "@/lib/support-validate";

export const runtime = "nodejs";

const MAX_MESSAGE = 10000;
const MAX_CATEGORY = 120;

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
  const source = b.source === "web" ? "web" : "mobile";

  const rawMessage =
    typeof b.message === "string"
      ? b.message
      : typeof b.feedback === "string"
        ? b.feedback
        : "";

  const categoryRaw =
    typeof b.category === "string"
      ? b.category
      : typeof b.topic === "string"
        ? b.topic
        : typeof b.kind === "string"
          ? b.kind
          : "";

  if (!isNonEmptyString(categoryRaw, MAX_CATEGORY)) {
    return NextResponse.json({ ok: false, error: "invalid_category" }, { status: 400 });
  }

  if (!isNonEmptyString(rawMessage, MAX_MESSAGE)) {
    return NextResponse.json({ ok: false, error: "invalid_message" }, { status: 400 });
  }

  const contactOk =
    typeof b.contactOk === "boolean" ? b.contactOk : undefined;

  const userId = await getOptionalSupportUserId(req);

  try {
    await sendFeedbackEmail({
      category: categoryRaw.trim(),
      message: rawMessage.trim(),
      source,
      contactOk,
      userId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "send_failed";
    if (msg.includes("RESEND_API_KEY") || msg.includes("SUPPORT_INBOX_EMAIL")) {
      console.error("[api/support/feedback]", e);
      return NextResponse.json(
        { ok: false, error: "server_misconfigured", detail: msg },
        { status: 503 },
      );
    }
    console.error("[api/support/feedback]", e);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
