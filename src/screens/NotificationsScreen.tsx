import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { images } from '../constants/images';
import { brand } from '../theme/brand';

type Props = RootStackScreenProps<'Notifications'>;
type FilterId = 'all' | 'unread' | 'matches' | 'system';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'matches', label: 'Matches' },
  { id: 'system', label: 'System' },
];

type Notif = {
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  thumb: (typeof images)[keyof typeof images];
};

const RECENT: Notif[] = [
  {
    title: 'New match for Brutal House 01',
    body: "Buyer brief 'Hawthorn / Kew' matches 12 Denham St. Score 92.",
    time: '2m',
    unread: true,
    thumb: images.propertyHouse1,
  },
  {
    title: 'Camberwell Agent viewed your contract',
    body: 'Digital contract for Auburn Road was opened.',
    time: '1h',
    unread: true,
    thumb: images.propertyHouse2,
  },
];

const EARLIER: Notif[] = [
  {
    title: 'New match for Brutal House 01',
    body: "Buyer brief updated — still matches 12 Denham St.",
    time: '1d',
    thumb: images.propertyHouse3,
  },
  {
    title: 'Camberwell Agent viewed your contract',
    body: 'Second view logged for Auburn Road contract.',
    time: '2d',
    thumb: images.propertyHouse1,
  },
];

export function NotificationsScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<FilterId>('all');
  const [featuredOpen, setFeaturedOpen] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
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

          {featuredOpen && (
            <View style={styles.featured}>
              <View style={styles.featuredImageWrap}>
                <Pressable
                  style={styles.featuredClose}
                  hitSlop={8}
                  onPress={() => setFeaturedOpen(false)}
                >
                  <Ionicons name="close" size={20} color={brand.charcoal} />
                </Pressable>
                <Pressable onPress={() => setDetailOpen(true)} style={styles.featuredImagePress}>
                  <Image
                    source={images.propertyHouse1}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />
                </Pressable>
              </View>
              <Pressable onPress={() => setDetailOpen(true)}>
                <Text style={styles.featuredTitle}>New match for Brutal House 01</Text>
                <Text style={styles.featuredSub}>
                  Buyer brief &apos;Hawthorn / Kew&apos; matches 12 Denham St, score 92.
                </Text>
              </Pressable>
            </View>
          )}

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

          <Text style={styles.sectionLabel}>RECENT</Text>
          {RECENT.map((n, i) => (
            <NotificationRow
              key={`r-${i}`}
              n={n}
              onPress={() => setDetailOpen(true)}
            />
          ))}

          <Text style={styles.sectionLabel}>EARLIER</Text>
          {EARLIER.map((n, i) => (
            <NotificationRow
              key={`e-${i}`}
              n={n}
              onPress={() => setDetailOpen(true)}
            />
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={detailOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDetailOpen(false)} />
          <View style={styles.modalCard}>
            <Pressable
              style={styles.modalClose}
              hitSlop={12}
              onPress={() => setDetailOpen(false)}
            >
              <Ionicons name="close" size={24} color={brand.charcoal} />
            </Pressable>
            <Image
              source={images.propertyHouse1}
              style={styles.modalHero}
              resizeMode="cover"
            />
            <Text style={styles.modalTitle}>New match for Brutal House 01</Text>
            <Text style={styles.modalBody}>
              Buyer brief &apos;Hawthorn / Kew&apos; matches 12 Denham St, score 92.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function NotificationRow({ n, onPress }: { n: Notif; onPress: () => void }) {
  return (
    <Pressable style={styles.notifRow} onPress={onPress}>
      <View style={styles.thumbWrap}>
        <Image source={n.thumb} style={styles.thumb} resizeMode="cover" />
        {n.unread ? <View style={styles.unreadDot} /> : null}
      </View>
      <View style={styles.notifMid}>
        <Text style={styles.notifTitle}>{n.title}</Text>
        <Text style={styles.notifBody} numberOfLines={2}>
          {n.body}
        </Text>
      </View>
      <Text style={styles.notifTime}>{n.time}</Text>
    </Pressable>
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
  chipsRow: { gap: brand.space.xs, marginBottom: brand.space.sm },
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
  featured: {
    backgroundColor: brand.cream,
    borderRadius: brand.radius.md,
    padding: brand.space.sm,
    marginBottom: brand.space.sm,
  },
  featuredImageWrap: {
    position: 'relative',
    borderRadius: brand.radius.sm,
    overflow: 'hidden',
    marginBottom: brand.space.sm,
  },
  featuredClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(254,253,251,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImagePress: { width: '100%' },
  featuredImage: { width: '100%', height: 160, borderRadius: brand.radius.sm, backgroundColor: brand.cream },
  featuredTitle: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.body,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
    marginBottom: 6,
  },
  featuredSub: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.sage,
    lineHeight: 20,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: brand.space.sm,
    backgroundColor: brand.white,
    borderRadius: brand.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.25)',
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
  sectionLabel: {
    fontFamily: brand.fontSans,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: brand.type.weightMedium,
    color: brand.sage,
    marginTop: brand.space.sm,
    marginBottom: brand.space.xs,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: brand.space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(138,155,142,0.35)',
  },
  thumbWrap: { position: 'relative' },
  thumb: { width: 48, height: 48, borderRadius: 6, backgroundColor: brand.cream },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brand.charcoal,
    borderWidth: 1,
    borderColor: brand.warmWhite,
  },
  notifMid: { flex: 1, marginHorizontal: brand.space.sm },
  notifTitle: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
    marginBottom: 4,
  },
  notifBody: {
    fontFamily: brand.fontSans,
    fontSize: 12,
    color: brand.sage,
    lineHeight: 17,
  },
  notifTime: {
    fontFamily: brand.fontSans,
    fontSize: 12,
    color: brand.sage,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: 64,
    paddingHorizontal: brand.space.sm,
  },
  modalCard: {
    backgroundColor: brand.warmWhite,
    borderRadius: brand.radius.lg,
    padding: brand.space.sm,
    zIndex: 1,
  },
  modalClose: { alignSelf: 'flex-end', marginBottom: brand.space.xs },
  modalHero: {
    width: '100%',
    height: 200,
    borderRadius: brand.radius.md,
    marginBottom: brand.space.sm,
  },
  modalTitle: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.subtitle,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
    marginBottom: brand.space.sm,
  },
  modalBody: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.body,
    color: brand.sage,
    lineHeight: 24,
  },
});
