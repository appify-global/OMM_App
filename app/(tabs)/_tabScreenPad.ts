import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Extra bottom padding for tab-root screens so content clears the floating tab bar. */
export function useTabScreenBottomPad() {
  const measured = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const floatMargin = Platform.OS === 'ios' ? 24 : 16;
  const fallback = 64 + floatMargin + Math.min(insets.bottom, 34);
  const fromNav = measured > 0 ? measured + 10 : fallback;
  return fromNav + 8;
}
