import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '@/components/OMMText';
import { Fonts, accent, controlRadius, ink, inkSubtle } from '@/constants/theme';
import { hapticSelection } from '@/lib/haptics';

export type HeaderToggleItem<K extends string> = {
  key: K;
  label: string;
};

export type HeaderToggleProps<K extends string> = {
  items: ReadonlyArray<HeaderToggleItem<K>>;
  value: K;
  onChange: (next: K) => void;
  style?: StyleProp<ViewStyle>;
  /** Horizontal alignment of the row. Default `start`. */
  align?: 'start' | 'center';
  /** Optional accessibility label for the whole control. */
  accessibilityLabel?: string;
};

/**
 * Liquid-pill segmented toggle.
 *
 * Departs from a fixed equal-width segmented control: the active pill is an
 * accent lozenge that morphs its **width** to hug the active label, and springs
 * between labels on selection. Inactive labels float as plain text on the
 * screen — no track, no card, no chrome.
 *   1. Each cell measures its own layout (x + width) on first paint.
 *   2. Reanimated shared values drive the pill's `translateX` and `width`.
 *   3. Press squish (scale 0.97) with spring damping for tactile feedback.
 *   4. Selection haptic on press; ignored when re-tapping the active key.
 */
export function HeaderToggle<K extends string>({
  items,
  value,
  onChange,
  style,
  align = 'start',
  accessibilityLabel,
}: HeaderToggleProps<K>) {
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const measured = useRef(false);

  const offsetX = useSharedValue(0);
  const widthV = useSharedValue(0);
  const press = useSharedValue(0);
  const ready = useSharedValue(0);

  const setItemLayout = useCallback((key: string, layout: { x: number; width: number }) => {
    setLayouts((prev) => {
      const existing = prev[key];
      if (existing && Math.abs(existing.x - layout.x) < 0.5 && Math.abs(existing.width - layout.width) < 0.5) {
        return prev;
      }
      return { ...prev, [key]: layout };
    });
  }, []);

  const active = layouts[value];

  useEffect(() => {
    if (!active) return;
    if (!measured.current) {
      offsetX.value = active.x;
      widthV.value = active.width;
      ready.value = withSpring(1, { damping: 22, stiffness: 220, mass: 0.8 });
      measured.current = true;
      return;
    }
    offsetX.value = withSpring(active.x, { damping: 24, stiffness: 240, mass: 0.7 });
    widthV.value = withSpring(active.width, { damping: 26, stiffness: 230, mass: 0.7 });
  }, [active, offsetX, widthV, ready]);

  const pillStyle = useAnimatedStyle(() => {
    const scale = interpolate(press.value, [0, 1], [1, 0.96], Extrapolation.CLAMP);
    const opacity = ready.value;
    return {
      transform: [{ translateX: offsetX.value }, { scale }],
      width: widthV.value,
      opacity,
    };
  });

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.row,
        align === 'center' ? styles.rowCenter : styles.rowStart,
        style,
      ]}>
      <Animated.View pointerEvents="none" style={[styles.pill, pillStyle]} />

      {items.map((item) => {
        const selected = item.key === value;
        return (
          <Pressable
            key={item.key}
            onLayout={(e: LayoutChangeEvent) => {
              const { x, width } = e.nativeEvent.layout;
              setItemLayout(item.key, { x, width });
            }}
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
            style={styles.cell}>
            <Text
              style={[styles.label, selected ? styles.labelOn : styles.labelOff]}
              numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const PILL_HEIGHT = 32;
const PILL_RADIUS = controlRadius.liquidPill;

const styles = StyleSheet.create({
  row: {
    height: PILL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  rowStart: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  rowCenter: {
    justifyContent: 'center',
    alignSelf: 'center',
  },
  /** Accent liquid pill — animated x + width to hug the active label. */
  pill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS,
    backgroundColor: accent,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  cell: {
    height: PILL_HEIGHT,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  labelOff: { color: inkSubtle },
  labelOn: { color: ink },
});
