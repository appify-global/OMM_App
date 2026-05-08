import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LegalDocModal } from '@/components/LegalDocModal';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import type { ImageSourcePropType } from 'react-native';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Notifications centre.
 * [Figma 1053:7632 / section 1053:7187](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-7187)
 */

import { borderHairline, fillMisty, ink, inkSubtle, palette } from '@/constants/theme';
import { useScreenHorizontalPadding } from '@/lib/useScreenHorizontalPadding';
import { AGENT_IMG, PROPERTY_IMG_1, PROPERTY_IMG_2 } from '@/lib/propertyImages';

type FilterKey = 'all' | 'unread' | 'matches' | 'system';

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipOn : styles.chipOff]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}>
      <Text style={[styles.chipLabel, active && styles.chipLabelOn]}>{label}</Text>
    </Pressable>
  );
}

function ShortcutBanner({
  icon,
  text,
}: {
  icon: ComponentProps<typeof FontAwesome>['name'];
  text: string;
}) {
  return (
    <Pressable style={styles.shortcut} accessibilityRole="button">
      <FontAwesome name={icon} size={16} color="#000000" style={styles.shortcutIcon} />
      <Text style={styles.shortcutText}>{text}</Text>
      <FontAwesome name="chevron-right" size={12} color="rgba(0, 0, 0, 0.35)" />
    </Pressable>
  );
}

type NotifRow = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  /** Listing shot or agent headshot — always shown in the row. */
  image: ImageSourcePropType;
  /** Small contextual glyph on the thumbnail corner. */
  rowIcon: ComponentProps<typeof FontAwesome>['name'];
};

const RECENT_ITEMS: NotifRow[] = [
  {
    id: 'r1',
    title: 'New match for Brutal House 01',
    body: 'Buyer brief “Richmond / Cremorne” matches 218 Victoria St, West Melbourne, score 92.',
    time: '2m',
    unread: true,
    image: PROPERTY_IMG_1,
    rowIcon: 'home',
  },
  {
    id: 'r2',
    title: 'Armadale agent viewed your contract',
    body: 'The digital contract for Barkly St, St Kilda has been opened for review.',
    time: '1h',
    unread: true,
    image: AGENT_IMG,
    rowIcon: 'file-text-o',
  },
];

const EARLIER_ITEMS: NotifRow[] = [
  {
    id: 'e1',
    title: 'New match for Brutal House 01',
    body: 'Buyer brief “Richmond / Cremorne” matches 218 Victoria St, West Melbourne, score 92.',
    time: '2m',
    unread: true,
    image: PROPERTY_IMG_2,
    rowIcon: 'home',
  },
  {
    id: 'e2',
    title: 'Armadale agent viewed your contract',
    body: 'The digital contract for Barkly St, St Kilda has been opened for review.',
    time: '1h',
    unread: true,
    image: AGENT_IMG,
    rowIcon: 'file-text-o',
  },
];

function NotificationRow({ row, onPress }: { row: NotifRow; onPress: () => void }) {
  return (
    <Pressable
      style={styles.notifRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${row.title}, ${row.time}`}>
      <View style={styles.thumbWrap}>
        <Image source={row.image} style={styles.thumb} resizeMode="cover" accessibilityIgnoresInvertColors />
        <View style={styles.thumbIconBadge}>
          <FontAwesome name={row.rowIcon} size={11} color={palette.white} />
        </View>
        {row.unread ? <View style={styles.unreadDot} /> : null}
      </View>
      <View style={styles.notifTextCol}>
        <View style={styles.notifTop}>
          <Text style={styles.notifTitle} numberOfLines={2}>
            {row.title}
          </Text>
          <Text style={styles.notifTime}>{row.time}</Text>
        </View>
        <Text style={styles.notifBody} numberOfLines={3}>
          {row.body}
        </Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const hPad = useScreenHorizontalPadding();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [showFeatured, setShowFeatured] = useState(true);
  const [detailNotif, setDetailNotif] = useState<NotifRow | null>(null);

  const headerRight = (
    <View style={styles.bellWrap}>
      <View style={styles.bellBtn} accessibilityLabel="Notifications">
        <FontAwesome name="bell-o" size={20} color={ink} />
      </View>
      <View style={styles.bellBadge} />
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.headerChrome, hPad]}>
        <ScreenHeader title="Notifications" onBack={() => router.back()} right={headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled>
        <View style={[styles.stickyChips, hPad]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            bounces={false}
            style={styles.chipScroller}
            contentContainerStyle={styles.chipStrip}>
            <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
            <Chip label="Unread" active={filter === 'unread'} onPress={() => setFilter('unread')} />
            <Chip label="Matches" active={filter === 'matches'} onPress={() => setFilter('matches')} />
            <Chip label="System" active={filter === 'system'} onPress={() => setFilter('system')} />
          </ScrollView>
        </View>

        <View style={[styles.listBody, hPad]}>
          <ShortcutBanner icon="bolt" text="3 new enquiries" />
          <View style={{ height: 10 }} />
          <ShortcutBanner icon="star" text="2 transactions awaiting review" />
          <View style={{ height: 18 }} />

          {showFeatured ? (
            <View style={styles.featured}>
              <Image source={PROPERTY_IMG_1} style={styles.featuredImg} resizeMode="cover" />
              <Pressable
                style={styles.featuredClose}
                onPress={() => setShowFeatured(false)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Dismiss">
                <FontAwesome name="times-circle" size={22} color="rgba(0,0,0,0.55)" />
              </Pressable>
              <View style={styles.featuredText}>
                <Text style={styles.featuredTitle}>New match for Brutal House 01</Text>
                <Text style={styles.featuredSub}>
                  Buyer brief &quot;Richmond / Cremorne&quot; matches 218 Victoria St, West Melbourne, score 92.
                </Text>
              </View>
            </View>
          ) : null}

          <Text style={styles.sectionKicker}>RECENT</Text>
          {RECENT_ITEMS.map((row, i) => (
            <View key={row.id}>
              <NotificationRow row={row} onPress={() => setDetailNotif(row)} />
              {i < RECENT_ITEMS.length - 1 ? <View style={styles.notifRule} /> : null}
            </View>
          ))}

          <Text style={[styles.sectionKicker, { marginTop: 28 }]}>EARLIER</Text>
          {EARLIER_ITEMS.map((row, i) => (
            <View key={row.id}>
              <NotificationRow row={row} onPress={() => setDetailNotif(row)} />
              {i < EARLIER_ITEMS.length - 1 ? <View style={styles.notifRule} /> : null}
            </View>
          ))}
        </View>
      </ScrollView>

      <LegalDocModal
        visible={detailNotif != null}
        title={detailNotif?.title ?? ''}
        body={
          detailNotif
            ? `${detailNotif.time}\n\n${detailNotif.body}`
            : ''
        }
        onClose={() => setDetailNotif(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.white },
  headerChrome: { paddingBottom: 6 },
  stickyChips: {
    backgroundColor: palette.white,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderHairline,
  },
  listBody: { paddingTop: 12 },
  bellWrap: { width: 44, alignItems: 'flex-end', justifyContent: 'center' },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.18)',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  chipScroller: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chipStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 4,
    flexGrow: 0,
  },
  chip: {
    height: 31,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: ink },
  chipOff: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: borderHairline,
  },
  chipLabel: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: inkSubtle },
  chipLabelOn: { color: palette.white },
  scroll: { flex: 1, minHeight: 0 },
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.04)',
    gap: 12,
  },
  shortcutIcon: { width: 20 },
  shortcutText: { flex: 1, fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000' },
  featured: {
    marginTop: 8,
    marginBottom: 22,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  featuredImg: { width: '100%', height: 200 },
  featuredClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredText: { padding: 16, paddingTop: 14 },
  featuredTitle: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000', marginBottom: 8 },
  featuredSub: { fontSize: 14, lineHeight: 20, color: 'rgba(0, 0, 0, 0.65)' },
  sectionKicker: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.8,
    color: 'rgba(0, 0, 0, 0.45)',
    marginBottom: 12,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 12,
  },
  thumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: fillMisty,
    flexShrink: 0,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbIconBadge: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  notifTextCol: { flex: 1, minWidth: 0 },
  notifTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  notifTitle: { flex: 1, fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000', lineHeight: 20 },
  notifTime: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)' },
  notifBody: { marginTop: 6, fontSize: 14, lineHeight: 20, color: 'rgba(0, 0, 0, 0.55)' },
  notifRule: {
    marginLeft: 64,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
});
