import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { type Href, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/OMMText';
import { ScreenHeader } from '@/components/ScreenHeader';
import { layout, slateNavy } from '@/constants/theme';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';
import { filterSavedListingsNotArchivedPublished } from '@/lib/agent-published-listings';
import { useAgentPublishedListings } from '@/lib/agent-published-listings-context';
import { propertyImageAtIndex } from '@/lib/propertyImages';
import type { SavedListingCardData } from '@/lib/saved-listings';
import { useSavedListings } from '@/lib/saved-listings-context';
import { useScreenHorizontalPadding } from '@/lib/useScreenHorizontalPadding';

const CARD_GAP = 14;
const ROW_PAD = 16;

function savedRowStatusPillStyle(label: string) {
  const u = label.toUpperCase();
  if (u.includes('SOLD')) return styles.statusSold;
  return styles.statusLive;
}

function SavedPropertyRow({
  item,
  onPress,
}: {
  item: SavedListingCardData;
  onPress: () => void;
}) {
  const statusStyle = savedRowStatusPillStyle(item.badgeLeft);
  const a11ySuburb = item.suburb.trim().length > 0 ? `, ${item.suburb}` : '';
  return (
    <Pressable
      onPress={onPress}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={`${item.street}${a11ySuburb}, ${item.price}, ${item.bedrooms} bedrooms, ${item.bathrooms} bathrooms, ${item.carSpaces} car spaces`}>
      <Image
        source={propertyImageAtIndex(item.imageIndex)}
        style={styles.thumb}
        resizeMode="cover"
      />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.street} numberOfLines={2}>
            {item.street}
          </Text>
          <View style={[styles.statusPill, statusStyle]}>
            <Text style={styles.statusText}>{item.badgeLeft}</Text>
          </View>
        </View>
        {item.suburb.trim().length > 0 ? (
          <View style={styles.locRow}>
            <FontAwesome name="map-marker" size={13} color="rgba(0, 0, 0, 0.55)" style={styles.locIcon} />
            <Text style={styles.suburb}>{item.suburb}</Text>
          </View>
        ) : null}
        <Text style={styles.price}>{item.price}</Text>
        <View style={styles.features}>
          <View style={styles.feat}>
            <MaterialCommunityIcons name="bed" size={15} color="rgba(0, 0, 0, 0.55)" />
            <Text style={styles.featNum}>{item.bedrooms}</Text>
          </View>
          <View style={styles.feat}>
            <MaterialCommunityIcons name="shower" size={15} color="rgba(0, 0, 0, 0.55)" />
            <Text style={styles.featNum}>{item.bathrooms}</Text>
          </View>
          <View style={styles.feat}>
            <MaterialCommunityIcons name="car" size={15} color="rgba(0, 0, 0, 0.55)" />
            <Text style={styles.featNum}>{item.carSpaces}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function SavedPropertiesScreen() {
  const insets = useSafeAreaInsets();
  const hPad = useScreenHorizontalPadding();
  const router = useRouter();
  const { listings, ready } = useSavedListings();
  const { listings: publishedRows } = useAgentPublishedListings();

  const visibleListings = useMemo(
    () => filterSavedListingsNotArchivedPublished(listings, publishedRows),
    [listings, publishedRows],
  );

  const openListing = (item: SavedListingCardData) => {
    if (item.id.startsWith('omm-')) {
      router.push({
        pathname: '/view-live-listing',
        params: { listingId: item.id },
      } as Href);
      return;
    }
    router.push({
      pathname: '/view-live-listing',
      params: {
        street: item.street,
        suburb: item.suburb,
        price: item.price,
        beds: String(item.bedrooms),
        baths: String(item.bathrooms),
        cars: String(item.carSpaces),
        imageIndex: String(item.imageIndex),
      },
    } as Href);
  };

  const metaLeft =
    visibleListings.length === 0
      ? 'No saved properties'
      : visibleListings.length === 1
        ? '1 saved property'
        : `${visibleListings.length} saved properties`;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.headBlock, hPad]}>
        <ScreenHeader title="Saved properties" onBack={() => router.back()} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaLeft}>{!ready ? 'Loading…' : metaLeft}</Text>
        <Text style={styles.metaRight}>Sort · Newest</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 28 }]}>
        {ready && visibleListings.length === 0 ? (
          <Text style={styles.emptyHint}>
            Save a listing from its detail page — it will show here and on your home screen.
          </Text>
        ) : null}
        {visibleListings.map((item) => (
          <View key={item.id} style={{ marginBottom: CARD_GAP }}>
            <SavedPropertyRow item={item} onPress={() => openListing(item)} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  headBlock: { paddingTop: 8, paddingBottom: 4 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenGutter,
    marginBottom: 18,
  },
  metaLeft: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#6b6b6b' },
  metaRight: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: '#595959' },
  list: { paddingHorizontal: layout.screenGutter },
  emptyHint: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    lineHeight: 20,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    minHeight: 128,
    borderRadius: 10,
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
    backgroundColor: '#fff',
    padding: ROW_PAD,
    gap: 14,
  },
  thumb: { width: 88, height: 88, borderRadius: 6 },
  rowBody: { flex: 1, minWidth: 0 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  street: { flex: 1, fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000', lineHeight: 22 },
  statusPill: {
    minHeight: 22,
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '42%',
  },
  statusLive: { backgroundColor: slateNavy },
  statusSold: { backgroundColor: '#3a3a3a' },
  statusText: {
    fontSize: 9,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  locIcon: { marginTop: 0 },
  suburb: { fontSize: 13, fontWeight: '400', color: 'rgba(0, 0, 0, 0.65)', lineHeight: 19 },
  price: { marginTop: 10, fontSize: 17, fontFamily: 'Satoshi-Medium', color: '#000000', lineHeight: 24 },
  features: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 },
  feat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featNum: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.65)', lineHeight: 18 },
});
