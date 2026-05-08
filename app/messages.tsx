import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScreenHeader } from '@/components/ScreenHeader';
import { type Href, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Messages inbox.
 * [Figma 1053:7188 / section 1053:7187](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-7187)
 */

import { borderHairline, ink, inkSubtle, palette } from '@/constants/theme';
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
};

const THREADS: Thread[] = [
  {
    id: '1',
    name: 'Anton Zhouk',
    preview: 'SOI + floorplan sent — review by 5pm?',
    time: '2M',
    unread: true,
  },
  {
    id: '2',
    name: 'Anton Zhouk',
    preview: 'SOI + floorplan sent — review by 5pm?',
    time: '2M',
    unread: true,
  },
  {
    id: '3',
    name: 'Anton Zhouk',
    preview: 'SOI + floorplan sent — review by 5pm?',
    time: '2M',
    unread: true,
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

  const filtered = useMemo(() => {
    if (filter === 'unread') return THREADS.filter((t) => t.unread);
    return THREADS;
  }, [filter]);

  const headerRight = (
    <View style={styles.bellWrap}>
      <Pressable
        onPress={() => router.push('/notifications' as Href)}
        style={styles.bellBtn}
        accessibilityRole="button"
        accessibilityLabel="Notifications">
        <FontAwesome name="bell-o" size={20} color={ink} />
      </Pressable>
      <View style={styles.bellBadge} />
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.headerChrome, hPad]}>
        <ScreenHeader title="Messages" onBack={() => router.back()} right={headerRight} />
      </View>

      <View style={[styles.searchWrap, hPad]}>
        <FontAwesome name="search" size={16} color={inkSubtle} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search deals, threads, people…"
          placeholderTextColor={inkSubtle}
        />
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
          <ShortcutBanner icon="star" text="2 transactions awaiting review" />
          <View style={{ height: 18 }} />

          {filtered.map((row) => (
            <View key={row.id}>
              <ThreadRow row={row} onPress={() => router.push('/contact-seller-chat' as Href)} />
              <View style={styles.threadRule} />
            </View>
          ))}
        </View>
      </ScrollView>

      <Pressable
        style={[styles.fab, { bottom: Math.max(insets.bottom, 20) + 8 }]}
        accessibilityRole="button"
        accessibilityLabel="Compose message">
        <FontAwesome name="pencil" size={20} color="#fff" />
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 18,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#000000', paddingVertical: 8 },
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
  threadRow: { flexDirection: 'row', paddingVertical: 14, gap: 12 },
  threadAvatarWrap: { width: 66, height: 64, position: 'relative' },
  threadAvatar: { width: 66, height: 64, borderRadius: 8 },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  threadBody: { flex: 1, minWidth: 0 },
  threadTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  threadName: { flex: 1, fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000' },
  threadTime: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)' },
  threadPreview: { marginTop: 6, fontSize: 14, lineHeight: 20, color: 'rgba(0, 0, 0, 0.55)' },
  threadRule: {
    marginLeft: 78,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
