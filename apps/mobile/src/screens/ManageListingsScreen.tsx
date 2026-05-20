import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { images } from '../constants/images';
import { brand } from '../theme/brand';

/** Manage Listings reference screen - palette aligned to design mock */
const ml = {
  screenBg: '#F9F7F2',
  cardMuted: '#F1F1F1',
  terracotta: '#C1876B',
  specWell: '#EBEBEB',
  tabTrack: '#E8E6E3',
  mutedText: '#6B6B6B',
  inactiveTab: '#8E8E8E',
};

type Props = RootStackScreenProps<'ManageListings'>;

type ListingTab = 'live' | 'underContract' | 'draft';

type ManagedListing = {
  id: string;
  tab: ListingTab;
  image: (typeof images)[keyof typeof images];
  title: string;
  price: string;
  beds: number;
  baths: number;
  cars: number;
  liveLabel?: string;
  authorityLabel?: string;
};

const MOCK_LISTINGS: ManagedListing[] = [
  {
    id: 'hawthorn',
    tab: 'live',
    image: images.propertyHouse1,
    title: 'Hawthorn City Center',
    price: '$21,000,000',
    beds: 3,
    baths: 3,
    cars: 2,
    liveLabel: 'LIVE',
    authorityLabel: 'Authority expires in 14 days',
  },
  {
    id: 'auburn',
    tab: 'underContract',
    image: images.propertyHouse2,
    title: 'Auburn Residence',
    price: '$1,550,000',
    beds: 3,
    baths: 2,
    cars: 1,
    liveLabel: 'UNDER CONTRACT',
    authorityLabel: 'Settlement in 21 days',
  },
];

const TABS: { key: ListingTab; label: string }[] = [
  { key: 'live', label: 'Live' },
  { key: 'underContract', label: 'Under contract' },
  { key: 'draft', label: 'Draft' },
];

export function ManageListingsScreen({ navigation }: Props) {
  const [tab, setTab] = useState<ListingTab>('live');

  const visible = useMemo(() => MOCK_LISTINGS.filter((l) => l.tab === tab), [tab]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeTop} edges={['top']}>
        <Text style={styles.pageTitle}>Manage listings</Text>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.buyerCard}>
            <Text style={styles.buyerCardTitle}>6 Active Buyer Matches</Text>
            <Text style={styles.buyerCardBody}>
              Qualified buyers are currently searching for properties like yours. Connect
              instantly and move deals forward.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.buyerCta, pressed && { opacity: 0.92 }]}
              onPress={() => navigation.navigate('BuyerBriefs')}
            >
              <Text style={styles.buyerCtaLabel}>View Buyer Leads</Text>
            </Pressable>
          </View>

          <View style={styles.tabRow}>
            {TABS.map(({ key, label }) => {
              const active = tab === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setTab(key)}
                  style={[styles.tabPill, active && styles.tabPillActive]}
                >
                  <Text style={[styles.tabPillText, active && styles.tabPillTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {visible.length === 0 ? (
            <Text style={styles.empty}>
              {tab === 'draft'
                ? 'No drafts yet. Start a listing to save it here.'
                : 'No listings in this view.'}
            </Text>
          ) : (
            visible.map((listing) => (
              <View key={listing.id} style={styles.listingCard}>
                <View style={styles.listingImageWrap}>
                  <Image source={listing.image} style={styles.listingImage} resizeMode="cover" />
                  <View style={styles.listingBadges} pointerEvents="box-none">
                    {listing.liveLabel ? (
                      <View style={styles.badgeLive}>
                        <Text style={styles.badgeLiveText}>{listing.liveLabel}</Text>
                      </View>
                    ) : null}
                    {listing.authorityLabel ? (
                      <View style={styles.badgeAuthority}>
                        <Text style={styles.badgeAuthorityText} numberOfLines={2}>
                          {listing.authorityLabel}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <View style={styles.listingBody}>
                  <View style={styles.specsRow}>
                    <View style={styles.specItem}>
                      <View style={styles.specIconWell}>
                        <Ionicons name="bed-outline" size={18} color={brand.charcoal} />
                      </View>
                      <Text style={styles.specText}>{listing.beds} Bedrooms</Text>
                    </View>
                    <View style={styles.specItem}>
                      <View style={styles.specIconWell}>
                        <Ionicons name="water-outline" size={18} color={brand.charcoal} />
                      </View>
                      <Text style={styles.specText}>{listing.baths} Bathrooms</Text>
                    </View>
                    <View style={styles.specItem}>
                      <View style={styles.specIconWell}>
                        <Ionicons name="car-outline" size={18} color={brand.charcoal} />
                      </View>
                      <Text style={styles.specText}>{listing.cars} Car Spaces</Text>
                    </View>
                  </View>
                  <Text style={styles.listingTitle}>{listing.title}</Text>
                  <Text style={styles.listingPrice}>{listing.price}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.manageCta, pressed && { opacity: 0.92 }]}
                  onPress={() =>
                    navigation.navigate('PropertyPreview', {
                      listingId:
                        listing.id === 'hawthorn' ? 'listing-hawthorn' : 'listing-auburn',
                    })
                  }
                >
                  <Text style={styles.manageCtaLabel}>MANAGE LISTING</Text>
                </Pressable>
              </View>
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.tabSafe}>
        <View style={styles.tabBar}>
          <TabItem
            icon="home-outline"
            active={false}
            onPress={() => navigation.navigate('Home', { mode: 'selling' })}
          />
          <TabItem
            icon="bar-chart-outline"
            active={false}
            onPress={() => navigation.navigate('Activities')}
          />
          <TabItem icon="add-outline" large onPress={() => {}} />
          <TabItem icon="list" active onPress={() => {}} />
          <TabItem icon="person" active={false} onPress={() => {}} />
        </View>
      </SafeAreaView>
    </View>
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
  const iconColor = large ? brand.charcoal : active ? brand.warmWhite : brand.charcoal;
  return (
    <Pressable onPress={onPress} style={styles.navTabItem}>
      <View
        style={[
          styles.navTabIconWrap,
          active && !large && styles.navTabIconWrapActive,
          large && styles.navTabIconWrapLarge,
        ]}
      >
        <Ionicons name={icon} size={large ? 28 : 22} color={iconColor} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ml.screenBg },
  safeTop: { flex: 1, paddingHorizontal: brand.space.sm },
  pageTitle: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.title,
    fontWeight: '700',
    color: brand.charcoal,
    letterSpacing: -0.4,
    marginBottom: brand.space.md,
    marginTop: 4,
  },
  scroll: {
    paddingTop: 0,
    paddingBottom: 8,
  },
  buyerCard: {
    backgroundColor: ml.cardMuted,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  buyerCardTitle: {
    fontFamily: brand.fontSans,
    fontSize: 18,
    fontWeight: '700',
    color: brand.charcoal,
    marginBottom: 10,
  },
  buyerCardBody: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    lineHeight: 21,
    color: ml.mutedText,
    marginBottom: 18,
  },
  buyerCta: {
    alignSelf: 'center',
    backgroundColor: ml.terracotta,
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buyerCtaLabel: {
    fontFamily: brand.fontSans,
    fontSize: 15,
    fontWeight: '600',
    color: brand.white,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: ml.tabTrack,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 2,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: brand.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  tabPillText: {
    fontFamily: brand.fontSans,
    fontSize: 13,
    fontWeight: '500',
    color: ml.inactiveTab,
    textAlign: 'center',
  },
  tabPillTextActive: {
    color: brand.charcoal,
    fontWeight: '700',
  },
  empty: {
    fontFamily: brand.fontSans,
    fontSize: 15,
    color: brand.sage,
    marginTop: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  listingCard: {
    backgroundColor: brand.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(26,26,26,0.06)',
    shadowColor: brand.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  listingImageWrap: {
    height: 232,
    backgroundColor: ml.cardMuted,
    position: 'relative',
  },
  listingImage: { ...StyleSheet.absoluteFillObject },
  listingBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  listingBadges: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  badgeLive: {
    backgroundColor: ml.terracotta,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    maxWidth: '46%',
  },
  badgeLiveText: {
    fontFamily: brand.fontSans,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: brand.white,
  },
  badgeAuthority: {
    backgroundColor: ml.terracotta,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: '52%',
  },
  badgeAuthorityText: {
    fontFamily: brand.fontSans,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 13,
    color: brand.white,
    textAlign: 'right',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingRight: 4,
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  specIconWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ml.specWell,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specText: {
    fontFamily: brand.fontSans,
    fontSize: 12,
    color: brand.charcoal,
    fontWeight: '500',
    textAlign: 'center',
  },
  listingTitle: {
    fontFamily: brand.fontSans,
    fontSize: 17,
    fontWeight: '700',
    color: brand.charcoal,
    marginTop: 2,
  },
  listingPrice: {
    fontFamily: brand.fontSans,
    fontSize: 16,
    fontWeight: '400',
    color: brand.charcoal,
    marginTop: 6,
  },
  manageCta: {
    backgroundColor: ml.terracotta,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageCtaLabel: {
    fontFamily: brand.fontSans,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.85,
    color: brand.white,
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
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: brand.white,
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(26,26,26,0.06)',
  },
  navTabItem: { alignItems: 'center', justifyContent: 'center', minWidth: 48 },
  navTabIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabIconWrapActive: {
    backgroundColor: brand.charcoal,
  },
  navTabIconWrapLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
});
