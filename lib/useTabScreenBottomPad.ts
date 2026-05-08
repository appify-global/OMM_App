import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Extra bottom padding for tab-root screens so content clears the floating tab bar. */
export function useTabScreenBottomPad() {
  const measured = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const floatMargin = Platform.OS === 'ios' ? 24 : 16;
  /** Mirrors app/(tabs)/_layout tabBar bottom margin + pill height (64) + breath room. */
  const geometric = 64 + floatMargin + insets.bottom + 12;
  const fromNav = measured > 0 ? measured + 12 : 0;
  return Math.max(fromNav, geometric);
}
