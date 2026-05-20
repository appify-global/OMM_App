import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useScrollEdgeRevealOptional } from '@/lib/scrollEdge';

/**
 * iOS-26-style progressive scroll edge effect.
 *
 * Apple's bottom-of-screen treatment: content scrolls *under* a soft frosted gradient
 * that fades from transparent (top) to lightly blurred + tinted (bottom). It hides
 * the abrupt content cut-off and gives the floating tab bar a contextual base.
 *
 * Implementation note: RN can't easily mask a BlurView with a vertical alpha gradient,
 * so we stack four thin BlurView strips of increasing intensity (top→bottom). Each
 * strip is masked into existence by sitting on top of the previous one with a clipping
 * `LinearGradient` - the eye reads the cumulative effect as a smooth progressive blur.
 *
 * Layered top→bottom inside the band:
 *   1. transparent → soft white gradient (so content "dies" into the surface)
 *   2. four BlurView strips at intensities 8, 16, 26, 38 (iOS) - Android falls back
 *      to a single translucent gradient since BlurView on Android is approximate.
 *   3. final hairline tint at the very bottom for added definition.
 *
 * Set `height` to ~ tabBar bottom inset + 80 for a Goldilocks fade band.
 */
export function ScrollEdgeFade({
  height = 120,
  style,
}: {
  /** Total height of the fade band (px). Should comfortably cover the floating tab bar + 24-32px of breathing room above. */
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reveal = useScrollEdgeRevealOptional();
  const animatedReveal = useAnimatedStyle(() => {
    if (!reveal) return {};
    const translateY = interpolate(
      reveal.value,
      [0, 1],
      [0, height],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(reveal.value, [0, 1], [1, 0], Extrapolation.CLAMP);
    return { transform: [{ translateY }], opacity };
  }, [height]);

  if (Platform.OS !== 'ios') {
    return (
      <Animated.View pointerEvents="none" style={[styles.container, { height }, style, animatedReveal]}>
        <LinearGradient
          colors={[
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.55)',
            'rgba(255,255,255,0.92)',
            'rgba(255,255,255,1)',
          ]}
          locations={[0, 0.35, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { height }, style, animatedReveal]}>
      {/* Strip 1 - feathered top edge, light blur builds in. */}
      <View style={[styles.strip, { top: 0, height: height * 0.42 }]}>
        <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.32)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {/* Strip 2 - frosted body picks up. */}
      <View style={[styles.strip, { top: height * 0.3, height: height * 0.4 }]}>
        <BlurView intensity={42} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.6)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {/* Strip 3 - heavy material. */}
      <View style={[styles.strip, { top: height * 0.55, height: height * 0.4 }]}>
        <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(255,255,255,0.32)', 'rgba(255,255,255,0.88)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {/* Strip 4 - opaque base anchoring the floating tab bar. */}
      <View style={[styles.strip, { top: height * 0.72, height: height * 0.28 }]}>
        <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  strip: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
});
