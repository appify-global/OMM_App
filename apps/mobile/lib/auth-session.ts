import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'omm_authenticated_v1';
const SESSION_VALUE = '1';

/** Persists sign-up role for client-side UX rules (e.g. referral eligibility). Replace with server profile when available. */
const USER_ROLE_KEY = 'omm_user_role_v1';

export type StoredUserRole = 'Real Estate Agent' | 'Buyer Agent' | 'Vendor advocate';

function webSet(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    /* private mode / blocked storage */
  }
}

function webGet(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function webDelete(key: string): void {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Mark the user as signed in (local session). Call after successful auth. */
export async function setAuthenticated(): Promise<void> {
  if (Platform.OS === 'web') {
    webSet(SESSION_KEY, SESSION_VALUE);
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, SESSION_VALUE);
}

/** Clear local session. Call on log out. */
export async function clearAuthenticated(): Promise<void> {
  if (Platform.OS === 'web') {
    webDelete(SESSION_KEY);
    webDelete(USER_ROLE_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
  try {
    await SecureStore.deleteItemAsync(USER_ROLE_KEY);
  } catch {
    /* missing key */
  }
}

/** Store role chosen at sign-up. */
export async function setUserRole(role: StoredUserRole): Promise<void> {
  if (Platform.OS === 'web') {
    webSet(USER_ROLE_KEY, role);
    return;
  }
  await SecureStore.setItemAsync(USER_ROLE_KEY, role);
}

/** Last known role, or null (e.g. signed in before this field existed). */
export async function getUserRole(): Promise<StoredUserRole | null> {
  let raw: string | null;
  if (Platform.OS === 'web') {
    raw = webGet(USER_ROLE_KEY);
  } else {
    try {
      raw = await SecureStore.getItemAsync(USER_ROLE_KEY);
    } catch {
      raw = null;
    }
  }
  if (raw === 'Real Estate Agent' || raw === 'Buyer Agent' || raw === 'Vendor advocate') return raw;
  if (raw === 'Vendor Agent') return 'Vendor advocate';
  return null;
}

/** Whether a local session flag is present. */
export async function isAuthenticated(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof globalThis.window === 'undefined') return false;
    return webGet(SESSION_KEY) === SESSION_VALUE;
  }
  const v = await SecureStore.getItemAsync(SESSION_KEY);
  return v === SESSION_VALUE;
}
