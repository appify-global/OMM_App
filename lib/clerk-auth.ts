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
