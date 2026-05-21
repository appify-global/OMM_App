import type { Href } from 'expo-router';
import { Alert, Platform } from 'react-native';

import { workEmailValidationMessageFromOAuth } from '@/lib/work-email';

type RouterLike = { replace: (href: Href) => void };

type FinalizeNavigateArgs = {
  session?: { currentTask?: unknown };
  decorateUrl: (url: string) => string;
};

/** Post–sign-in / sign-up navigation used with Clerk `finalize()`. */
export function clerkFinalizeNavigate(
  router: RouterLike,
  { session, decorateUrl }: FinalizeNavigateArgs,
  destination: Href = '/(tabs)',
): void {
  if (session?.currentTask) {
    console.warn('Auth session task pending', session.currentTask);
    return;
  }
  const url = decorateUrl(destination as string);
  if (Platform.OS === 'web' && typeof window !== 'undefined' && url.startsWith('http')) {
    window.location.href = url;
  } else {
    router.replace(destination);
  }
}

export type SSOFlowResult = {
  createdSessionId: string | null;
  setActive?: (params: { session: string | null }) => Promise<void>;
  signIn?: { identifier?: string | null };
  signUp?: { emailAddress?: string | null };
  authSessionResult?: { type: string } | null;
};

/** Best-effort primary email from Clerk resources after Google / Microsoft OAuth (Expo). */
export function primaryEmailFromSsoResult(result: SSOFlowResult): string | null {
  const su = result.signUp as { emailAddress?: string | null } | undefined;
  const fromSignUp = typeof su?.emailAddress === 'string' ? su.emailAddress.trim() : '';
  if (fromSignUp.includes('@')) return fromSignUp;

  const si = result.signIn as { identifier?: string | null } | undefined;
  const id = typeof si?.identifier === 'string' ? si.identifier.trim() : '';
  if (id.includes('@')) return id;

  return null;
}

/** Native app only: same domain rules as email sign-up (`lib/work-email.ts`). Skip on Expo web. */
function shouldEnforceWorkEmailForOAuth(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/** Google / Microsoft SSO with work-email policy on iOS/Android only. Returns true when session is active. */
export async function completeSSOFlow(
  result: SSOFlowResult,
  router: RouterLike,
  signOut: () => Promise<void>,
): Promise<boolean> {
  if (result.authSessionResult && result.authSessionResult.type !== 'success') {
    return false;
  }

  if (shouldEnforceWorkEmailForOAuth()) {
    const email = primaryEmailFromSsoResult(result);
    const oauthDeny = workEmailValidationMessageFromOAuth(email);
    if (oauthDeny) {
      Alert.alert('Work email required', oauthDeny);
      try {
        await signOut();
      } catch {
        /* session may not exist yet */
      }
      return false;
    }
  }

  if (result.createdSessionId && result.setActive) {
    await result.setActive({ session: result.createdSessionId });
    router.replace('/(tabs)');
    return true;
  }

  return false;
}

/** First Clerk field error message, if any. */
export function clerkFieldError(errors: unknown, ...keys: string[]): string | null {
  const fields = (errors as { fields?: Record<string, { message?: string } | undefined> })?.fields;
  if (!fields) return null;
  for (const key of keys) {
    const msg = fields[key]?.message;
    if (msg) return msg;
  }
  return null;
}

/** Profile fields collected on sign-up step 1 — must be sent to Clerk, not only stored locally. */
export function clerkSignUpProfileParams(
  firstName: string,
  lastName: string,
  phone: string,
): { firstName?: string; lastName?: string; phoneNumber?: string } {
  const fn = firstName.trim();
  const ln = lastName.trim();
  const ph = phone.trim();
  return {
    ...(fn ? { firstName: fn } : {}),
    ...(ln ? { lastName: ln } : {}),
    ...(ph ? { phoneNumber: ph } : {}),
  };
}

type SignUpLike = {
  missingFields: string[];
  unverifiedFields: string[];
  status: string;
  update: (params: Record<string, unknown>) => Promise<{ error?: { message?: string } | null }>;
};

/** Push step-1 values into Clerk when the instance still reports missing required fields. */
export async function syncClerkSignUpProfile(
  signUp: SignUpLike,
  firstName: string,
  lastName: string,
  phone: string,
  options?: { legalAccepted?: boolean },
): Promise<string | null> {
  const profile = clerkSignUpProfileParams(firstName, lastName, phone);
  const payload: Record<string, unknown> = { ...profile };

  for (const field of signUp.missingFields) {
    if (field === 'first_name' && profile.firstName) payload.firstName = profile.firstName;
    if (field === 'last_name' && profile.lastName) payload.lastName = profile.lastName;
    if (field === 'phone_number' && profile.phoneNumber) payload.phoneNumber = profile.phoneNumber;
  }

  if (options?.legalAccepted && signUp.missingFields.includes('legal_accepted')) {
    payload.legalAcceptedAt = Date.now();
  }

  if (Object.keys(payload).length === 0) return null;

  const { error } = await signUp.update(payload);
  return error?.message ?? null;
}

const FIELD_LABELS: Record<string, string> = {
  first_name: 'first name',
  last_name: 'last name',
  phone_number: 'phone number',
  email_address: 'email',
  password: 'password',
  legal_accepted: 'terms acceptance',
};

/** User-facing message when Clerk did not reach `complete` (avoids opaque “could not be completed”). */
export function clerkIncompleteAuthMessage(
  flow: 'sign-up' | 'sign-in',
  status: string | undefined,
  missingFields: string[] = [],
  unverifiedFields: string[] = [],
): string {
  if (unverifiedFields.includes('email_address')) {
    return flow === 'sign-up'
      ? 'Check your inbox for a verification code.'
      : 'Check your inbox for a sign-in verification code.';
  }
  if (unverifiedFields.includes('phone_number')) {
    return 'Verify your phone number with the code we sent by SMS.';
  }
  if (missingFields.length > 0) {
    const labels = missingFields.map((f) => FIELD_LABELS[f] ?? f.replace(/_/g, ' '));
    return `Still required: ${labels.join(', ')}. Go back and complete those fields, then try again.`;
  }
  if (status === 'missing_requirements') {
    return flow === 'sign-up'
      ? 'Additional sign-up steps are required in Clerk (e.g. email or phone verification).'
      : 'Additional sign-in verification is required.';
  }
  return flow === 'sign-up'
    ? 'Sign up could not be completed. Try again or contact support.'
    : 'Sign in could not be completed. Try again or contact support.';
}
