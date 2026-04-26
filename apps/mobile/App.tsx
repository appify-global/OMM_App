import type { ReactNode } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { WebPreviewZoom } from './src/components/WebPreviewZoom';
import { ApiAuthProvider } from './src/context/ApiAuthContext';
import { AuthRoot } from './src/navigation/AuthRoot';
import { MainNavigator } from './src/navigation/MainNavigator';
import { clerkPublishableKey, hasClerkConfigured } from './src/config/env';
import { colors } from './src/theme/theme';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

function NavigationTree() {
  return (
    <NavigationContainer theme={navTheme}>
      {hasClerkConfigured() ? <AuthRoot /> : <MainNavigator />}
    </NavigationContainer>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <WebPreviewZoom>{children}</WebPreviewZoom>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

export default function App() {
  if (__DEV__ && !hasClerkConfigured()) {
    console.warn(
      '[app] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set — opening main app without sign-in. Set the key (same Clerk project as web) to enable auth.',
    );
  }

  if (!hasClerkConfigured()) {
    return (
      <AppShell>
        <NavigationTree />
      </AppShell>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      tokenCache={tokenCache ?? undefined}
    >
      <ApiAuthProvider>
        <AppShell>
          <NavigationTree />
        </AppShell>
      </ApiAuthProvider>
    </ClerkProvider>
  );
}
