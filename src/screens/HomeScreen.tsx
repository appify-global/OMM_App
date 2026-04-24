import React, { useEffect, useRef, useState } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList, RootStackScreenProps } from '../navigation/types';
import { images } from '../constants/images';
import { brand } from '../theme/brand';

type Props = RootStackScreenProps<'Home'>;

type MainTab = 'home' | 'properties' | 'add' | 'tasks' | 'profile';
type HomeMode = 'selling' | 'buying';

export function HomeScreen({ navigation }: Props) {
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>();
  const [mode, setMode] = useState<HomeMode>('selling');
  const [mainTab, setMainTab] = useState<MainTab>('home');
  const [buyingSearch, setBuyingSearch] = useState('Hawthorn');
  const buyingSearchInputRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    const m = route.params?.mode;
    if (m === 'selling' || m === 'buying') setMode(m);
  }, [route.params?.mode]);

  useEffect(() => {
    if (route.params?.focusSearch !== true) return;
    setMode('buying');
    const t = setTimeout(() => {
      buyingSearchInputRef.current?.focus();
      navigation.setParams({ focusSearch: undefined });
    }, 250);
    return () => clearTimeout(t);
  }, [route.params?.focusSearch, navigation]);

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
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color={brand.charcoal} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Messages"
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('Messages')}
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

          {mode === 'selling' ? (
            <SellingHomeContent navigation={navigation} />
          ) : (
            <BuyingHomeContent
              navigation={navigation}
              search={buyingSearch}
              onSearch={setBuyingSearch}
              searchInputRef={buyingSearchInputRef}
            />
          )}

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

function SellingHomeContent({
  navigation,
}: {
  navigation: RootStackScreenProps<'Home'>['navigation'];
}) {
  return (
    <>
      <AlertRow icon="flash-outline" label="3 new enquiries" onPress={() => {}} />
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
        <EnquiryCard
          image={images.propertyHouse1}
          name="John Doe"
          time="2H AGO"
          address="12 Walsh St, Hawthorn"
          tag="RE: Hawthorn City Center"
        />
        <EnquiryCard
          image={images.propertyHouse2}
          name="Sarah Chen"
          time="5H AGO"
          address="88 Auburn Rd"
          tag="RE: Auburn Residence"
        />
        <EnquiryCard
          image={images.propertyHouse3}
          name="Alex Moore"
          time="1D AGO"
          address="3 Kooyong Rd"
          tag="RE: South Yarra"
        />
      </ScrollView>

      <SectionHeader
        title="Your Active Listings"
        onSeeAll={() => navigation.navigate('ListingSeeAll', { context: 'selling' })}
      />
      <ListingCard
        image={images.propertyHouse1}
        status="ACTIVE"
        authLabel="AUTH 14D LEFT"
        title="Hawthorn City Center"
        price="$2.0M – $2.2M"
        specs="4 BED    3 BATH    650M²"
        views="128"
        leads="6"
        soiHeadline="Attached"
        soiSub="SOI"
      />
      <ListingCard
        image={images.propertyHouse2}
        status="SOI PENDING"
        authLabel="AUTH 6D LEFT"
        title="Auburn Residence"
        price="$1.45M – $1.55M"
        specs="3 BED    2 BATH    420M²"
        views="84"
        leads="4"
        soiHeadline="Pending"
        soiSub="SOI"
      />

      <SectionHeader
        title="Authority Expiring Soon"
        onSeeAll={() => navigation.navigate('AuthorityExpiring')}
      />
      <AuthorityRow name="Kooyong Family Home" sub="14 Kooyong Rd" badge="6D LEFT" />
      <AuthorityRow name="Brighton Waterfront" sub="2 Esplanade" badge="9D LEFT" />

      <SectionHeader
        title="New Buyer Matches"
        onSeeAll={() => navigation.navigate('BuyerBriefs')}
      />
      <BuyerMatchRow area="Boroondara" criteria="4 bed family · $1.8M – $2.3M" />
      <BuyerMatchRow area="Stonnington" criteria="3 bed · courtyard · $1.2M – $1.6M" />
    </>
  );
}

function BuyingHomeContent({
  navigation,
  search,
  onSearch,
  searchInputRef,
}: {
  navigation: RootStackScreenProps<'Home'>['navigation'];
  search: string;
  onSearch: (t: string) => void;
  searchInputRef: React.RefObject<React.ComponentRef<typeof TextInput> | null>;
}) {
  return (
    <>
      <AlertRow icon="flash-outline" label="2 new agent replies" onPress={() => navigation.navigate('Messages')} />
      <AlertRow
        icon="star-outline"
        label="1 transaction awaiting review"
        onPress={() => {}}
      />

      <View style={styles.buyingSearchRow}>
        <View style={styles.buyingSearchField}>
          <Ionicons name="search" size={18} color={brand.sage} style={styles.buyingSearchIcon} />
          <TextInput
            ref={searchInputRef}
            value={search}
            onChangeText={onSearch}
            placeholder="Suburb or area"
            placeholderTextColor={brand.sage}
            style={styles.buyingSearchInput}
            autoCorrect={false}
          />
        </View>
        <Pressable
          style={styles.buyingExploreBtn}
          accessibilityLabel="Explore"
          onPress={() =>
            navigation.navigate('BuyingSearch', {
              query: search.trim() || 'Hawthorn',
            })
          }
        >
          <Text style={styles.buyingExploreLabel}>EXPLORE</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.buyerBriefCard}
        onPress={() => navigation.navigate('PostBuyerBrief')}
        accessibilityRole="button"
        accessibilityLabel="Post a buyer brief"
      >
        <View style={styles.buyerBriefTextCol}>
          <Text style={styles.buyerBriefKicker}>BUYER BRIEF</Text>
          <Text style={styles.buyerBriefTitle}>Post a buyer brief</Text>
          <Text style={styles.buyerBriefSub}>Match listing agents within 24 hours</Text>
        </View>
        <View style={styles.buyerBriefFab}>
          <Ionicons name="add" size={28} color={brand.charcoal} />
        </View>
      </Pressable>

      <SectionHeader
        title="Recent agent replies"
        onSeeAll={() => navigation.navigate('Messages')}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.agentRepliesRow}
      >
        <View style={styles.agentReplyCard}>
          <Text style={styles.agentReplyName}>Sarah Lin</Text>
          <Text style={styles.agentReplyAgency}>Jellis Craig</Text>
          <Text style={styles.agentReplySnippet} numberOfLines={3}>
            Yes, off-market in Camberwell available next month — I can share floorplan if
            you&apos;re ready to brief your vendor.
          </Text>
        </View>
        <View style={styles.agentReplyCard}>
          <Text style={styles.agentReplyName}>Tom Reid</Text>
          <Text style={styles.agentReplyAgency}>Marshall White</Text>
          <Text style={styles.agentReplySnippet} numberOfLines={3}>
            I have two pre-matched listings that align with your brief — want a call this
            week?
          </Text>
        </View>
      </ScrollView>

      <SectionHeader
        title="Saved searches"
        onSeeAll={() => navigation.navigate('SavedSearches')}
      />
      <View style={styles.savedSearchStack}>
        <View style={styles.savedSearchCard}>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>8 NEW</Text>
          </View>
          <Text style={styles.savedSearchTitle}>Boroondara, VIC</Text>
          <Text style={styles.savedSearchLine}>4+ beds · House · $1.8M–2.4M</Text>
          <Text style={styles.savedSearchAlerts}>
            <Text style={styles.savedSearchDot}>●</Text> DAILY ALERTS ON
          </Text>
        </View>
        <View style={styles.savedSearchCard}>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>5 NEW</Text>
          </View>
          <Text style={styles.savedSearchTitle}>Brighton & Brighton East</Text>
          <Text style={styles.savedSearchLine}>3+ beds · Townhouse · $5M+</Text>
          <Text style={styles.savedSearchAlerts}>
            <Text style={styles.savedSearchDot}>●</Text> DAILY ALERTS ON
          </Text>
        </View>
      </View>

      <SectionHeader
        title="Off-market matches"
        onSeeAll={() => navigation.navigate('ListingSeeAll', { context: 'buying' })}
      />
      <OffMarketCard
        image={images.propertyHouse1}
        matchPct="92%"
        title="Camberwell Family Home"
        price="$2.1M – $2.3M"
        specs="4 BED  3 BATH  720M²"
      />
      <OffMarketCard
        image={images.propertyHouse2}
        matchPct="88%"
        title="Hawthorn Victorian"
        price="$1.6M – $1.8M"
        specs="3 BED  2 BATH  480M²"
      />
    </>
  );
}

function OffMarketCard({
  image,
  matchPct,
  title,
  price,
  specs,
}: {
  image: (typeof images)[keyof typeof images];
  matchPct: string;
  title: string;
  price: string;
  specs: string;
}) {
  return (
    <View style={styles.offMarketCard}>
      <View style={styles.offMarketImage}>
        <Image source={image} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <View style={styles.offMarketBadgeLeft}>
          <Text style={styles.offMarketBadgeLeftText}>OFF-MARKET</Text>
        </View>
        <View style={styles.offMarketBadgeRight}>
          <Text style={styles.offMarketBadgeRightText}>{matchPct} MATCH</Text>
        </View>
      </View>
      <View style={styles.offMarketBody}>
        <Text style={styles.offMarketTitle}>{title}</Text>
        <Text style={styles.offMarketPrice}>{price}</Text>
        <Text style={styles.offMarketSpecs}>{specs}</Text>
      </View>
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
  image,
  name,
  time,
  address,
  tag,
}: {
  image: (typeof images)[keyof typeof images];
  name: string;
  time: string;
  address: string;
  tag: string;
}) {
  return (
    <View style={styles.enquiryCard}>
      <View style={styles.enquiryImageFrame}>
        <Image source={image} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      </View>
      <View style={styles.enquiryCol}>
        <View style={styles.enquiryTextBlock}>
          <Text style={styles.enquiryName}>{name}</Text>
          <Text style={styles.enquiryTime}>{time}</Text>
          <Text style={styles.enquiryAddr} numberOfLines={2}>
            {address}
          </Text>
        </View>
        <View style={styles.enquiryTag}>
          <Text style={styles.enquiryTagText} numberOfLines={1}>
            {tag}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ListingCard({
  image,
  status,
  authLabel,
  title,
  price,
  specs,
  views,
  leads,
  soiHeadline,
  soiSub,
}: {
  image: (typeof images)[keyof typeof images];
  status: string;
  authLabel: string;
  title: string;
  price: string;
  specs: string;
  views: string;
  leads: string;
  soiHeadline: string;
  soiSub: string;
}) {
  return (
    <View style={styles.listingCard}>
      <View style={styles.listingImage}>
        <Image source={image} style={styles.listingImageInner} resizeMode="cover" />
        <View style={styles.listingBadges} pointerEvents="box-none">
          <View style={[styles.badge, styles.badgeStatusPill]}>
            <Text style={styles.badgeTextLight}>{status}</Text>
          </View>
          <View style={[styles.badge, styles.badgeAuthPill]}>
            <Text style={styles.badgeTextAuthPill}>{authLabel}</Text>
          </View>
        </View>
      </View>
      <View style={styles.listingBody}>
        <Text style={styles.listingTitle}>{title}</Text>
        <Text style={styles.listingPrice}>{price}</Text>
        <Text style={styles.listingSpecs}>{specs}</Text>
      </View>
      <View style={styles.listingFooter}>
        <View style={styles.listingFooterCol}>
          <Text style={styles.listingFooterVal}>{views}</Text>
          <Text style={styles.listingFooterLabel}>VIEWS (7D)</Text>
        </View>
        <View style={styles.listingFooterCol}>
          <Text style={styles.listingFooterVal}>{leads}</Text>
          <Text style={styles.listingFooterLabel}>LEADS</Text>
        </View>
        <View style={styles.listingFooterCol}>
          <Text style={styles.listingFooterValSoi} numberOfLines={1}>
            {soiHeadline}
          </Text>
          <Text style={styles.listingFooterLabel}>{soiSub}</Text>
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
    gap: brand.space.sm,
    paddingBottom: brand.space.sm,
  },
  enquiryCard: {
    width: 216,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: brand.white,
    borderRadius: brand.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.22)',
    gap: 12,
  },
  enquiryImageFrame: {
    width: 64,
    height: 80,
    borderRadius: brand.radius.md,
    overflow: 'hidden',
    backgroundColor: brand.cream,
  },
  enquiryCol: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
  },
  enquiryTextBlock: {
    flexShrink: 1,
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
    marginTop: 3,
  },
  enquiryAddr: {
    fontFamily: brand.fontSans,
    fontSize: 12,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
    lineHeight: 16,
    marginTop: 4,
  },
  enquiryTag: {
    marginTop: 10,
    alignSelf: 'stretch',
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
    borderRadius: brand.radius.lg,
    marginBottom: brand.space.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.2)',
    shadowColor: brand.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  listingImage: {
    height: 192,
    backgroundColor: brand.cream,
    position: 'relative',
    overflow: 'hidden',
  },
  listingImageInner: { ...StyleSheet.absoluteFillObject },
  listingBadges: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: brand.radius.pill,
    maxWidth: '48%',
  },
  badgeStatusPill: { backgroundColor: brand.charcoal },
  badgeAuthPill: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  badgeTextLight: {
    fontFamily: brand.fontSans,
    fontSize: 10,
    letterSpacing: 0.5,
    fontWeight: '600',
    color: brand.warmWhite,
  },
  badgeTextAuthPill: {
    fontFamily: brand.fontSans,
    fontSize: 9,
    letterSpacing: 0.4,
    fontWeight: '600',
    color: brand.charcoal,
  },
  listingBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: brand.white,
  },
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
    color: brand.sage,
    marginTop: 6,
  },
  listingSpecs: {
    fontFamily: brand.fontSans,
    fontSize: 12,
    fontWeight: brand.type.weightRegular,
    color: brand.sage,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  listingFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f2efe9',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  listingFooterCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  listingFooterVal: {
    fontFamily: brand.fontSans,
    fontSize: 20,
    fontWeight: '600',
    color: brand.charcoal,
  },
  listingFooterValSoi: {
    fontFamily: brand.fontSans,
    fontSize: 16,
    fontWeight: '600',
    color: brand.charcoal,
  },
  listingFooterLabel: {
    fontFamily: brand.fontSans,
    fontSize: 10,
    color: brand.sage,
    marginTop: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
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
  buyingSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: brand.space.sm,
  },
  buyingSearchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.cream,
    borderRadius: brand.radius.md,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  buyingSearchIcon: { marginRight: 8 },
  buyingSearchInput: {
    flex: 1,
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.charcoal,
    paddingVertical: 10,
  },
  buyingExploreBtn: {
    backgroundColor: brand.charcoal,
    paddingHorizontal: 18,
    borderRadius: brand.radius.sm,
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  buyingExploreLabel: {
    fontFamily: brand.fontSans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: brand.warmWhite,
  },
  buyerBriefCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.charcoal,
    borderRadius: 14,
    padding: brand.space.md,
    marginTop: 4,
    marginBottom: brand.space.md,
  },
  buyerBriefTextCol: { flex: 1, paddingRight: 12 },
  buyerBriefKicker: {
    fontFamily: brand.fontSans,
    fontSize: 10,
    letterSpacing: 1.1,
    fontWeight: '600',
    color: 'rgba(254,253,251,0.65)',
    marginBottom: 4,
  },
  buyerBriefTitle: {
    fontFamily: brand.fontSans,
    fontSize: 20,
    fontWeight: '600',
    color: brand.warmWhite,
    marginBottom: 6,
  },
  buyerBriefSub: {
    fontFamily: brand.fontSans,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(254,253,251,0.8)',
  },
  buyerBriefFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: brand.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentRepliesRow: { gap: 12, paddingBottom: brand.space.sm, paddingRight: 4 },
  agentReplyCard: {
    width: 280,
    backgroundColor: brand.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.2)',
  },
  agentReplyName: {
    fontFamily: brand.fontSans,
    fontSize: 16,
    fontWeight: '600',
    color: brand.charcoal,
  },
  agentReplyAgency: {
    fontFamily: brand.fontSans,
    fontSize: 13,
    color: brand.sage,
    marginTop: 2,
    marginBottom: 8,
  },
  agentReplySnippet: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    lineHeight: 21,
    color: brand.charcoal,
  },
  savedSearchStack: { gap: 10, marginBottom: 4 },
  savedSearchCard: {
    backgroundColor: brand.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.2)',
    padding: 16,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: brand.charcoal,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  newBadgeText: {
    fontFamily: brand.fontSans,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: brand.warmWhite,
  },
  savedSearchTitle: {
    fontFamily: brand.fontSans,
    fontSize: 16,
    fontWeight: '600',
    color: brand.charcoal,
    paddingRight: 72,
  },
  savedSearchLine: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    color: brand.sage,
    marginTop: 6,
  },
  savedSearchAlerts: {
    fontFamily: brand.fontSans,
    fontSize: 11,
    color: brand.sage,
    marginTop: 10,
    letterSpacing: 0.3,
  },
  savedSearchDot: { color: brand.charcoal, marginRight: 4 },
  offMarketCard: {
    backgroundColor: brand.white,
    borderRadius: 14,
    marginBottom: brand.space.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.2)',
  },
  offMarketImage: { height: 200, position: 'relative', backgroundColor: brand.cream, overflow: 'hidden' },
  offMarketBadgeLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: brand.charcoal,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  offMarketBadgeLeftText: {
    color: brand.warmWhite,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  offMarketBadgeRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  offMarketBadgeRightText: {
    color: brand.charcoal,
    fontSize: 10,
    fontWeight: '700',
  },
  offMarketBody: { padding: 16, backgroundColor: brand.white },
  offMarketTitle: { fontSize: 17, fontWeight: '600', color: brand.charcoal, fontFamily: brand.fontSans },
  offMarketPrice: {
    fontSize: 15,
    color: brand.sage,
    marginTop: 6,
    fontFamily: brand.fontSans,
  },
  offMarketSpecs: {
    fontSize: 12,
    color: brand.sage,
    textTransform: 'uppercase',
    marginTop: 6,
    letterSpacing: 0.3,
    fontFamily: brand.fontSans,
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
