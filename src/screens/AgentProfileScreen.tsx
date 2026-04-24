import React, { useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { brand } from '../theme/brand';
import { images } from '../constants/images';

type Props = RootStackScreenProps<'AgentProfile'>;

const STATS = [
  { value: '12', label: 'LISTINGS' },
  { value: '87', label: 'CLOSED' },
  { value: '6', label: 'YEARS' },
  { value: '98%', label: 'ON-TIME' },
] as const;

const PREVIEW_REVIEWS = [
  {
    name: 'Sarah Chen',
    role: 'Buyers Agent - BR Realty',
    stars: 5.0,
    text: "Quick replies, SOI was always on hand. Settlement ran smooth. Would recommend Anton to any buyer I work with.",
    date: '14 APR 2026',
    photo: images.reviewer1,
  },
  {
    name: 'Tom Reid',
    role: 'Listing Agent - Marshall White',
    stars: 4.8,
    text: 'Clear authority docs, fair commission split, no surprises at settlement. Would work with again.',
    date: '02 APR 2026',
    photo: images.reviewer2,
  },
] as const;

const PREVIEW_LISTINGS = [
  {
    address: '22 Lilac Ave, Hawthorn',
    specs: 'HOUSE • 4 BED • 2 BATH',
    price: '$2.1m — $2.3m',
    time: 'Listed 3 days ago',
    photo: images.propertyHouse1,
  },
  {
    address: '18 Gordon St, Balwyn',
    specs: 'HOUSE • 3 BED • 2 BATH',
    price: '$1.85m — $1.95m',
    time: 'Listed 1 week ago',
    photo: images.propertyHouse2,
  },
] as const;

export function AgentProfileScreen({ navigation }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={styles.topIcon}
          >
            <Ionicons name="chevron-back" size={26} color={brand.charcoal} />
          </Pressable>
          <Text style={styles.topTitle}>Agent</Text>
          <Pressable
            onPress={() => setMenuOpen(true)}
            style={styles.topIcon}
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-vertical" size={22} color={brand.charcoal} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Image source={images.agentAnton} style={styles.profileImg} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Anton Zhouk</Text>
              <Text style={styles.profileSub}>Listing Agent</Text>
              <Text style={styles.profileSub}>Ray White Hawthorn</Text>
              <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    name="star"
                    size={14}
                    color={i < 5 ? brand.charcoal : brand.cream}
                  />
                ))}
                <Text style={styles.starsText}>4.9 · 42 reviews</Text>
              </View>
            </View>
          </View>
          <View style={styles.btnRow}>
            <Pressable
              style={styles.btnPrimary}
              onPress={() =>
                navigation.navigate('MessageThread', { name: 'Anton Zhouk', address: '12 Walsh St' })
              }
            >
              <Text style={styles.btnPrimaryText}>Message</Text>
            </Pressable>
            <Pressable
              style={styles.btnSecondary}
              onPress={() => Linking.openURL('tel:+61400000000')}
            >
              <Text style={styles.btnSecondaryText}>Call</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statBar}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>REVIEWS</Text>
          <Pressable
            onPress={() => navigation.navigate('AgentReviews', { agentName: 'Anton Zhouk' })}
          >
            <Text style={styles.seeAll}>
              SEE ALL <Ionicons name="arrow-forward" size={12} color={brand.terracotta} />
            </Text>
          </Pressable>
        </View>
        {PREVIEW_REVIEWS.map((r) => (
          <View key={r.name} style={styles.reviewCard}>
            <View style={styles.reviewTop}>
              <Image source={r.photo} style={styles.reviewAv} />
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewName}>{r.name}</Text>
                <Text style={styles.reviewRole}>{r.role}</Text>
              </View>
              <Text style={styles.reviewStarNum}>★ {r.stars.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewBody}>&ldquo;{r.text}&rdquo;</Text>
            <Text style={styles.reviewDate}>{r.date}</Text>
          </View>
        ))}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>ACTIVE LISTINGS</Text>
          <Pressable onPress={() => navigation.navigate('AgentListings', { agentName: 'Anton Zhouk' })}>
            <Text style={styles.seeAll}>
              SEE ALL <Ionicons name="arrow-forward" size={12} color={brand.terracotta} />
            </Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
        >
          {PREVIEW_LISTINGS.map((l) => (
            <View key={l.address} style={styles.hCard}>
              <View style={styles.hImageWrap}>
                <Image source={l.photo} style={styles.hImage} resizeMode="cover" />
                <View style={styles.livePill}>
                  <Text style={styles.livePillText}>LIVE</Text>
                </View>
              </View>
              <Text style={styles.hAddr}>{l.address}</Text>
              <Text style={styles.hSpec}>{l.specs}</Text>
              <Text style={styles.hPrice}>{l.price}</Text>
              <Text style={styles.hTime}>{l.time}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, styles.aboutHead]}>ABOUT</Text>
        <Text style={styles.aboutText}>
          Principal agent with 6 years in Boroondara. Specialises in family homes and boutique
          apartments. Known for fast-turn SOI and clean authority docs.
        </Text>

        <View style={styles.listActions}>
          <ActionRow
            icon="warning-outline"
            color="#b8860b"
            title="Raise a dispute"
            sub="Open formal ticket with OMM moderators."
            onPress={() => {}}
          />
          <ActionRow
            icon="remove-circle-outline"
            color={brand.charcoal}
            title="Block agent"
            sub="You will no longer receive messages."
            onPress={() => {}}
          />
          <ActionRow
            icon="flag-outline"
            color={brand.charcoal}
            title="Report profile"
            sub="For spam, misleading info, or conduct issues."
            onPress={() => {}}
          />
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.menuRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} />
          <View style={styles.menuCard}>
            {['Share profile', 'Report issue'].map((s) => (
              <Pressable key={s} style={styles.menuItem} onPress={() => setMenuOpen(false)}>
                <Text style={styles.menuText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ActionRow({
  icon,
  color,
  title,
  sub,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionRow}>
      <Ionicons name={icon} size={22} color={color} />
      <View style={styles.actionMid}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={brand.sage} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4f1ee' },
  safe: { backgroundColor: '#f4f1ee' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: brand.space.xs,
  },
  topIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: brand.fontSans,
    fontSize: brand.type.subtitle,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  scroll: { padding: brand.space.sm, paddingTop: 0 },
  profileCard: {
    backgroundColor: brand.white,
    borderRadius: brand.radius.lg,
    padding: brand.space.md,
    marginBottom: brand.space.md,
    shadowColor: brand.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileRow: { flexDirection: 'row' },
  profileImg: { width: 80, height: 80, borderRadius: 40, marginRight: brand.space.sm },
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileName: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.body,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  profileSub: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.sage,
    marginTop: 2,
  },
  starsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap', gap: 2 },
  starsText: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.charcoal,
    marginLeft: 6,
  },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: brand.space.md },
  btnPrimary: {
    flex: 1,
    backgroundColor: brand.terracotta,
    borderRadius: brand.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: { fontFamily: brand.fontSans, color: brand.warmWhite, fontWeight: '600' },
  btnSecondary: {
    flex: 1,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: brand.charcoal,
    borderRadius: brand.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSecondaryText: { fontFamily: brand.fontSans, color: brand.charcoal, fontWeight: '600' },
  statBar: {
    flexDirection: 'row',
    backgroundColor: brand.white,
    borderRadius: brand.radius.md,
    paddingVertical: brand.space.md,
    marginBottom: brand.space.md,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.2)',
  },
  statCell: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: brand.fontSans, fontSize: 20, fontWeight: '600', color: brand.charcoal },
  statLabel: { fontSize: 9, color: brand.sage, marginTop: 4, letterSpacing: 0.5 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: brand.space.sm },
  sectionTitle: {
    fontFamily: brand.fontSans,
    fontSize: 11,
    letterSpacing: 1.2,
    color: brand.sage,
    fontWeight: brand.type.weightMedium,
  },
  seeAll: { fontSize: 11, color: brand.terracotta, fontWeight: '600' },
  reviewCard: {
    backgroundColor: brand.white,
    borderRadius: brand.radius.md,
    padding: brand.space.sm,
    marginBottom: brand.space.sm,
  },
  reviewTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAv: { width: 40, height: 40, borderRadius: 20 },
  reviewInfo: { flex: 1, marginLeft: 10 },
  reviewName: { fontWeight: '600', color: brand.charcoal, fontSize: brand.type.caption },
  reviewRole: { color: brand.sage, fontSize: 12, marginTop: 2 },
  reviewStarNum: { fontSize: 12, fontWeight: '600', color: brand.charcoal },
  reviewBody: { fontSize: 14, color: brand.charcoal, lineHeight: 21 },
  reviewDate: { fontSize: 11, color: brand.sage, marginTop: 8 },
  hList: { gap: 12, paddingBottom: 8 },
  hCard: {
    width: 200,
    backgroundColor: brand.white,
    borderRadius: brand.radius.md,
    padding: 10,
  },
  hImageWrap: { position: 'relative' },
  hImage: { width: '100%', height: 90, borderRadius: brand.radius.sm, backgroundColor: brand.cream },
  livePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: brand.terracotta,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  livePillText: { color: brand.warmWhite, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  hAddr: { fontWeight: '600', color: brand.charcoal, fontSize: 12, marginTop: 6 },
  hSpec: { fontSize: 10, color: brand.sage, marginTop: 4, textTransform: 'uppercase' },
  hPrice: { fontWeight: '600', color: brand.charcoal, fontSize: 14, marginTop: 4 },
  hTime: { fontSize: 10, color: brand.sage, marginTop: 4 },
  aboutHead: { marginTop: brand.space.md, marginBottom: 8 },
  aboutText: { color: brand.charcoal, lineHeight: 24, fontSize: brand.type.caption },
  listActions: { marginTop: brand.space.lg, gap: 0 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.white,
    padding: brand.space.sm,
    borderRadius: brand.radius.md,
    marginBottom: brand.space.xs,
  },
  actionMid: { flex: 1, marginLeft: 10 },
  actionTitle: { fontWeight: '600', color: brand.charcoal, fontSize: 15 },
  actionSub: { color: brand.sage, fontSize: 12, marginTop: 2 },
  menuRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  menuCard: {
    position: 'absolute',
    top: 52,
    right: 20,
    backgroundColor: brand.white,
    borderRadius: brand.radius.md,
    minWidth: 180,
  },
  menuItem: { padding: 16 },
  menuText: { fontSize: 16, color: brand.charcoal },
});
