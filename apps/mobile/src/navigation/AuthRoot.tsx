import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@clerk/expo";
import { colors } from "../theme/theme";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";

export function AuthRoot() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return isSignedIn ? <MainNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
