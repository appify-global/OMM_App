import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

/**
 * iOS-aligned device size classes - drives responsive gutters, font sizes,
 * tap-target dimensions, and density across the app so a native iPhone build
 * feels consistent from the SE all the way up to the Pro Max.
 *
 * Reference widths (logical points):
 *   - sm: ≤ 374  (iPhone SE 1/2/3, mini family)
 *   - md: 375–413 (iPhone 13/14/15/16 standard, Pro)
 *   - lg: ≥ 414  (Plus, Pro Max, large Androids)
 *
 * `scale` is a clamped multiplier vs. the iPhone 14 reference width (390pt).
 * Use it sparingly (and never on iOS chrome that should match system metrics
 * exactly - those should stay literal pt).
 */
export type DeviceClass = 'sm' | 'md' | 'lg';

export function useDeviceClass() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const sizeClass: DeviceClass = width <= 374 ? 'sm' : width <= 413 ? 'md' : 'lg';
    const rawScale = width / 390;
    const scale = Math.max(0.94, Math.min(1.1, rawScale));
    /** Standard iOS gutter ladder: 16 / 20 / 24 - mirrors what UIKit / SwiftUI ship. */
    const gutter = sizeClass === 'sm' ? 16 : sizeClass === 'md' ? 20 : 24;
    /** Compact tab bar / sheet metrics for small phones so chrome doesn't dominate. */
    const compact = sizeClass === 'sm';
    return { width, height, sizeClass, scale, gutter, compact } as const;
  }, [width, height]);
}
