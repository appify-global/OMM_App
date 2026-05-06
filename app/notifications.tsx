import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LegalDocModal } from '@/components/LegalDocModal';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Notifications centre.
 * [Figma 1053:7632 / section 1053:7187](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-7187)
 */

const IMG = require('@/assets/images/welcome-bg.jpg');

const PAD = 24;

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
      <FontAwesome name={icon} size={16} color="#1c1c1e" style={styles.shortcutIcon} />
      <Text style={styles.shortcutText}>{text}</Text>
      <FontAwesome name="chevron-right" size={12} color="rgba(60,60,67,0.35)" />
    </Pressable>
  );
}

type NotifRow = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

const RECENT_ITEMS: NotifRow[] = [
  {
    id: 'r1',
    title: 'New match for Brutal House 01',
    body: 'Buyer brief “Hawthorn / Kew” matches 12 Denham St, score 92.',
    time: '2m',
    unread: true,
  },
  {
    id: 'r2',
    title: 'Camberwell Agent viewed your contract',
    body: 'The digital contract for Auburn Road has been opened for review.',
    time: '1h',
    unread: true,
  },
];

const EARLIER_ITEMS: NotifRow[] = [
  {
    id: 'e1',
    title: 'New match for Brutal House 01',
    body: 'Buyer brief “Hawthorn / Kew” matches 12 Denham St, score 92.',
    time: '2m',
    unread: true,
  },
  {
    id: 'e2',
    title: 'Camberwell Agent viewed your contract',
    body: 'The digital contract for Auburn Road has been opened for review.',
    time: '1h',
    unread: true,
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
        <Image source={IMG} style={styles.thumb} resizeMode="cover" />
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
  const [filter, setFilter] = useState<FilterKey>('all');
  const [showFeatured, setShowFeatured] = useState(true);
  const [detailNotif, setDetailNotif] = useState<NotifRow | null>(null);

  const padH = useMemo(
    () => Math.max(PAD, insets.left, insets.right),
    [insets.left, insets.right],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: padH }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.headerSide}>
          <FontAwesome name="chevron-left" size={22} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.bellWrap}>
          <View style={styles.bellBtn} accessibilityLabel="Notifications">
            <FontAwesome name="bell-o" size={20} color="#1c1c1e" />
          </View>
          <View style={styles.bellBadge} />
        </View>
      </View>

      <View style={styles.chipRowHost}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          bounces={false}
          style={styles.chipScroller}
          contentContainerStyle={[styles.chipStrip, { paddingHorizontal: padH }]}>
          <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Unread" active={filter === 'unread'} onPress={() => setFilter('unread')} />
          <Chip label="Matches" active={filter === 'matches'} onPress={() => setFilter('matches')} />
          <Chip label="System" active={filter === 'system'} onPress={() => setFilter('system')} />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollInner,
          { paddingHorizontal: padH, paddingBottom: insets.bottom + 28 },
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled>
        <ShortcutBanner icon="bolt" text="3 new enquiries" />
        <View style={{ height: 10 }} />
        <ShortcutBanner icon="star" text="2 transactions awaiting review" />
        <View style={{ height: 18 }} />

        {showFeatured ? (
          <View style={styles.featured}>
            <Image source={IMG} style={styles.featuredImg} resizeMode="cover" />
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
                Buyer brief &quot;Hawthorn / Kew&quot; matches 12 Denham St, score 92.
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
  screen: { flex: 1, backgroundColor: '#f7f7f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: '#f7f7f5',
  },
  headerSide: { minWidth: 44, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  bellWrap: { minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.18)',
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
    backgroundColor: '#007aff',
    borderWidth: 1.5,
    borderColor: '#f7f7f5',
  },
  chipRowHost: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 6,
  },
  chipScroller: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chipStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    flexGrow: 0,
  },
  chip: {
    height: 31,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: '#1c1c1e' },
  chipOff: { backgroundColor: '#ebe8e2' },
  chipLabel: { fontSize: 13, fontWeight: '500', color: '#2e2e2e' },
  chipLabelOn: { color: '#fff' },
  scroll: { flex: 1, minHeight: 0 },
  scrollInner: {},
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f0ebe4',
    gap: 12,
  },
  shortcutIcon: { width: 20 },
  shortcutText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1c1c1e' },
  featured: {
    marginTop: 8,
    marginBottom: 22,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#f0ebe4',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
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
  featuredTitle: { fontSize: 16, fontWeight: '700', color: '#1c1c1e', marginBottom: 8 },
  featuredSub: { fontSize: 14, lineHeight: 20, color: 'rgba(60,60,67,0.65)' },
  sectionKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: 'rgba(60,60,67,0.45)',
    marginBottom: 12,
  },
  notifRow: { flexDirection: 'row', paddingVertical: 12, gap: 14 },
  thumbWrap: { width: 48, position: 'relative', paddingTop: 10 },
  thumb: { width: 48, height: 48, borderRadius: 8 },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1c1c1e',
    borderWidth: 2,
    borderColor: '#f7f7f5',
  },
  notifTextCol: { flex: 1, minWidth: 0 },
  notifTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  notifTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1c1c1e', lineHeight: 20 },
  notifTime: { fontSize: 13, fontWeight: '500', color: 'rgba(60,60,67,0.45)' },
  notifBody: { marginTop: 6, fontSize: 14, lineHeight: 20, color: 'rgba(60,60,67,0.55)' },
  notifRule: {
    marginLeft: 62,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.12)',
  },
});
