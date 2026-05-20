import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDeviceClass } from '@/lib/useDeviceClass';

/**
 * iOS-style responsive horizontal padding - gutter ladder is 16 / 20 / 24 across
 * SE → standard → Pro Max widths, plus the device's safe-area inset (landscape
 * notch / left edge cut-out).
 */
export function useScreenHorizontalPadding() {
  const insets = useSafeAreaInsets();
  const { gutter } = useDeviceClass();
  return useMemo(
    () => ({
      paddingLeft: gutter + insets.left,
      paddingRight: gutter + insets.right,
    }),
    [gutter, insets.left, insets.right],
  );
}
