import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { SheetHeader } from '@/components/SheetHeader';
import { type Href, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Text } from '@/components/OMMText';
import type { ImageSourcePropType } from 'react-native';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { NotificationKind, StoredNotification } from '@/lib/mobile-notifications-api';
import { notificationHrefToMobileRoute } from '@/lib/notification-navigation';
import { useOmmNotifications } from '@/lib/omm-notifications-context';

/**
 * Notifications centre.
 * [Figma 1053:7632 / section 1053:7187](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-7187)
 */

import { accent, borderHairline, fillMisty, ink, inkSubtle, palette, slateNavy } from '@/constants/theme';
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
  image: ImageSourcePropType;
  rowIcon: ComponentProps<typeof FontAwesome>['name'];
  source: StoredNotification;
};

const MS_DAY = 86_400_000;

const MATCH_KINDS: NotificationKind[] = ['NEW_MATCH'];
const SYSTEM_KINDS: NotificationKind[] = [
  'INSPECTION',
  'REVIEW',
  'DISPUTE',
  'BILLING',
  'SYSTEM',
  'BRIEF_REPLY',
];

function kindToIcon(kind: NotificationKind): ComponentProps<typeof FontAwesome>['name'] {
  switch (kind) {
    case 'NEW_MATCH':
      return 'star';
    case 'NEW_ENQUIRY':
      return 'bolt';
    case 'NEW_OFFER':
      return 'dollar';
    case 'INSPECTION':
      return 'calendar';
    case 'MESSAGE':
    case 'BRIEF_REPLY':
      return 'envelope-o';
    case 'REVIEW':
      return 'star-o';
    case 'DISPUTE':
      return 'gavel';
    case 'BILLING':
      return 'credit-card';
    default:
      return 'info-circle';
  }
}

function kindToImage(kind: NotificationKind): ImageSourcePropType {
  if (
    kind === 'MESSAGE' ||
    kind === 'BRIEF_REPLY' ||
    kind === 'REVIEW' ||
    kind === 'NEW_ENQUIRY'
  ) {
    return AGENT_IMG;
  }
  if (kind === 'NEW_MATCH' || kind === 'NEW_OFFER' || kind === 'INSPECTION') {
    return PROPERTY_IMG_1;
  }
  return PROPERTY_IMG_2;
}

function formatTimeLabel(label: string): string {
  return label.replace(/\s+ago$/i, '').replace(/^just now$/i, 'Now');
}

function toNotifRow(item: StoredNotification): NotifRow {
  return {
    id: item.id,
    title: item.title,
    body: item.body,
    time: formatTimeLabel(item.occurredAtLabel),
    unread: !item.read,
    image: kindToImage(item.kind),
    rowIcon: kindToIcon(item.kind),
    source: item,
  };
}

function filterItems(items: StoredNotification[], filter: FilterKey): StoredNotification[] {
  if (filter === 'unread') return items.filter((row) => !row.read);
  if (filter === 'matches') return items.filter((row) => MATCH_KINDS.includes(row.kind));
  if (filter === 'system') return items.filter((row) => SYSTEM_KINDS.includes(row.kind));
  return items;
}

function splitRecentEarlier(items: StoredNotification[]): { recent: NotifRow[]; earlier: NotifRow[] } {
  const now = Date.now();
  const recent: NotifRow[] = [];
  const earlier: NotifRow[] = [];
  for (const item of items) {
    const at = new Date(item.occurredAtIso).getTime();
    const row = toNotifRow(item);
    if (Number.isFinite(at) && now - at < MS_DAY) recent.push(row);
    else earlier.push(row);
  }
  return { recent, earlier };
}

function NotifDetailModal({
  row,
  onClose,
  onOpen,
}: {
  row: NotifRow | null;
  onClose: () => void;
  onOpen: () => void;
}) {
  if (!row) return null;
  const canOpen = notificationHrefToMobileRoute(row.source) != null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={notifModalStyles.scrim} onPress={onClose} />
      <View style={notifModalStyles.card}>
        <Text style={notifModalStyles.title}>{row.title}</Text>
        <Text style={notifModalStyles.time}>{row.time}</Text>
        <Text style={notifModalStyles.body}>{row.body}</Text>
        {canOpen ? (
          <Pressable
            style={notifModalStyles.openBtn}
            onPress={onOpen}
            accessibilityRole="button"
            accessibilityLabel="Open">
            <Text style={notifModalStyles.openBtnLabel}>OPEN</Text>
          </Pressable>
        ) : null}
        <Pressable style={notifModalStyles.closeBtn} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={notifModalStyles.closeBtnLabel}>CLOSE</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const notifModalStyles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 13,
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0,0,0,0.45)',
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0,0,0,0.65)',
    marginBottom: 20,
  },
  openBtn: {
    height: 44,
    backgroundColor: accent,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  openBtnLabel: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.5,
  },
  closeBtn: {
    height: 44,
    backgroundColor: '#1C1C1E',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnLabel: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

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
  const { items, ready, refresh, markRead } = useOmmNotifications();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [showFeatured, setShowFeatured] = useState(true);
  const [detailNotif, setDetailNotif] = useState<NotifRow | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const filtered = useMemo(() => filterItems(items, filter), [items, filter]);
  const { recent, earlier } = useMemo(() => splitRecentEarlier(filtered), [filtered]);

  const newEnquiryCount = useMemo(
    () => items.filter((row) => !row.read && row.kind === 'NEW_ENQUIRY').length,
    [items],
  );
  const pendingReviewCount = useMemo(
    () =>
      items.filter(
        (row) => !row.read && (row.kind === 'NEW_OFFER' || row.kind === 'INSPECTION'),
      ).length,
    [items],
  );

  const featuredSource = useMemo(
    () =>
      items.find((row) => !row.read && (row.kind === 'NEW_ENQUIRY' || row.kind === 'NEW_MATCH')),
    [items],
  );

  const openRow = useCallback(
    (row: NotifRow) => {
      if (!row.source.read) void markRead(row.source.id);
      const route = notificationHrefToMobileRoute(row.source);
      if (route) router.push(route);
      else setDetailNotif(row);
    },
    [markRead, router],
  );

  const dismissFeatured = useCallback(() => {
    setShowFeatured(false);
    if (featuredSource && !featuredSource.read) void markRead(featuredSource.id);
  }, [featuredSource, markRead]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.headerChrome, hPad]}>
        <SheetHeader title="Notifications" onClose={() => router.back()} />
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
          {!ready ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={slateNavy} />
            </View>
          ) : null}

          {ready && newEnquiryCount > 0 ? (
            <>
              <ShortcutBanner
                icon="bolt"
                text={
                  newEnquiryCount === 1
                    ? '1 new enquiry'
                    : `${newEnquiryCount} new enquiries`
                }
              />
              <View style={{ height: 10 }} />
            </>
          ) : null}
          {ready && pendingReviewCount > 0 ? (
            <>
              <ShortcutBanner
                icon="star"
                text={
                  pendingReviewCount === 1
                    ? '1 update awaiting review'
                    : `${pendingReviewCount} updates awaiting review`
                }
              />
              <View style={{ height: 18 }} />
            </>
          ) : null}

          {ready && showFeatured && featuredSource ? (
            <Pressable
              style={styles.featured}
              onPress={() => openRow(toNotifRow(featuredSource))}
              accessibilityRole="button">
              <Image
                source={kindToImage(featuredSource.kind)}
                style={styles.featuredImg}
                resizeMode="cover"
              />
              <Pressable
                style={styles.featuredClose}
                onPress={dismissFeatured}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Dismiss">
                <FontAwesome name="times-circle" size={22} color="rgba(0,0,0,0.55)" />
              </Pressable>
              <View style={styles.featuredText}>
                <Text style={styles.featuredTitle}>{featuredSource.title}</Text>
                <Text style={styles.featuredSub}>{featuredSource.body}</Text>
              </View>
            </Pressable>
          ) : null}

          {ready && filtered.length === 0 ? (
            <Text style={styles.emptyCopy}>
              {items.length === 0
                ? 'No notifications yet. Enquiries and messages will show up here.'
                : 'Nothing in this filter.'}
            </Text>
          ) : null}

          {recent.length > 0 ? (
            <>
              <Text style={styles.sectionKicker}>RECENT</Text>
              {recent.map((row, i) => (
                <View key={row.id}>
                  <NotificationRow row={row} onPress={() => openRow(row)} />
                  {i < recent.length - 1 ? <View style={styles.notifRule} /> : null}
                </View>
              ))}
            </>
          ) : null}

          {earlier.length > 0 ? (
            <>
              <Text style={[styles.sectionKicker, { marginTop: recent.length > 0 ? 28 : 0 }]}>
                EARLIER
              </Text>
              {earlier.map((row, i) => (
                <View key={row.id}>
                  <NotificationRow row={row} onPress={() => openRow(row)} />
                  {i < earlier.length - 1 ? <View style={styles.notifRule} /> : null}
                </View>
              ))}
            </>
          ) : null}
        </View>
      </ScrollView>

      <NotifDetailModal
        row={detailNotif}
        onClose={() => setDetailNotif(null)}
        onOpen={() => {
          if (!detailNotif) return;
          const route = notificationHrefToMobileRoute(detailNotif.source);
          setDetailNotif(null);
          if (route) router.push(route as Href);
        }}
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
  loadingWrap: { paddingVertical: 32, alignItems: 'center' },
  emptyCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: inkSubtle,
    fontFamily: 'Satoshi-Medium',
    marginTop: 8,
    marginBottom: 12,
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
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: accent },
  chipOff: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: borderHairline,
  },
  chipLabel: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: inkSubtle },
  chipLabelOn: { color: ink },
  scroll: { flex: 1, minHeight: 0 },
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.04)',
    gap: 12,
  },
  shortcutIcon: { width: 20 },
  shortcutText: { flex: 1, fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000' },
  featured: {
    marginTop: 8,
    marginBottom: 22,
    borderRadius: 11,
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
    borderRadius: 15,
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
    backgroundColor: slateNavy,
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
