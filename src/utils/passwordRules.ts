export type PasswordStrength = 'weak' | 'medium' | 'strong';

const hasUpper = (p: string) => /[A-Z]/.test(p);
const hasLower = (p: string) => /[a-z]/.test(p);
const hasNumber = (p: string) => /\d/.test(p);
const hasSymbol = (p: string) => /[^A-Za-z0-9]/.test(p);

/** Figma: 12+ with upper, lower, number & symbol. */
export function meetsNewPasswordRules(password: string): boolean {
  if (password.length < 12) return false;
  return hasUpper(password) && hasLower(password) && hasNumber(password) && hasSymbol(password);
}

export function passwordStrength(password: string): PasswordStrength {
  if (!password) return 'weak';
  let score = 0;
  if (password.length >= 12) score += 1;
  if (password.length >= 14) score += 1;
  if (hasUpper(password)) score += 1;
  if (hasLower(password)) score += 1;
  if (hasNumber(password)) score += 1;
  if (hasSymbol(password)) score += 1;
  if (score >= 5) return 'strong';
  if (score >= 3) return 'medium';
  return 'weak';
}

export function passwordStrengthDescription(password: string): string {
  if (!password) return '';
  const len = password.length;
  const parts: string[] = [];
  parts.push(`${len} character${len === 1 ? '' : 's'}`);
  parts.push('upper, lower, number & symbol');
  const s = passwordStrength(password);
  return `${parts.join(' - ')} - strength: ${s}`;
}
