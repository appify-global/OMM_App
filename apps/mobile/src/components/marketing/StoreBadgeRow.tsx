import { Image } from "expo-image";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { colors, radii, space } from "../../theme/tokens";

const appStore = require("../../../assets/badges/app-store-light.png");
const googlePlay = require("../../../assets/badges/google-play-light.png");

export function StoreBadgeRow() {
  const soon = (platform: string) =>
    Alert.alert("Coming soon", `${platform} build will be available here.`);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => soon("App Store")}
        style={({ pressed }) => [styles.badge, pressed && styles.pressed]}
        accessibilityLabel="Download on the App Store (coming soon)"
      >
        <Image
          source={appStore}
          style={styles.imgApple}
          contentFit="contain"
          accessibilityIgnoresInvertColors
        />
      </Pressable>
      <Pressable
        onPress={() => soon("Google Play")}
        style={({ pressed }) => [styles.badge, pressed && styles.pressed]}
        accessibilityLabel="Get it on Google Play (coming soon)"
      >
        <Image
          source={googlePlay}
          style={styles.imgGoogle}
          contentFit="contain"
          accessibilityIgnoresInvertColors
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.md,
    marginBottom: space.xl,
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.control,
    backgroundColor: colors.paper,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  pressed: { opacity: 0.88 },
  imgApple: { width: 120, height: 36 },
  imgGoogle: { width: 128, height: 36 },
});
