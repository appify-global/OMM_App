import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import {
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold,
  Fraunces_600SemiBold_Italic,
  useFonts,
} from "@expo-google-fonts/fraunces";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { clerkPublishableKey } from "./src/lib/env";
import { appNavigationTheme } from "./src/theme/navigationTheme";
import { colors, fonts, radii } from "./src/theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [loaded, err] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || err) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, err]);

  if (!clerkPublishableKey) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 24,
          backgroundColor: colors.clerkBackground,
        }}
      >
        <Text style={{ fontFamily: fonts.sansSemiBold, color: colors.ink }}>
          Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY (see apps/mobile/.env.example).
        </Text>
      </View>
    );
  }

  if (!loaded && !err) return null;

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      tokenCache={tokenCache}
      appearance={{
        variables: {
          colorPrimary: colors.chrome,
          colorBackground: colors.clerkBackground,
          colorText: colors.chrome,
          borderRadius: String(radii.clerk),
        },
      }}
    >
      <SafeAreaProvider>
        <NavigationContainer theme={appNavigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
