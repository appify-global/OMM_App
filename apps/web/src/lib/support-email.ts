import "server-only";

import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function requireInbox(): string {
  const to = process.env.SUPPORT_INBOX_EMAIL?.trim();
  if (!to) {
    throw new Error("SUPPORT_INBOX_EMAIL is not configured");
  }
  return to;
}

const DEFAULT_FROM = "OMM Support <onboarding@resend.dev>";

export type ContactEmailInput = {
  email: string;
  fullName?: string;
  phone?: string;
  topic?: string;
  subject?: string;
  message: string;
  source: "mobile" | "web";
  userId?: string | null;
};

export async function sendContactEmail(input: ContactEmailInput): Promise<void> {
  const resend = getResend();
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const to = requireInbox();

  const lines = [
    `Source: ${input.source}`,
    input.userId ? `User ID (Clerk): ${input.userId}` : null,
    `From email: ${input.email}`,
    input.fullName?.trim() ? `Name: ${input.fullName.trim()}` : null,
    input.phone?.trim() ? `Phone: ${input.phone.trim()}` : null,
    input.topic?.trim() ? `Topic: ${input.topic.trim()}` : null,
    input.subject?.trim() ? `Subject line: ${input.subject.trim()}` : null,
    "---",
    input.message.trim(),
  ]
    .filter((x): x is string => Boolean(x))
    .join("\n");

  const subj = [input.subject?.trim(), input.topic?.trim()].find(Boolean) ?? "Contact form";

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM,
    to: [to],
    replyTo: input.email,
    subject: `[OMM Support] ${subj}`,
    text: lines,
  });
  if (error) {
    throw new Error(error.message ?? "Resend email send failed");
  }
}

export type FeedbackEmailInput = {
  category: string;
  message: string;
  source: "mobile" | "web";
  /** Web feedback toggle: allow follow-up email */
  contactOk?: boolean;
  userId?: string | null;
};

export async function sendFeedbackEmail(input: FeedbackEmailInput): Promise<void> {
  const resend = getResend();
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const to = requireInbox();

  const lines = [
    `Source: ${input.source}`,
    input.userId ? `User ID (Clerk): ${input.userId}` : null,
    `Category: ${input.category.trim()}`,
    typeof input.contactOk === "boolean"
      ? `Ok to follow up by email: ${input.contactOk ? "yes" : "no"}`
      : null,
    "---",
    input.message.trim(),
  ]
    .filter((x): x is string => Boolean(x))
    .join("\n");

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM,
    to: [to],
    subject: `[OMM Feedback] ${input.category.trim().slice(0, 80)}`,
    text: lines,
  });
  if (error) {
    throw new Error(error.message ?? "Resend email send failed");
  }
}
