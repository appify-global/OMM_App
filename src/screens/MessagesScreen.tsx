import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { threadAvatarForName } from '../constants/avatars';
import { brand } from '../theme/brand';

type Props = RootStackScreenProps<'Messages'>;
type FilterId = 'all' | 'unread' | 'buyers' | 'listings';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'buyers', label: 'Buyers' },
  { id: 'listings', label: 'Listings' },
];

const THREADS = [
  {
    name: 'Anton Zhouk',
    time: '2hr',
    preview: 'SOI + floorplan sent — review by 5pm?',
    address: '12 Walsh St, Hawthorn',
  },
  {
    name: 'Sarah Jenkins',
    time: '1d',
    preview: 'Floorplan v2 received — loading into data room now.',
    address: '1240 Park Ave',
  },
  {
    name: 'Camberwell Agent',
    time: '2d',
    preview: 'Contract opened for Auburn Road — any questions?',
    address: '88 Auburn Rd',
  },
];

export function MessagesScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<FilterId>('all');
  const [search, setSearch] = useState('');

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={26} color={brand.charcoal} />
          </Pressable>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={20} color={brand.sage} style={styles.searchIcon} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search deals, threads, people..."
              placeholderTextColor={brand.sage}
              style={styles.searchInput}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => setFilter(f.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={styles.banner} onPress={() => {}}>
            <Ionicons name="flash-outline" size={20} color={brand.sage} />
            <Text style={styles.bannerText}>3 new enquiries</Text>
            <Ionicons name="chevron-forward" size={18} color={brand.sage} />
          </Pressable>
          <Pressable style={styles.banner} onPress={() => {}}>
            <Ionicons name="star-outline" size={20} color={brand.sage} />
            <Text style={styles.bannerText}>2 transactions awaiting review</Text>
            <Ionicons name="chevron-forward" size={18} color={brand.sage} />
          </Pressable>

          {THREADS.map((t) => (
            <Pressable
              key={t.name}
              style={styles.thread}
              onPress={() =>
                navigation.navigate('MessageThread', {
                  name: t.name,
                  address: t.address,
                })
              }
            >
              <Image
                source={threadAvatarForName(t.name)}
                style={styles.threadAvatar}
              />
              <View style={styles.threadBody}>
                <View style={styles.threadTop}>
                  <Text style={styles.threadName} numberOfLines={1}>
                    {t.name}
                  </Text>
                  <Text style={styles.threadTime}>{t.time}</Text>
                </View>
                <Text style={styles.threadPreview} numberOfLines={2}>
                  {t.preview}
                </Text>
              </View>
            </Pressable>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>

        <Pressable
          style={styles.fab}
          accessibilityLabel="New message"
          onPress={() =>
            navigation.navigate('MessageThread', { name: 'New thread', address: '' })
          }
        >
          <Ionicons name="create-outline" size={26} color={brand.warmWhite} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.warmWhite },
  safe: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: brand.space.xs,
    paddingBottom: brand.space.xs,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backPlaceholder: { width: 44 },
  headerTitle: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.title,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
    letterSpacing: -0.5,
  },
  scroll: { paddingHorizontal: brand.space.sm, paddingTop: brand.space.xs },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.cream,
    borderRadius: brand.radius.lg,
    paddingHorizontal: brand.space.sm,
    marginBottom: brand.space.sm,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.charcoal,
    paddingVertical: 12,
  },
  chipsRow: {
    gap: brand.space.xs,
    paddingBottom: brand.space.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(26,26,26,0.2)',
  },
  chipActive: {
    backgroundColor: brand.terracotta,
    borderColor: brand.terracotta,
  },
  chipText: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  chipTextActive: { color: brand.warmWhite },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: brand.space.sm,
    backgroundColor: brand.cream,
    borderRadius: brand.radius.md,
    padding: brand.space.sm,
    marginBottom: brand.space.xs,
  },
  bannerText: {
    flex: 1,
    fontFamily: brand.fontSans,
    fontSize: brand.type.body,
    fontWeight: brand.type.weightRegular,
    color: brand.charcoal,
  },
  thread: {
    flexDirection: 'row',
    paddingVertical: brand.space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(138,155,142,0.35)',
  },
  threadAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: brand.cream },
  threadBody: { flex: 1, marginLeft: brand.space.sm, justifyContent: 'center' },
  threadTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  threadName: {
    flex: 1,
    fontFamily: brand.fontSans,
    fontSize: brand.type.body,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  threadTime: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.micro,
    color: brand.sage,
  },
  threadPreview: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.sage,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: brand.space.sm,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: brand.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: brand.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});
