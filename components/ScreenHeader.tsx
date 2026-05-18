import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Text } from '@/components/OMMText';
import { Fonts, brand, ink, inkMuted, layout, toolbar } from '@/constants/theme';
import { hapticLight } from '@/lib/haptics';

const LOGO = require('@/assets/images/match-logo.png');

export type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  /** Appended after the built-in notifications + messages tiles. */
  right?: ReactNode;
  showBrand?: boolean;
  /** Hairline divider beneath the header. */
  showDivider?: boolean;
  /** Red badge on notifications (demo / unread hint). Default true. */
  showNotificationBadge?: boolean;
  /** Optional subtle solid hairline frame around the header shell. */
  framed?: boolean;
  /** `large` uses the screen large-title size for the leading title. */
  variant?: 'default' | 'large';
};

/**
 * Flat app header — no glass pill, no icon-tile circles.
 *   - Leading rail: optional back chevron + subtle title
 *   - Centre: geometrically centred MATCH wordmark
 *   - Trailing rail: bell + message icons (plain, no tile background)
 */
export function ScreenHeader({
  title,
  onBack,
  backLabel = 'Back',
  right,
  showBrand = true,
  showDivider = false,
  showNotificationBadge = true,
  framed = false,
  variant = 'default',
}: ScreenHeaderProps) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const [toolbarWidth, setToolbarWidth] = useState(0);

  const titleMaxWidth = useMemo(() => {
    const backReserve = onBack ? 40 : 0;
    const logoHalfBand = brand.toolbarMarkMaxWidth / 2 + 10;
    const shellSlack = 24;
    const rowFallback = Math.max(200, windowWidth - 2 * layout.screenGutter - shellSlack);
    const row = toolbarWidth > 0 ? toolbarWidth : rowFallback;

    if (showBrand) {
      return Math.max(48, Math.floor(row / 2 - logoHalfBand - backReserve));
    }
    return Math.max(
      48,
      Math.round(windowWidth * toolbar.leadingTitleMaxFrac) - (onBack ? 44 : 0),
    );
  }, [toolbarWidth, windowWidth, onBack, showBrand]);

  const onToolbarLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - toolbarWidth) > 0.5) setToolbarWidth(w);
  };

  const goNotifications = () => {
    hapticLight();
    router.push('/notifications' as Href);
  };

  const goMessages = () => {
    hapticLight();
    router.push('/messages' as Href);
  };

  return (
    <View style={[styles.header, framed && styles.headerFrame]}>
      <View style={styles.toolbarRow} onLayout={onToolbarLayout}>
        {/* Leading rail */}
        <View style={styles.leadingRail}>
          <View style={styles.leadingCluster}>
            {onBack ? (
              <Pressable
                onPress={onBack}
                onPressIn={() => hapticLight()}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={backLabel}
                style={styles.backHit}>
                <FontAwesome name="chevron-left" size={17} color={ink} />
              </Pressable>
            ) : null}
            <Text
              style={[
                styles.toolbarTitle,
                variant === 'large' && styles.toolbarTitleLarge,
                { maxWidth: titleMaxWidth },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
              accessibilityRole="header">
              {title}
            </Text>
          </View>
        </View>

        {/* Centred MATCH wordmark */}
        {showBrand ? (
          <View style={styles.logoLayer} pointerEvents="none">
            <Image
              source={LOGO}
              style={styles.brandImage}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="MATCH"
            />
          </View>
        ) : null}

        {/* Trailing rail — plain icon buttons, no tile backgrounds */}
        <View style={styles.trailingRail}>
          <View style={styles.inboxGroup}>
            <Pressable
              onPress={goNotifications}
              onPressIn={() => hapticLight()}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={styles.iconBtn}>
              <FontAwesome name="bell-o" size={18} color={ink} />
              {showNotificationBadge ? <View style={styles.notifBadge} /> : null}
            </Pressable>
            <Pressable
              onPress={goMessages}
              onPressIn={() => hapticLight()}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Messages"
              style={styles.iconBtn}>
              <FontAwesome name="envelope-o" size={17} color={ink} />
            </Pressable>
            {right}
          </View>
        </View>
      </View>

      {showDivider ? <View style={styles.dividerBelow} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    backgroundColor: 'transparent',
  },
  toolbarRow: {
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leadingRail: {
    flex: 1,
    minWidth: 0,
    maxWidth: '50%',
    zIndex: 1,
    paddingLeft: 4,
    paddingRight: 8,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  leadingCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    maxWidth: '100%',
    gap: 4,
  },
  backHit: {
    width: 36,
    height: layout.headerSideWidth,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: -4,
  },
  toolbarTitle: {
    flexShrink: 1,
    fontSize: toolbar.titleSize,
    lineHeight: toolbar.titleLineHeight,
    fontFamily: Fonts.regular,
    color: inkMuted,
    letterSpacing: -0.15,
  },
  toolbarTitleLarge: {
    fontSize: layout.largeTitleSize,
    lineHeight: 30,
    fontFamily: Fonts.medium,
    color: ink,
    letterSpacing: -0.6,
  },
  logoLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    pointerEvents: 'none',
  },
  brandImage: {
    height: brand.toolbarMarkHeight,
    aspectRatio: 220 / 52.687,
    maxWidth: brand.toolbarMarkMaxWidth,
  },
  trailingRail: {
    flex: 1,
    minWidth: 0,
    maxWidth: '50%',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  inboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingRight: 4,
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: ink,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  headerFrame: {
    borderRadius: 56,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'solid',
    borderColor: 'rgba(60, 60, 67, 0.22)',
    padding: 4,
  },
  dividerBelow: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginTop: 4,
  },
});
