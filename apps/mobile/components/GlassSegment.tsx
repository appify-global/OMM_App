import { BlurView } from "expo-blur";
import { useCallback, useMemo, useState } from "react";
import {
    LayoutChangeEvent,
    Platform,
    Pressable,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { Text } from "@/components/OMMText";
import { Fonts, accent, controlRadius, ink, inkSubtle } from "@/constants/theme";
import { hapticSelection } from "@/lib/haptics";

export type GlassSegmentItem<K extends string> = {
  key: K;
  label: string;
};

export type GlassSegmentProps<K extends string> = {
  items: ReadonlyArray<GlassSegmentItem<K>>;
  value: K;
  onChange: (next: K) => void;
  style?: StyleProp<ViewStyle>;
  /** Letter-spacing on labels (Apple favours +0.6–1.2 on uppercase). */
  letterSpacing?: number;
  /** Forward `accessibilityLabel` for the whole control. */
  accessibilityLabel?: string;
};

const PADDING = 4;
const HEIGHT = 34;
const RADIUS = controlRadius.glassSegment;
const THUMB_RADIUS = RADIUS - 3;

const AnimatedView = Animated.View;

/**
 * Apple-style glass segmented control. Depth is read from light & shadow, not
 * gradient colour. Stacking, back → front:
 *
 *   1. Recessed well - BlurView (iOS) tinted by a flat cool fill, hairline edge.
 *   2. Thin top inset shadow band + bottom inner highlight = the "pressed in" cue.
 *   3. Animated thumb - flat near-white surface, hairline edge, two-layer drop
 *      shadow (tight contact + soft ambient) gives the floating-glass read.
 *   4. Labels - colour-only crossfade between selected / unselected.
 *
 * Spring-driven thumb position; selection haptic on press; press squish.
 */
export function GlassSegment<K extends string>({
  items,
  value,
  onChange,
  style,
  letterSpacing = 1.1,
  accessibilityLabel,
}: GlassSegmentProps<K>) {
  const [trackW, setTrackW] = useState(0);
  const offset = useSharedValue(0);
  const press = useSharedValue(0);

  const itemWidth = useMemo(() => {
    if (trackW <= 0 || items.length === 0) return 0;
    return (trackW - PADDING * 2) / items.length;
  }, [trackW, items.length]);

  const activeIndex = Math.max(
    0,
    items.findIndex((it) => it.key === value),
  );

  const onLayoutTrack = useCallback((e: LayoutChangeEvent) => {
    setTrackW(e.nativeEvent.layout.width);
  }, []);

  const targetX = activeIndex * itemWidth + PADDING;
  offset.value = withSpring(targetX, {
    damping: 26,
    stiffness: 260,
    mass: 0.6,
  });

  const thumbStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      press.value,
      [0, 1],
      [1, 0.97],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateX: offset.value }, { scale }],
      width: Math.max(0, itemWidth),
    };
  });

  return (
    <View
      onLayout={onLayoutTrack}
      style={[styles.track, style]}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Animated glass thumb - clear track, depth read entirely from light/shadow. */}
      {trackW > 0 ? (
        <AnimatedView
          pointerEvents="none"
          style={[styles.thumbOuter, thumbStyle]}
        >
          <View style={styles.thumbAmbient} />
          <View style={styles.thumbInner}>
            {Platform.OS === "ios" ? (
              <BlurView
                tint="light"
                intensity={50}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View pointerEvents="none" style={styles.thumbFill} />
            <View pointerEvents="none" style={styles.thumbTopHairline} />
          </View>
        </AnimatedView>
      ) : null}

      {items.map((item) => {
        const selected = item.key === value;
        return (
          <Pressable
            key={item.key}
            style={styles.cell}
            onPressIn={() => {
              hapticSelection();
              press.value = withSpring(1, { damping: 22, stiffness: 320 });
            }}
            onPressOut={() => {
              press.value = withSpring(0, { damping: 22, stiffness: 320 });
            }}
            onPress={() => {
              if (item.key !== value) onChange(item.key);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={item.label}
          >
            <Text
              style={[
                styles.label,
                { letterSpacing },
                selected ? styles.labelOn : styles.labelOff,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    height: HEIGHT,
    borderRadius: RADIUS,
    padding: PADDING,
    backgroundColor: "transparent",
  },
  /** Outer holds the tight contact shadow - must NOT clip. */
  thumbOuter: {
    position: "absolute",
    top: PADDING,
    left: 0,
    bottom: PADDING,
    borderRadius: THUMB_RADIUS,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  /** Wider, softer ambient halo behind the contact shadow - pure light/shadow lift. */
  thumbAmbient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: THUMB_RADIUS,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 8,
  },
  /** Inner clips the BlurView + hairlines into the rounded shape. */
  thumbInner: {
    flex: 1,
    borderRadius: THUMB_RADIUS,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(60, 60, 67, 0.10)",
  },
  thumbFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: accent,
  },
  thumbTopHairline: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  cell: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    textTransform: "uppercase",
  },
  labelOff: { color: inkSubtle },
  labelOn: { color: ink },
});
