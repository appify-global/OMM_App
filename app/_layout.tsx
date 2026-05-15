import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { frost } from '@/constants/theme';
import { useColorScheme } from '@/components/useColorScheme';
import { SavedListingsProvider } from '@/lib/saved-listings-context';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

const OmmLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: frost,
    card: frost,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Satoshi-Regular': require('../assets/fonts/Satoshi-Regular.ttf'),
    'Satoshi-Medium': require('../assets/fonts/Satoshi-Medium.ttf'),
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : OmmLightTheme}>
      <SavedListingsProvider>
        <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="account-settings" options={{ headerShown: false }} />
        <Stack.Screen name="payments-billing" options={{ headerShown: false }} />
        <Stack.Screen name="gst-abn" options={{ headerShown: false, contentStyle: { backgroundColor: frost } }} />
        <Stack.Screen
          name="payment-method"
          options={{ headerShown: false, contentStyle: { backgroundColor: frost } }}
        />
        <Stack.Screen name="account-details" options={{ headerShown: false }} />
        <Stack.Screen name="payout-schedule" options={{ headerShown: false }} />
        <Stack.Screen name="payout-history" options={{ headerShown: false }} />
        <Stack.Screen name="invoices" options={{ headerShown: false }} />
        <Stack.Screen name="invoice-detail" options={{ headerShown: false }} />
        <Stack.Screen name="delete-account" options={{ headerShown: false }} />
        <Stack.Screen name="terms-of-service" options={{ headerShown: false }} />
        <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
        <Stack.Screen name="community-guidelines" options={{ headerShown: false }} />
        <Stack.Screen name="reviews" options={{ headerShown: false }} />
        <Stack.Screen name="write-review" options={{ headerShown: false }} />
        <Stack.Screen name="saved-searches" options={{ headerShown: false }} />
        <Stack.Screen name="saved-properties" options={{ headerShown: false }} />
        <Stack.Screen name="post-buyer-brief" options={{ headerShown: false }} />
        <Stack.Screen name="authority-expiring" options={{ headerShown: false }} />
        <Stack.Screen name="recent-listings" options={{ headerShown: false }} />
        <Stack.Screen name="view-live-listing" options={{ headerShown: false }} />
        <Stack.Screen name="soi-preview" options={{ headerShown: false }} />
        <Stack.Screen name="contact-seller-chat" options={{ headerShown: false }} />
        <Stack.Screen name="messages" options={{ headerShown: false }} />
        <Stack.Screen name="agent-profile" options={{ headerShown: false }} />
        <Stack.Screen name="agent-active-listings" options={{ headerShown: false }} />
        <Stack.Screen name="agent-reviews" options={{ headerShown: false }} />
        <Stack.Screen name="your-matches" options={{ headerShown: false }} />
        <Stack.Screen name="seller-match-detail" options={{ headerShown: false }} />
        <Stack.Screen name="edit-listing" options={{ headerShown: false }} />
        <Stack.Screen name="photos-floorplan" options={{ headerShown: false }} />
        <Stack.Screen name="view-performance" options={{ headerShown: false }} />
        <Stack.Screen name="change-listing-status" options={{ headerShown: false }} />
        <Stack.Screen name="archive-listing" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="disputes" options={{ headerShown: false }} />
        <Stack.Screen name="dispute-detail" options={{ headerShown: false }} />
        <Stack.Screen name="add-dispute-response" options={{ headerShown: false }} />
        <Stack.Screen name="raise-dispute" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </SavedListingsProvider>
    </ThemeProvider>
  );
}
