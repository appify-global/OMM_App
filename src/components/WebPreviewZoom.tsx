import React, { useMemo, type ReactNode } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { colors } from "../theme/theme";
import { WEB_PREVIEW_ZOOM } from "../dev/webPreviewZoom";

type Props = { children: ReactNode };

/**
 * Scales the whole app down on dev web (see layout composition). No-op on native.
 */
export function WebPreviewZoom({ children }: Props) {
  const { width, height } = useWindowDimensions();

  const { outer, inner } = useMemo(() => {
    const s = WEB_PREVIEW_ZOOM;
    if (s >= 0.999 || Platform.OS !== "web") {
      return { outer: null, inner: null };
    }
    return {
      outer: {
        width: width * s,
        height: height * s,
        overflow: "hidden" as const,
      },
      inner: {
        width,
        height,
        transform: [{ scale: s }],
        transformOrigin: "0 0",
      },
    };
  }, [width, height]);

  if (!outer || !inner) {
    return <>{children}</>;
  }

  return (
    <View style={styles.backdrop} pointerEvents="box-none">
      <View style={outer}>
        <View style={inner}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});