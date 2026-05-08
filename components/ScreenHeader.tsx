import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/OMMText';
import { borderHairline, Fonts, ink, layout, palette } from '@/constants/theme';

export type ScreenHeaderProps = {
  /** Centered when back is shown; left-aligned large title on tab roots. */
  title: string;
  onBack?: () => void;
  backLabel?: string;
  right?: ReactNode;
  /** Tab root screens: one left-aligned title row, no back slot. */
  variant?: 'nav' | 'large';
};

/**
 * Standard stack / modal header: symmetric side slots so the title stays visually centered.
 * Tab roots: `variant="large"` for a single left-aligned screen title.
 */
export function ScreenHeader({ title, onBack, backLabel = 'Back', right, variant = 'nav' }: ScreenHeaderProps) {
  if (variant === 'large') {
    return (
      <View>
        <Text style={styles.largeTitle} numberOfLines={2} accessibilityRole="header">
          {title}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.navRow}>
      <View style={styles.navSide}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            style={styles.backHit}>
            <FontAwesome name="chevron-left" size={20} color={ink} />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.navTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.navSide, styles.navSideRight]}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  largeTitle: {
    fontSize: layout.largeTitleSize,
    fontFamily: Fonts.medium,
    color: ink,
    letterSpacing: -0.3,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.headerSideWidth,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderHairline,
    backgroundColor: palette.white,
  },
  navSide: {
    width: layout.headerSideWidth,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  navSideRight: {
    alignItems: 'flex-end',
  },
  backHit: {
    width: layout.headerSideWidth,
    height: layout.headerSideWidth,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: layout.navTitleSize,
    fontFamily: Fonts.medium,
    color: ink,
  },
});
