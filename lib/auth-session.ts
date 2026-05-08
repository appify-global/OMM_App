import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'omm_authenticated_v1';
const SESSION_VALUE = '1';

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
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
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
