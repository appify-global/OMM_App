import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { GlassSurface } from '@/components/GlassSurface';
import { Text } from '@/components/OMMText';
import { Fonts, brand, glass, ink, inkMuted, layout, toolbar } from '@/constants/theme';
import { hapticLight } from '@/lib/haptics';

const LOGO = require('@/assets/images/match-logo.png');

export type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  /** Appended after the built-in notifications + messages tiles. */
  right?: ReactNode;
  showBrand?: boolean;
  /** Hairline divider beneath the shell. */
  showDivider?: boolean;
  /** Red badge on notifications (demo / unread hint). Default true. */
  showNotificationBadge?: boolean;
  /** OMM identity dashed outer outline around the header shell. */
  dashed?: boolean;
};

/**
 * Glass app header. One frosted shell containing:
 *   - leading rail (optional back + subtle title)
 *   - geometrically centred MATCH wordmark
 *   - trailing rail (notifications + messages, both glass tiles)
 *
 * Toggles / segmented controls live OUTSIDE the header pill — see `HeaderToggle`.
 */
export function ScreenHeader({
  title,
  onBack,
  backLabel = 'Back',
  right,
  showBrand = true,
  showDivider = false,
  showNotificationBadge = true,
  dashed = false,
}: ScreenHeaderProps) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const [toolbarWidth, setToolbarWidth] = useState(0);

  const titleMaxWidth = useMemo(() => {
    const backReserve = onBack ? 40 : 0;
    /** Half the MATCH mark + breathing room — title must not enter this band around center. */
    const logoHalfBand = brand.toolbarMarkMaxWidth / 2 + 10;
    const shellSlack = 24;
    const rowFallback = Math.max(
      200,
      windowWidth - 2 * layout.screenGutter - shellSlack,
    );
    const row = toolbarWidth > 0 ? toolbarWidth : rowFallback;

    if (showBrand) {
      /** Left flex column is ~half the row; reserve the inner half of the logo so text never overlaps the mark. */
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
    <View style={[styles.outerLift, dashed && styles.dashedFrame]}>
      <GlassSurface style={styles.shell} noShadow lightSheen>
        <View style={styles.toolbarRow} onLayout={onToolbarLayout}>
          <View style={styles.leadingRail}>
            <View style={styles.leadingCluster}>
              {onBack ? (
                <Pressable
                  onPress={onBack}
                  onPressIn={() => hapticLight()}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={backLabel}
                  style={({ pressed }) => [styles.backHit, pressed && styles.hitPressed]}>
                  <FontAwesome name="chevron-left" size={17} color={ink} />
                </Pressable>
              ) : null}
              <Text
                style={[styles.toolbarTitle, { maxWidth: titleMaxWidth }]}
                numberOfLines={1}
                ellipsizeMode="tail"
                accessibilityRole="header">
                {title}
              </Text>
            </View>
          </View>

          {showBrand ? (
            <View style={styles.logoLayer} pointerEvents="none">
              <View pointerEvents="none">
                <Image
                  source={LOGO}
                  style={styles.brandImage}
                  resizeMode="contain"
                  accessibilityRole="image"
                  accessibilityLabel="MATCH"
                />
              </View>
            </View>
          ) : null}

          <View style={styles.trailingRail}>
            <View style={styles.inboxGroup}>
              <GlassIconTile
                onPress={goNotifications}
                label="Notifications"
                icon="bell-o"
                badge={showNotificationBadge}
              />
              <GlassIconTile onPress={goMessages} label="Messages" icon="envelope-o" />
              {right}
            </View>
          </View>
        </View>
      </GlassSurface>
      {showDivider ? <View style={styles.dividerBelow} /> : null}
    </View>
  );
}

/** Mirrors the floating tab bar shadow language so header + nav read as a pair. */

function GlassIconTile({
  onPress,
  label,
  icon,
  badge,
}: {
  onPress: () => void;
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  badge?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => hapticLight()}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconTileWrap, pressed && styles.hitPressed]}>
      <GlassSurface style={styles.iconTile} noShadow>
        <View style={styles.iconTileInner}>
          <FontAwesome name={icon} size={14} color={ink} />
          {badge ? <View style={styles.notifBadge} /> : null}
        </View>
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /**
   * Mirror the floating tab bar exactly: 64px tall, 50px pill radius, 10/12 padding,
   * y4/blur20/0.1 shadow, transparent backing — the GlassSurface inside delivers the
   * blurred material so content reads through as it scrolls under.
   */
  outerLift: {
    height: 64,
    borderRadius: 50,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    elevation: 14,
  },
  shell: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  toolbarRow: {
    minHeight: toolbar.rowMinHeight,
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
    paddingLeft: 8,
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
    gap: 8,
  },
  iconTileWrap: {
    width: 32,
    height: 32,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  iconTileInner: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 5,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: ink,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  dashedFrame: {
    borderRadius: 56,
    borderWidth: 1.25,
    borderStyle: 'dashed',
    borderColor: 'rgba(60, 60, 67, 0.32)',
    padding: 4,
  },
  dividerBelow: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: glass.edge,
    marginTop: 8,
  },
  hitPressed: {
    opacity: 0.55,
  },
});
