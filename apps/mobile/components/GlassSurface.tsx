import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { glass } from '@/constants/theme';

export type GlassSurfaceProps = {
  children?: ReactNode;
  /** Outer container style - pass border-radius / padding here. */
  style?: StyleProp<ViewStyle>;
  /** Override blur intensity (0–100). */
  intensity?: number;
  /** Hide the inner top-edge highlight. */
  noHighlight?: boolean;
  /** Hide outer hairline edge. */
  noEdge?: boolean;
  /** Hide the soft drop shadow (use inside a shadowed parent). */
  noShadow?: boolean;
  /**
   * Reduce the milky-white sheen so blurred content reads through clearly.
   * Use on chrome that should *visually float over* content (e.g. the floating
   * header pill) rather than feel like an opaque surface.
   */
  lightSheen?: boolean;
};

/**
 * iOS-style frosted glass surface. Layers (back→front):
 * 1. BlurView (native vibrancy on iOS, no-op gradient on Android - the LinearGradient handles fallback).
 * 2. Linear gradient sheen - gives the lit, milky look on white backgrounds.
 * 3. Hairline inner top-edge highlight (the "lit lip" Apple uses).
 * 4. Children.
 *
 * The hairline outer edge + drop shadow are applied to the outer wrapper so border-radius clips the gradient.
 */
export function GlassSurface({
  children,
  style,
  intensity = glass.blurIntensity,
  noHighlight = false,
  noEdge = false,
  noShadow = false,
  lightSheen = false,
}: GlassSurfaceProps) {
  const sheenColors: readonly [string, string] = lightSheen
    ? ['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0.06)']
    : [glass.sheenTop, glass.sheenBottom];
  return (
    <View
      style={[
        styles.shell,
        !noEdge && styles.shellEdge,
        !noShadow && styles.shellShadow,
        style,
      ]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          tint={glass.tint}
          intensity={intensity}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            lightSheen ? styles.androidFillLight : styles.androidFill,
          ]}
        />
      )}
      <LinearGradient
        pointerEvents="none"
        colors={sheenColors as unknown as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {!noHighlight ? <View pointerEvents="none" style={styles.innerHighlight} /> : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  shellEdge: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.edge,
  },
  shellShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  androidFill: {
    backgroundColor: glass.fallback,
  },
  androidFillLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: glass.innerHighlight,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
