import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { WebPreviewZoom } from './src/components/WebPreviewZoom';
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

export default function App() {
  if (__DEV__ && !hasClerkConfigured()) {
    console.warn(
      '[app] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set — opening main app without sign-in. Set the key (same Clerk project as web) to enable auth.',
    );
  }

  const tree = (
    <SafeAreaProvider>
      <WebPreviewZoom>
        <NavigationTree />
      </WebPreviewZoom>
    </SafeAreaProvider>
  );

  if (!hasClerkConfigured()) {
    return tree;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      tokenCache={tokenCache ?? undefined}
    >
      {tree}
    </ClerkProvider>
  );
}
