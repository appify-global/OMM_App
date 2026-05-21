/** Sign-in / sign-up sidebar: work-email policy reminder (see `lib/work-email.ts` on mobile). */
export function WorkEmailAuthNotice() {
  return (
    <p className="auth-work-email-notice" style={{ marginBottom: "1rem", lineHeight: 1.5 }}>
      Sign in with your <strong>agency or corporate</strong> email. Personal inboxes
      (Gmail, Outlook, Yahoo, iCloud, etc.) are not accepted.
    </p>
  );
}
