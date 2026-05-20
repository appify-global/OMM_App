import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useFocusEffect } from 'expo-router';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

type TabBarVisibilityValue = {
  setTabBarHidden: (hidden: boolean) => void;
};

const TabBarVisibilityContext = createContext<TabBarVisibilityValue | null>(null);

export function TabBarVisibilityProvider({
  children,
  onHiddenChange,
}: {
  children: ReactNode;
  onHiddenChange: (hidden: boolean) => void;
}) {
  const setTabBarHidden = useCallback(
    (hidden: boolean) => {
      onHiddenChange(hidden);
    },
    [onHiddenChange],
  );
  const value = useMemo(() => ({ setTabBarHidden }), [setTabBarHidden]);
  return (
    <TabBarVisibilityContext.Provider value={value}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

/** Scroll down → hide tab bar; scroll up / near top → show. */
export function useTabBarOnScroll() {
  const ctx = useContext(TabBarVisibilityContext);
  const lastY = useRef(0);

  useFocusEffect(
    useCallback(() => {
      lastY.current = 0;
      ctx?.setTabBarHidden(false);
    }, [ctx]),
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!ctx) return;
      const y = e.nativeEvent.contentOffset.y;
      const dy = y - lastY.current;
      lastY.current = y;
      if (y < 20) {
        ctx.setTabBarHidden(false);
      } else if (dy > 6) {
        ctx.setTabBarHidden(true);
      } else if (dy < -6) {
        ctx.setTabBarHidden(false);
      }
    },
    [ctx],
  );

  return { onScroll };
}
