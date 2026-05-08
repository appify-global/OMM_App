import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/constants/theme';

/**
 * Consistent horizontal padding: screen gutter + device safe area (notch / home indicator).
 */
export function useScreenHorizontalPadding() {
  const insets = useSafeAreaInsets();
  return useMemo(
    () => ({
      paddingLeft: layout.screenGutter + insets.left,
      paddingRight: layout.screenGutter + insets.right,
    }),
    [insets.left, insets.right],
  );
}
