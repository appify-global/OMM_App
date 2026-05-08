import { View } from 'react-native';
import type { ReactElement, ReactNode } from 'react';
import { Children } from 'react';

import { FadeSlideIn } from '@/components/motion/FadeSlideIn';
import { STAGGER_MS } from '@/lib/motion';

type Props = {
  children: ReactNode;
  staggerMs?: number;
};

/**
 * Staggers direct children with FadeSlideIn. Single-level only (map sections, not deep trees).
 */
export function Stagger({ children, staggerMs = STAGGER_MS }: Props) {
  const items = Children.toArray(children).filter(Boolean) as ReactElement[];
  return (
    <View>
      {items.map((child, i) => (
        <FadeSlideIn key={child.key ?? i} delay={i * staggerMs}>
          {child}
        </FadeSlideIn>
      ))}
    </View>
  );
}
