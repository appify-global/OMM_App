import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { enteringAmbient } from '@/lib/motion';

/**
 * Soft ambient depth for hero/welcome.
 */
export function AmbientGlowStack({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <View style={styles.host}>
        <View pointerEvents="none" style={[styles.blob, { top: '8%', left: '10%' }]} />
        <View pointerEvents="none" style={[styles.blob, styles.blob2, { bottom: '12%', right: '4%' }]} />
        {children}
      </View>
    );
  }

  return (
    <Animated.View entering={enteringAmbient()} style={styles.host}>
      <View pointerEvents="none" style={[styles.blob, { top: '8%', left: '10%' }]} />
      <View pointerEvents="none" style={[styles.blob, styles.blob2, { bottom: '12%', right: '4%' }]} />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1, overflow: 'hidden' },
  blob: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  blob2: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0, 0, 0, 0.045)',
  },
});
