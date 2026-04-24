import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { brand } from '../theme/brand';

type Props = RootStackScreenProps<'Home'>;

type MainTab = 'home' | 'properties' | 'add' | 'tasks' | 'profile';
type HomeMode = 'selling' | 'buying';

export function HomeScreen(_props: Props) {
  const [mode, setMode] = useState<HomeMode>('selling');
  const [mainTab, setMainTab] = useState<MainTab>('home');

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeTop} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={styles.headerIconBtn}
              onPress={() => {}}
            >
              <Ionicons name="notifications-outline" size={22} color={brand.charcoal} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Messages"
              style={styles.headerIconBtn}
              onPress={() => {}}
            >
              <Ionicons name="chatbubble-outline" size={21} color={brand.charcoal} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.segmentWrap}>
            <Pressable
              onPress={() => setMode('selling')}
              style={[styles.segmentItem, mode === 'selling' && styles.segmentItemActive]}
            >
              <Text style={[styles.segmentText, mode === 'selling' && styles.segmentTextActive]}>
                Selling
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('buying')}
              style={[styles.segmentItem, mode === 'buying' && styles.segmentItemActive]}
            >
              <Text style={[styles.segmentText, mode === 'buying' && styles.segmentTextActive]}>
                Buying
              </Text>
            </Pressable>
          </View>

          <AlertRow
            icon="flash-outline"
            label="3 new enquiries"
            onPress={() => {}}
          />
          <AlertRow
            icon="star-outline"
            label="2 transactions awaiting review"
            onPress={() => {}}
          />

          <View style={styles.publishCard}>
            <View style={styles.publishTextCol}>
              <Text style={styles.publishKicker}>NEW LISTING</Text>
              <Text style={styles.publishTitle}>Publish a property</Text>
              <Text style={styles.publishSub}>
                Auto-fill from PriceFinder — SOI in 5 steps
              </Text>
            </View>
            <Pressable style={styles.publishFab} accessibilityLabel="Create listing">
              <Ionicons name="add" size={28} color={brand.charcoal} />
            </Pressable>
          </View>

          <SectionHeader title="Latest Enquiries" onSeeAll={() => {}} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.enquiryRow}
          >
            <EnquiryCard name="John Doe" time="2H AGO" address="12 Walsh St, Hawthorn" tag="RE: Hawthorn City Center" />
            <EnquiryCard name="Sarah Chen" time="5H AGO" address="88 Auburn Rd" tag="RE: Auburn Residence" />
            <EnquiryCard name="Alex Moore" time="1D AGO" address="3 Kooyong Rd" tag="RE: South Yarra" />
          </ScrollView>

          <SectionHeader title="Your Active Listings" onSeeAll={() => {}} />
          <ListingCard
            status="ACTIVE"
            authLabel="AUTH 14D LEFT"
            title="Hawthorn City Center"
            price="$2.0M – $2.2M"
            specs="4 BED · 3 BATH · 650m²"
            views="128"
            leads="6"
            footerLabel="ATTACHED SOI"
          />
          <ListingCard
            status="SOI PENDING"
            authLabel="AUTH 6D LEFT"
            title="Auburn Residence"
            price="$1.45M – $1.55M"
            specs="3 BED · 2 BATH · 420m²"
            views="84"
            leads="4"
            footerLabel="ATTACHED SOI"
          />

          <SectionHeader title="Authority Expiring Soon" onSeeAll={() => {}} />
          <AuthorityRow name="Kooyong Family Home" sub="14 Kooyong Rd" badge="6D LEFT" />
          <AuthorityRow name="Brighton Waterfront" sub="2 Esplanade" badge="9D LEFT" />

          <SectionHeader title="New Buyer Matches" onSeeAll={() => {}} />
          <BuyerMatchRow area="Boroondara" criteria="4 bed family · $1.8M – $2.3M" />
          <BuyerMatchRow area="Stonnington" criteria="3 bed · courtyard · $1.2M – $1.6M" />

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.tabSafe}>
        <View style={styles.tabBar}>
          <TabItem
            icon="home"
            active={mainTab === 'home'}
            onPress={() => setMainTab('home')}
          />
          <TabItem
            icon="document-text-outline"
            active={mainTab === 'properties'}
            onPress={() => setMainTab('properties')}
          />
          <TabItem icon="add" active={mainTab === 'add'} large onPress={() => setMainTab('add')} />
          <TabItem
            icon="list-outline"
            active={mainTab === 'tasks'}
            onPress={() => setMainTab('tasks')}
          />
          <TabItem
            icon="person-outline"
            active={mainTab === 'profile'}
            onPress={() => setMainTab('profile')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function AlertRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.alertCard}>
      <Ionicons name={icon} size={20} color={brand.sage} />
      <Text style={styles.alertText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={brand.sage} />
    </Pressable>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onSeeAll} hitSlop={8}>
        <Text style={styles.seeAll}>See all</Text>
      </Pressable>
    </View>
  );
}

function EnquiryCard({
  name,
  time,
  address,
  tag,
}: {
  name: string;
  time: string;
  address: string;
  tag: string;
}) {
  return (
    <View style={styles.enquiryCard}>
      <Text style={styles.enquiryName}>{name}</Text>
      <Text style={styles.enquiryTime}>{time}</Text>
      <Text style={styles.enquiryAddr} numberOfLines={2}>
        {address}
      </Text>
      <View style={styles.enquiryTag}>
        <Text style={styles.enquiryTagText} numberOfLines={1}>
          {tag}
        </Text>
      </View>
    </View>
  );
}

function ListingCard({
  status,
  authLabel,
  title,
  price,
  specs,
  views,
  leads,
  footerLabel,
}: {
  status: string;
  authLabel: string;
  title: string;
  price: string;
  specs: string;
  views: string;
  leads: string;
  footerLabel: string;
}) {
  return (
    <View style={styles.listingCard}>
      <View style={styles.listingImage}>
        <View style={styles.listingImageInner} />
        <View style={styles.listingBadges}>
          <View style={[styles.badge, styles.badgeSage]}>
            <Text style={styles.badgeTextLight}>{status}</Text>
          </View>
          <View style={[styles.badge, styles.badgeDark]}>
            <Text style={styles.badgeTextLight}>{authLabel}</Text>
          </View>
        </View>
      </View>
      <View style={styles.listingBody}>
        <Text style={styles.listingTitle}>{title}</Text>
        <Text style={styles.listingPrice}>{price}</Text>
        <Text style={styles.listingSpecs}>{specs}</Text>
        <View style={styles.listingMetrics}>
          <Text style={styles.metric}>
            Views <Text style={styles.metricVal}>{views}</Text>
          </Text>
          <Text style={styles.metric}>
            Leads <Text style={styles.metricVal}>{leads}</Text>
          </Text>
          <Text style={styles.metricStatus}>{footerLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function AuthorityRow({ name, sub, badge }: { name: string; sub: string; badge: string }) {
  return (
    <View style={styles.authRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.authName}>{name}</Text>
        <Text style={styles.authSub}>{sub}</Text>
      </View>
      <View style={styles.authPill}>
        <Text style={styles.authPillText}>{badge}</Text>
      </View>
    </View>
  );
}

function BuyerMatchRow({ area, criteria }: { area: string; criteria: string }) {
  return (
    <Pressable style={styles.buyerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.buyerArea}>{area}</Text>
        <Text style={styles.buyerCrit}>{criteria}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={brand.sage} />
    </Pressable>
  );
}

function TabItem({
  icon,
  active,
  large,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  large?: boolean;
  onPress: () => void;
}) {
  const iconColor = large
    ? brand.warmWhite
    : active
      ? brand.warmWhite
      : brand.charcoal;
  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <View
        style={[
          styles.tabIconWrap,
          active && !large && styles.tabIconWrapActive,
          large && styles.tabIconWrapLarge,
        ]}
      >
        <Ionicons name={icon} size={large ? 26 : 22} color={iconColor} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.warmWhite },
  safeTop: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: brand.space.sm,
    paddingBottom: brand.space.xs,
  },
  headerTitle: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.title,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: brand.space.xs },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: brand.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: brand.space.sm,
    paddingTop: brand.space.xs,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: brand.cream,
    borderRadius: brand.radius.md,
    padding: 4,
    marginBottom: brand.space.sm,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: brand.radius.sm,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: brand.white,
    shadowColor: brand.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.body,
    fontWeight: brand.type.weightMedium,
    color: brand.sage,
  },
  segmentTextActive: {
    color: brand.charcoal,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: brand.space.sm,
    backgroundColor: brand.white,
    borderRadius: brand.radius.md,
    padding: brand.space.sm,
    marginBottom: brand.space.xs,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.25)',
  },
  alertText: {
    flex: 1,
    fontFamily: brand.fontSans,
    fontSize: brand.type.body,
    fontWeight: brand.type.weightRegular,
    color: brand.charcoal,
  },
  publishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.charcoal,
    borderRadius: brand.radius.md,
    padding: brand.space.md,
    marginTop: brand.space.xs,
    marginBottom: brand.space.md,
  },
  publishTextCol: { flex: 1, paddingRight: brand.space.sm },
  publishKicker: {
    fontFamily: brand.fontSans,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: brand.type.weightMedium,
    color: 'rgba(254,253,251,0.65)',
    marginBottom: 6,
  },
  publishTitle: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.subtitle,
    fontWeight: brand.type.weightMedium,
    color: brand.warmWhite,
    marginBottom: 6,
  },
  publishSub: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    fontWeight: brand.type.weightRegular,
    color: 'rgba(254,253,251,0.75)',
    lineHeight: 20,
  },
  publishFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: brand.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: brand.space.md,
    marginBottom: brand.space.sm,
  },
  sectionTitle: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.body,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  seeAll: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    fontWeight: brand.type.weightMedium,
    color: brand.terracotta,
  },
  enquiryRow: {
    gap: brand.space.xs,
    paddingBottom: brand.space.sm,
  },
  enquiryCard: {
    width: 168,
    backgroundColor: brand.white,
    borderRadius: brand.radius.md,
    padding: brand.space.sm,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.2)',
  },
  enquiryName: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  enquiryTime: {
    fontFamily: brand.fontSans,
    fontSize: 11,
    fontWeight: brand.type.weightRegular,
    color: brand.sage,
    marginTop: 2,
    marginBottom: 6,
  },
  enquiryAddr: {
    fontFamily: brand.fontSans,
    fontSize: 12,
    fontWeight: brand.type.weightRegular,
    color: brand.charcoal,
    lineHeight: 16,
    marginBottom: 8,
  },
  enquiryTag: {
    backgroundColor: brand.cream,
    borderRadius: brand.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  enquiryTagText: {
    fontFamily: brand.fontSans,
    fontSize: 11,
    color: brand.sage,
    fontWeight: brand.type.weightRegular,
  },
  listingCard: {
    backgroundColor: brand.white,
    borderRadius: brand.radius.md,
    marginBottom: brand.space.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.2)',
  },
  listingImage: {
    height: 176,
    backgroundColor: brand.cream,
    position: 'relative',
  },
  listingImageInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e8e6e2',
  },
  listingBadges: {
    position: 'absolute',
    top: brand.space.xs,
    left: brand.space.xs,
    right: brand.space.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: brand.radius.sm,
  },
  badgeSage: { backgroundColor: brand.sage },
  badgeDark: { backgroundColor: brand.charcoal },
  badgeTextLight: {
    fontFamily: brand.fontSans,
    fontSize: 10,
    letterSpacing: 0.6,
    fontWeight: brand.type.weightMedium,
    color: brand.warmWhite,
  },
  listingBody: { padding: brand.space.sm },
  listingTitle: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.body,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  listingPrice: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    fontWeight: brand.type.weightRegular,
    color: brand.charcoal,
    marginTop: 4,
  },
  listingSpecs: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    fontWeight: brand.type.weightRegular,
    color: brand.sage,
    marginTop: 6,
  },
  listingMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: brand.space.sm,
    paddingTop: brand.space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(138,155,142,0.35)',
    gap: brand.space.sm,
    flexWrap: 'wrap',
  },
  metric: {
    fontFamily: brand.fontSans,
    fontSize: 12,
    color: brand.sage,
    fontWeight: brand.type.weightRegular,
  },
  metricVal: {
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  metricStatus: {
    fontFamily: brand.fontSans,
    fontSize: 11,
    letterSpacing: 0.5,
    fontWeight: brand.type.weightMedium,
    color: brand.sage,
  },
  authRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: brand.space.sm,
    paddingHorizontal: brand.space.sm,
    backgroundColor: brand.white,
    borderRadius: brand.radius.md,
    marginBottom: brand.space.xs,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.2)',
  },
  authName: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.body,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  authSub: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.sage,
    marginTop: 2,
  },
  authPill: {
    backgroundColor: brand.charcoal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: brand.radius.pill,
  },
  authPillText: {
    fontFamily: brand.fontSans,
    fontSize: 11,
    fontWeight: brand.type.weightMedium,
    color: brand.warmWhite,
    letterSpacing: 0.3,
  },
  buyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: brand.space.sm,
    backgroundColor: brand.white,
    borderRadius: brand.radius.md,
    marginBottom: brand.space.xs,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.2)',
  },
  buyerArea: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.body,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  buyerCrit: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.sage,
    marginTop: 4,
  },
  tabSafe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    marginHorizontal: brand.space.sm,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: brand.white,
    borderRadius: brand.radius.xl,
    paddingVertical: 10,
    paddingHorizontal: 4,
    shadowColor: brand.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.15)',
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', minWidth: 48 },
  tabIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: brand.charcoal,
  },
  tabIconWrapLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: brand.terracotta,
  },
});
