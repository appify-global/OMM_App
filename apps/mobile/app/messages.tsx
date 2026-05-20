import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { SheetHeader } from '@/components/SheetHeader';
import { type Href, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Messages inbox.
 * [Figma 1053:7188 / section 1053:7187](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-7187)
 */

import { accent, borderHairline, fillMisty, ink, inkSubtle, palette, slateNavy } from '@/constants/theme';
import { countDealsAwaitingViewerAcknowledgement, DEMO_CHAT_PROPERTY_REF } from '@/lib/deal-acknowledgement';
import { useScreenHorizontalPadding } from '@/lib/useScreenHorizontalPadding';
import { AGENT_IMG } from '@/lib/propertyImages';

type FilterKey = 'all' | 'unread' | 'buyers' | 'listings';

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

type Thread = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: boolean;
  propertyRef: string;
};

const THREADS: Thread[] = [
  {
    id: '1',
    name: 'Anton Zhouk',
    preview: 'SOI + floorplan sent - review by 5pm?',
    time: '2M',
    unread: true,
    propertyRef: DEMO_CHAT_PROPERTY_REF,
  },
  {
    id: '2',
    name: 'Anton Zhouk',
    preview: 'SOI + floorplan sent - review by 5pm?',
    time: '2M',
    unread: true,
    propertyRef: DEMO_CHAT_PROPERTY_REF,
  },
  {
    id: '3',
    name: 'Anton Zhouk',
    preview: 'SOI + floorplan sent - review by 5pm?',
    time: '2M',
    unread: true,
    propertyRef: DEMO_CHAT_PROPERTY_REF,
  },
];

function ThreadRow({ row, onPress }: { row: Thread; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.threadRow} accessibilityRole="button">
      <View style={styles.threadAvatarWrap}>
        <Image source={AGENT_IMG} style={styles.threadAvatar} resizeMode="cover" />
        {row.unread ? <View style={styles.unreadDot} /> : null}
      </View>
      <View style={styles.threadBody}>
        <View style={styles.threadTop}>
          <Text style={styles.threadName} numberOfLines={1}>
            {row.name}
          </Text>
          <Text style={styles.threadTime}>{row.time}</Text>
        </View>
        <Text style={styles.threadPreview} numberOfLines={2}>
          {row.preview}
        </Text>
      </View>
    </Pressable>
  );
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const hPad = useScreenHorizontalPadding();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const [awaitingAckCount, setAwaitingAckCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      countDealsAwaitingViewerAcknowledgement().then((count) => {
        if (alive) setAwaitingAckCount(count);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const filtered = useMemo(() => {
    if (filter === 'unread') return THREADS.filter((t) => t.unread);
    return THREADS;
  }, [filter]);

  const openThread = useCallback(
    (row: Thread) => {
      router.push({
        pathname: '/contact-seller-chat',
        params: { propertyRef: row.propertyRef },
      } as Href);
    },
    [router],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.headerChrome, hPad]}>
        <SheetHeader title="Messages" onClose={() => router.back()} />
      </View>

      <View style={[styles.searchOuter, hPad]}>
        <View style={styles.searchWrap}>
          <FontAwesome name="search" size={16} color={inkSubtle} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search deals, threads, people…"
            placeholderTextColor={inkSubtle}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
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
            <Chip label="Buyers" active={filter === 'buyers'} onPress={() => setFilter('buyers')} />
            <Chip label="Listings" active={filter === 'listings'} onPress={() => setFilter('listings')} />
          </ScrollView>
        </View>

        <View style={[styles.listBody, hPad]}>
          <ShortcutBanner icon="bolt" text="3 new enquiries" />
          <View style={{ height: 10 }} />
          {awaitingAckCount > 0 ? (
            <>
              <Pressable
                style={styles.shortcut}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/contact-seller-chat',
                    params: { propertyRef: DEMO_CHAT_PROPERTY_REF },
                  } as Href)
                }>
                <FontAwesome name="check-circle" size={16} color="#000000" style={styles.shortcutIcon} />
                <Text style={styles.shortcutText}>
                  {awaitingAckCount} transaction awaiting your acknowledgement
                </Text>
                <FontAwesome name="chevron-right" size={12} color="rgba(0, 0, 0, 0.35)" />
              </Pressable>
              <View style={{ height: 10 }} />
            </>
          ) : null}
          <ShortcutBanner icon="star" text="2 transactions awaiting review" />
          <View style={{ height: 18 }} />

          {filtered.map((row) => (
            <View key={row.id}>
              <ThreadRow row={row} onPress={() => openThread(row)} />
              <View style={styles.threadRule} />
            </View>
          ))}
        </View>
      </ScrollView>

      <Pressable
        style={[styles.fab, { bottom: Math.max(insets.bottom, 20) + 8 }]}
        accessibilityRole="button"
        accessibilityLabel="Compose message">
        <FontAwesome name="pencil" size={20} color={palette.black} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.white },
  headerChrome: {
    paddingBottom: 6,
  },
  stickyChips: {
    backgroundColor: palette.white,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderHairline,
  },
  listBody: {
    paddingTop: 12,
  },
  searchOuter: {
    marginBottom: 16,
    maxWidth: '100%',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    maxWidth: '100%',
    overflow: 'hidden',
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 14,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 15,
    paddingVertical: 0,
    color: ink,
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
  threadRow: { flexDirection: 'row', paddingVertical: 14, gap: 12 },
  threadAvatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: fillMisty,
    flexShrink: 0,
  },
  threadAvatar: {
    width: '100%',
    height: '100%',
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: slateNavy,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  threadBody: { flex: 1, minWidth: 0 },
  threadTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  threadName: { flex: 1, fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000' },
  threadTime: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)' },
  threadPreview: { marginTop: 6, fontSize: 14, lineHeight: 20, color: 'rgba(0, 0, 0, 0.55)' },
  threadRule: {
    marginLeft: 64,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
