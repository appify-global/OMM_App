import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import {
  type SharedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type ScrollEdgeContextValue = {
  /** 0 = fade fully visible, 1 = fade slid out so a bottom CTA reads cleanly. */
  reveal: SharedValue<number>;
};

const Ctx = createContext<ScrollEdgeContextValue | null>(null);

/**
 * Provides a shared `reveal` value that the bottom `ScrollEdgeFade` reads to
 * animate itself out of the way when a tab screen scrolls near a primary CTA
 * (e.g. "MANAGE LISTING"). Without this, the floating tab-bar fade always sits
 * on top of the last bit of content; with it, the fade lifts/dismisses smartly.
 */
export function ScrollEdgeProvider({ children }: { children: ReactNode }) {
  const reveal = useSharedValue(0);
  const value = useMemo<ScrollEdgeContextValue>(() => ({ reveal }), [reveal]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useScrollEdge() {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error('useScrollEdge must be called inside <ScrollEdgeProvider>.');
  }
  return v;
}

/** Soft variant — returns the shared reveal value or `null` if no provider is mounted. */
export function useScrollEdgeRevealOptional() {
  const v = useContext(Ctx);
  return v?.reveal ?? null;
}

/** Reset the reveal whenever a screen mounts/unmounts so leftover state doesn't leak. */
export function useResetScrollEdgeOnFocus() {
  const v = useContext(Ctx);
  return useCallback(() => {
    if (v) v.reveal.value = withTiming(0, { duration: 180 });
  }, [v]);
}

/**
 * Returns an `onScroll` handler for a `ScrollView` / `FlatList`. When the
 * viewport approaches the content's bottom by less than `threshold` px, the
 * reveal value animates to 1 (fade slides out); otherwise it returns to 0.
 *
 * Use on screens that have a CTA / interactive control near the tail of the
 * scroll content so the fade graciously gets out of the way.
 */
export function useScrollEdgeReveal({
  threshold = 100,
  duration = 220,
}: { threshold?: number; duration?: number } = {}) {
  const ctx = useContext(Ctx);
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!ctx) return;
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const distance =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);
      const next = distance < threshold ? 1 : 0;
      if (ctx.reveal.value !== next) {
        ctx.reveal.value = withTiming(next, { duration });
      }
    },
    [ctx, threshold, duration],
  );
  return { onScroll, scrollEventThrottle: 16 } as const;
}
