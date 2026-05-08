import type { ReactNode } from 'react';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { enteringFadeSlide } from '@/lib/motion';

type Props = {
  children: ReactNode;
  delay?: number;
};

/**
 * Entrance — cubic easing, no bounce (Messages-like). Respects reduced motion.
 */
export function FadeSlideIn({ children, delay = 0 }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <>{children}</>;
  }

  return <Animated.View entering={enteringFadeSlide(delay)}>{children}</Animated.View>;
}
