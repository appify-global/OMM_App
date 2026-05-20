import { ClerkProvider } from '@clerk/expo';
import * as SecureStore from 'expo-secure-store';
import type { PropsWithChildren } from 'react';
import { Platform } from 'react-native';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

/**
 * Persist Clerk session tokens on native; web (Expo Metro) lets Clerk fall back to its default store.
 */
const tokenCache =
  Platform.OS !== 'web'
    ? {
        async getToken(key: string) {
          return SecureStore.getItemAsync(key);
        },
        async saveToken(key: string, value: string) {
          await SecureStore.setItemAsync(key, value);
        },
      }
    : undefined;

/**
 * Same Clerk Application as Next.js (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` must match this value).
 */
export function OmmClerkProvider({ children }: PropsWithChildren) {
  if (!publishableKey?.trim()) {
    if (__DEV__) {
      console.warn(
        '[OMM] Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — native/Expo web runs without Clerk. Set it in `.env` and restart Expo.',
      );
    }
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey.trim()} tokenCache={tokenCache}>
      {children}
    </ClerkProvider>
  );
}
