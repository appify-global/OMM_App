const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isNonEmptyString(v: unknown, max: number): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}

export function isOptionalString(v: unknown, max: number): v is string | undefined {
  if (v === undefined || v === null) return true;
  return typeof v === "string" && v.length <= max;
}

export function isValidContactEmail(v: unknown): v is string {
  return typeof v === "string" && v.length <= 320 && EMAIL_RE.test(v.trim());
}
