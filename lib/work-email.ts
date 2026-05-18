/**
 * Shared rules for “work email” on sign-up, sign-in, and OAuth (IdP primary email).
 * Block common consumer / ISP inboxes; allow agency and corporate domains.
 */

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

/** Lowercase domains — add entries as needed for your policy. */
const BLOCKED_CONSUMER_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.com.au',
  'ymail.com',
  'hotmail.com',
  'hotmail.com.au',
  'live.com',
  'msn.com',
  'outlook.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'gmx.com',
  'mail.com',
  'qq.com',
  '163.com',
  'bigpond.com',
  'bigpond.net.au',
  'optusnet.com.au',
  'iinet.net.au',
]);

export function emailDomain(raw: string): string | null {
  const t = raw.trim();
  const at = t.lastIndexOf('@');
  if (at < 1 || at === t.length - 1) return null;
  return t.slice(at + 1).toLowerCase();
}

/** `null` means the value is acceptable as a work email. */
export function workEmailValidationMessage(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return 'Enter your work email.';
  }
  if (!EMAIL_SHAPE.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  const domain = emailDomain(trimmed);
  if (!domain) {
    return 'Enter a valid email address.';
  }
  if (BLOCKED_CONSUMER_DOMAINS.has(domain)) {
    return 'Use your agency or corporate work email. Personal and webmail addresses are not accepted.';
  }
  return null;
}

export function isPermittedWorkEmail(raw: string): boolean {
  return workEmailValidationMessage(raw) === null;
}

/**
 * OAuth / Clerk: run when the IdP returns a primary email.
 * Returns `null` if no email was supplied (caller should skip UI validation until auth is wired).
 * Otherwise returns the same user-facing message as manual entry, or `null` if allowed.
 */
export function workEmailValidationMessageFromOAuth(
  emailFromIdp: string | null | undefined,
): string | null {
  if (emailFromIdp == null || String(emailFromIdp).trim() === '') {
    return null;
  }
  return workEmailValidationMessage(String(emailFromIdp));
}
