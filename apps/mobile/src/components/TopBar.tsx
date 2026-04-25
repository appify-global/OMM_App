import React, { ReactNode } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { brand } from "../theme/brand";
import { images } from "../constants/images";

type Props = {
  /** Screen title — no longer rendered in the bar, kept for a11y. */
  title: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
};

export function TopBar({
  title,
  leftSlot,
  rightSlot,
  showBack = true,
  onBack,
}: Props) {
  const navigation = useNavigation();
  const showDefaultBack = !leftSlot && showBack;

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {leftSlot}
        {showDefaultBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={onBack ?? (() => navigation.goBack())}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={26} color={brand.charcoal} />
          </Pressable>
        )}
      </View>
      <View
        style={styles.headerCenter}
        pointerEvents="box-none"
        accessibilityRole="header"
        accessible
        accessibilityLabel={`Unlisted, ${title}`}
      >
        <Image
          source={images.unlistedLogo}
          style={styles.headerCenterWordmark}
          resizeMode="contain"
        />
      </View>
      <View style={styles.headerRight}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: brand.space.sm,
    paddingTop: 4,
    paddingBottom: brand.space.sm,
    overflow: "visible",
  },
  headerLeft: {
    zIndex: 2,
    width: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerRight: {
    zIndex: 2,
    minWidth: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: brand.space.xs,
  },
  /**
   * Absolute + flex-centered so the wordmark sits on the exact vertical
   * midline of the 60px header — matching the 44px icon buttons on either
   * side. Scaling the image never expands the header.
   */
  headerCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenterWordmark: {
    width: 520,
    maxWidth: "90%",
    height: 144,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});

export const topBarIconBtn = {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: brand.cream,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
