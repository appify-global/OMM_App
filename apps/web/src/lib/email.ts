import "server-only";

/**
 * Email sender — Resend with graceful degradation.
 *
 * Behaviour:
 *   - If RESEND_API_KEY is missing, we no-op and log. The app keeps working
 *     so a misconfigured staging env never blocks a waitlist signup.
 *   - All errors are caught and logged; we never throw out of send() to the
 *     request handler because email delivery is a side effect, not a hard
 *     dependency of accepting the application.
 */

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

const FROM =
  process.env.WAITLIST_FROM_EMAIL ?? "MATCH <onboarding@resend.dev>";

let resendClient: { emails: { send: (...args: unknown[]) => Promise<unknown> } } | null = null;
let resendInitTried = false;

async function getResend() {
  if (resendInitTried) return resendClient;
  resendInitTried = true;
  if (!process.env.RESEND_API_KEY) return null;
  try {
    const mod = await import("resend");
    resendClient = new mod.Resend(process.env.RESEND_API_KEY) as never;
    return resendClient;
  } catch (err) {
    console.warn("[email] Failed to init Resend:", err);
    return null;
  }
}

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; reason?: string }> {
  const client = await getResend();
  if (!client) {
    console.info(`[email] Skipped send to ${args.to} (no RESEND_API_KEY). Subject: ${args.subject}`);
    return { ok: false, reason: "no-client" };
  }
  try {
    await client.emails.send({
      from: FROM,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo: args.replyTo,
    });
    return { ok: true };
  } catch (err) {
    console.error(`[email] Send failed to ${args.to}:`, err);
    return { ok: false, reason: "send-error" };
  }
}

/** Waitlist thank-you email — plain, branded, no fluff. */
export function waitlistThankYouEmail(name: string) {
  const firstName = name.split(" ")[0] || "there";
  const subject = "You're on the MATCH waitlist";
  const text = `Hi ${firstName},

Thanks for applying to join MATCH.

We're a members' network for off-market Australian property — private campaigns, verified buyer briefs, and introductions before the portals.

We're reviewing applications in small batches as we open up access to verified agents. We'll be in touch shortly with next steps.

If anything changes in the meantime — new suburbs, agency move — just reply to this email.

— Anton Zhouk
Founder, MATCH
`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#000;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:40px 20px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:6px;">
          <tr><td style="padding:40px 36px 32px;">
            <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(0,0,0,0.42);font-weight:500;">MATCH</p>
            <h1 style="margin:0 0 24px;font-size:28px;font-weight:500;line-height:1.2;letter-spacing:-0.02em;color:#000;">You're on the waitlist, ${escapeHtml(firstName)}.</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:rgba(0,0,0,0.7);">Thanks for applying. MATCH is a members' network for off-market Australian property &mdash; private campaigns, verified buyer briefs, and introductions before the portals.</p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:rgba(0,0,0,0.7);">We're reviewing applications in small batches as we open up access to verified agents. We'll be in touch shortly with next steps.</p>
            <p style="margin:0 0 32px;font-size:15px;line-height:1.55;color:rgba(0,0,0,0.7);">If anything changes in the meantime &mdash; new suburbs, agency move &mdash; just reply to this email.</p>
            <hr style="border:0;border-top:1px solid rgba(0,0,0,0.08);margin:0 0 24px;" />
            <p style="margin:0;font-size:14px;color:rgba(0,0,0,0.55);">Anton Zhouk<br/>Founder, MATCH</p>
          </td></tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:rgba(0,0,0,0.4);">MATCH &middot; Melbourne, Australia</p>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
