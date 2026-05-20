/**
 * Waitlist mode — toggled by env var.
 *
 * When ON (default):
 *   - All "Apply to join" / "Sign in" CTAs open the WaitlistModal.
 *   - Clerk hosted sign-in / sign-up pages redirect home.
 *   - Members-only routes (/app, /listings, etc.) redirect home from the
 *     public marketing site (still reachable directly if logged in via Clerk
 *     server-side, for internal QA — see middleware).
 *
 * When OFF (set NEXT_PUBLIC_WAITLIST_MODE=false):
 *   - Original Clerk sign-in flow + ApplyModal restored.
 *
 * Default: ON. We explicitly check for "false" / "0" / "off" so a missing
 * env var doesn't accidentally re-enable sign-in in prod.
 */

export function isWaitlistMode(): boolean {
  const raw = process.env.NEXT_PUBLIC_WAITLIST_MODE;
  if (raw == null) return true;
  const v = raw.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "off" || v === "no") return false;
  return true;
}
