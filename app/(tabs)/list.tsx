import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabScreenBottomPad } from '@/lib/useTabScreenBottomPad';

import { ManageListingSheet } from '@/components/ManageListingSheet';

import { DEMO_MANAGE_LISTING_HEADER, DEMO_PRIMARY_LISTING_TITLE } from '@/lib/melbourne-demo-locations';
import { PROPERTY_IMG_1 } from '@/lib/propertyImages';

/** Dashed card shell (same as listing flow) — kept local so this tab never imports `add/_shared`. */
const dashedShell = {
  borderWidth: 1.5,
  borderColor: 'rgba(0, 0, 0, 0.55)',
  borderStyle: 'dashed' as const,
  backgroundColor: '#fff',
};

type TabKey = 'live' | 'contract' | 'draft';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 20 },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: -0.6,
    marginBottom: 20,
  },
  buyerCard: {
    borderRadius: 14,
    padding: 20,
    marginBottom: 22,
    backgroundColor: '#fff',
  },
  buyerTitle: { fontSize: 17, fontFamily: 'Satoshi-Medium', color: '#000000', marginBottom: 10 },
  buyerBody: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)', lineHeight: 21, marginBottom: 18 },
  buyerCta: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyerCtaText: { color: '#fff', fontSize: 14, fontFamily: 'Satoshi-Medium' },
  segment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  segItem: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 11,
    minWidth: 0,
  },
  segItemOn: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segLabel: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)', textAlign: 'center' },
  segLabelOn: { color: '#000000' },
  listingCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  imgWrap: { height: 200, position: 'relative', backgroundColor: 'rgba(0,0,0,0.06)' },
  img: { width: '100%', height: '100%' },
  badgeLive: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeLiveText: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: '#fff', letterSpacing: 0.4 },
  badgeAuth: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: '58%',
  },
  badgeAuthText: { fontSize: 9, fontFamily: 'Satoshi-Medium', color: '#fff', letterSpacing: 0.2, lineHeight: 13 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
  },
  specItem: { flex: 1, alignItems: 'center', gap: 6 },
  specText: { fontSize: 11, fontFamily: 'Satoshi-Medium', color: '#000000', textAlign: 'center' },
  propTitle: { fontSize: 18, fontFamily: 'Satoshi-Medium', color: '#000000', paddingHorizontal: 16, marginTop: 18 },
  propPrice: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000', paddingHorizontal: 16, marginTop: 6 },
  manageBtn: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 16,
    backgroundColor: '#000000',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.35 },
  emptyTab: { paddingVertical: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontFamily: 'Satoshi-Medium', color: '#000000', marginBottom: 8 },
  emptySub: { fontSize: 14, color: 'rgba(0, 0, 0, 0.45)' },
});

/**
 * Manage listings — [Figma 1053:8853](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-8853&t=gEfFuYKIwBHVUzXh-4)
 */
export default function ManageListingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomPad = useTabScreenBottomPad();
  const [activeSegment, setActiveSegment] = useState<TabKey>('live');
  const [manageSheetOpen, setManageSheetOpen] = useState(false);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <ManageListingSheet
        visible={manageSheetOpen}
        onClose={() => setManageSheetOpen(false)}
        title={DEMO_MANAGE_LISTING_HEADER}
        subtitle="$2,450,000 • Live • Authority expires in 14 days • SOI 20 Apr"
        onMenuItemPress={(item) => {
          setManageSheetOpen(false);
          if (item === 'Edit listing details') router.push('/edit-listing' as Href);
          if (item === 'Update photos & floorplan') router.push('/photos-floorplan' as Href);
          if (item === 'View performance') router.push('/view-performance' as Href);
          if (item === 'Change status') router.push('/change-listing-status' as Href);
          if (item === 'Archive listing') router.push('/archive-listing' as Href);
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}>
        <Text style={styles.pageTitle}>Manage listings</Text>

        <View style={[styles.buyerCard, dashedShell]}>
          <Text style={styles.buyerTitle}>6 Active Buyer Matches</Text>
          <Text style={styles.buyerBody}>
            Qualified buyers are currently searching for properties like yours. Connect instantly and move deals forward.
          </Text>
          <Pressable
            style={styles.buyerCta}
            onPress={() => router.push('/potential-buyers' as Href)}
            accessibilityRole="button">
            <Text style={styles.buyerCtaText}>View Buyer Leads</Text>
          </Pressable>
        </View>

        <View style={styles.segment}>
          {(
            [
              { key: 'live' as const, label: 'Live' },
              { key: 'contract' as const, label: 'Under contract' },
              { key: 'draft' as const, label: 'Draft' },
            ] as const
          ).map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setActiveSegment(key)}
              style={[styles.segItem, activeSegment === key && styles.segItemOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: activeSegment === key }}>
              <Text style={[styles.segLabel, activeSegment === key && styles.segLabelOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {activeSegment === 'live' ? (
          <View style={styles.listingCard}>
            <View style={styles.imgWrap}>
              <Image source={PROPERTY_IMG_1} style={styles.img} resizeMode="cover" />
              <View style={styles.badgeLive}>
                <Text style={styles.badgeLiveText}>LIVE</Text>
              </View>
              <View style={styles.badgeAuth}>
                <Text style={styles.badgeAuthText}>Authority expires in 14 days</Text>
              </View>
            </View>
            <View style={styles.specRow}>
              <View style={styles.specItem}>
                <MaterialCommunityIcons name="bed" size={20} color="#000000" />
                <Text style={styles.specText}>3 Bedrooms</Text>
              </View>
              <View style={styles.specItem}>
                <MaterialCommunityIcons name="bathtub" size={20} color="#000000" />
                <Text style={styles.specText}>3 Bathrooms</Text>
              </View>
              <View style={styles.specItem}>
                <MaterialCommunityIcons name="car" size={20} color="#000000" />
                <Text style={styles.specText}>2 Car Spaces</Text>
              </View>
            </View>
            <Text style={styles.propTitle}>{DEMO_PRIMARY_LISTING_TITLE}</Text>
            <Text style={styles.propPrice}>$21,000,000</Text>
            <Pressable
              style={styles.manageBtn}
              onPress={() => setManageSheetOpen(true)}
              accessibilityRole="button">
              <Text style={styles.manageBtnText}>MANAGE LISTING</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyTab}>
            <Text style={styles.emptyTitle}>{activeSegment === 'contract' ? 'Under contract' : 'Drafts'}</Text>
            <Text style={styles.emptySub}>Nothing here yet in this demo.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
