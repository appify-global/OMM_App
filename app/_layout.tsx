import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, UIManager } from 'react-native';
import Animated from 'react-native-reanimated';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import { useColorScheme } from '@/components/useColorScheme';
import { enteringShell, nativeStackDramatic } from '@/lib/motion';

/** Native-stack-driven transitions match UIKit/UINavigationController exactly. */
enableScreens(true);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import '../global.css';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

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
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style="dark" animated translucent backgroundColor="transparent" />
        <Animated.View style={styles.rootShell} entering={enteringShell()}>
          <Stack
            screenOptions={{
              headerShown: false,
              ...nativeStackDramatic,
              contentStyle: { backgroundColor: '#ffffff' },
            }}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="account-settings" options={{ headerShown: false }} />
        <Stack.Screen name="payments-billing" options={{ headerShown: false }} />
        <Stack.Screen name="gst-abn" options={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }} />
        <Stack.Screen
          name="payment-method"
          options={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }}
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
        <Stack.Screen name="post-buyer-brief" options={{ headerShown: false }} />
        <Stack.Screen name="authority-expiring" options={{ headerShown: false }} />
        <Stack.Screen name="recent-listings" options={{ headerShown: false }} />
        <Stack.Screen name="view-live-listing" options={{ headerShown: false }} />
        <Stack.Screen name="contact-seller-chat" options={{ headerShown: false }} />
        <Stack.Screen
          name="messages"
          options={{
            headerShown: false,
            presentation: 'formSheet',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            sheetAllowedDetents: [1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 22,
          }}
        />
        <Stack.Screen name="agent-profile" options={{ headerShown: false }} />
        <Stack.Screen name="agent-active-listings" options={{ headerShown: false }} />
        <Stack.Screen name="agent-reviews" options={{ headerShown: false }} />
        <Stack.Screen name="your-matches" options={{ headerShown: false }} />
        <Stack.Screen name="seller-match-detail" options={{ headerShown: false }} />
        <Stack.Screen name="potential-buyers" options={{ headerShown: false }} />
        <Stack.Screen name="buyer-lead-detail" options={{ headerShown: false }} />
        <Stack.Screen name="edit-listing" options={{ headerShown: false }} />
        <Stack.Screen name="photos-floorplan" options={{ headerShown: false }} />
        <Stack.Screen name="view-performance" options={{ headerShown: false }} />
        <Stack.Screen name="change-listing-status" options={{ headerShown: false }} />
        <Stack.Screen name="archive-listing" options={{ headerShown: false }} />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false,
            presentation: 'formSheet',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            sheetAllowedDetents: [1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 22,
          }}
        />
        <Stack.Screen name="disputes" options={{ headerShown: false }} />
        <Stack.Screen name="dispute-detail" options={{ headerShown: false }} />
        <Stack.Screen name="add-dispute-response" options={{ headerShown: false }} />
        <Stack.Screen name="raise-dispute" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            animation: 'fade_from_bottom',
            animationMatchesGesture: true,
            gestureEnabled: true,
          }}
        />
          </Stack>
        </Animated.View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootShell: { flex: 1 },
});
