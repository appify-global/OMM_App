import type { ReactNode } from 'react';
import type { Insets } from 'react-native';
import { Pressable } from 'react-native';

import { hapticLight } from '@/lib/haptics';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  hitSlop?: Insets;
};

/** Link-style control - light haptic + soft opacity (Messages-like). */
export function PulsePress({
  children,
  onPress,
  accessibilityLabel,
  hitSlop = { top: 12, bottom: 12, left: 12, right: 12 },
}: Props) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={hitSlop}
      onPressIn={() => hapticLight()}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.62 : 1,
        transform: [{ scale: pressed ? 0.992 : 1 }],
      })}>
      {children}
    </Pressable>
  );
}
