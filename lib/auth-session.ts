import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'omm_authenticated_v1';
const SESSION_VALUE = '1';

/** Mark the user as signed in (local session). Call after successful auth. */
export async function setAuthenticated(): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, SESSION_VALUE);
}

/** Clear local session. Call on log out. */
export async function clearAuthenticated(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

/** Whether a local session flag is present. */
export async function isAuthenticated(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(SESSION_KEY);
  return v === SESSION_VALUE;
}
