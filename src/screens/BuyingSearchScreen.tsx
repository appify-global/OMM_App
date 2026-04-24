import React, { useEffect, useState } from 'react';
import type { RootStackParamList, RootStackScreenProps } from '../navigation/types';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { brand } from '../theme/brand';
import { images } from '../constants/images';

type BuyingSearchProps = RootStackScreenProps<'BuyingSearch'>;

type ResultRow = {
  id: string;
  image: (typeof images)[keyof typeof images];
  matchPct: string;
  title: string;
  address: string;
  price: string;
  specs: string;
};

const RESULTS: ResultRow[] = [
  {
    id: '1',
    image: images.propertyHouse1,
    matchPct: '92%',
    title: 'Camberwell Family Home',
    address: '8 Riverside Ave, Camberwell',
    price: '$2.1M – $2.3M',
    specs: '4 BED · 3 BATH · 720m²',
  },
  {
    id: '2',
    image: images.propertyHouse2,
    matchPct: '88%',
    title: 'Hawthorn Townhouse',
    address: '16 Lynch St, Hawthorn',
    price: '$1.4M – $1.55M',
    specs: '3 BED · 2 BATH · 168m²',
  },
  {
    id: '3',
    image: images.propertyHouse3,
    matchPct: '84%',
    title: 'Kew East Renovator',
    address: '2 Edge Ave, Kew East',
    price: '$1.1M – $1.25M',
    specs: '3 BED · 1 BATH · 360m²',
  },
  {
    id: '4',
    image: images.propertyHouse1,
    matchPct: '80%',
    title: 'Surrey Hills Period',
    address: '44 Canterbury Rd, Surrey Hills',
    price: '$3.0M – $3.4M',
    specs: '4 BED · 3 BATH · 650m²',
  },
];

export function BuyingSearchScreen({ navigation, route }: BuyingSearchProps) {
  const { query: initialQuery } = route.params;
  const [query, setQuery] = useState(initialQuery);
  const [alertsOn, setAlertsOn] = useState(false);
  const matchCount = 12;

  useEffect(() => {
    setQuery(route.params.query);
  }, [route.params.query]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.back}
            hitSlop={10}
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={26} color={brand.charcoal} />
          </Pressable>
          <Text style={styles.pageTitle}>Home</Text>
          <View style={styles.topRight}>
            <Pressable
              style={styles.headerIcon}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color={brand.charcoal} />
            </Pressable>
            <Pressable style={styles.headerIcon} onPress={() => navigation.navigate('Messages')}>
              <Ionicons name="chatbubble-outline" size={20} color={brand.charcoal} />
            </Pressable>
          </View>
        </View>

        <View style={styles.segmentWrap}>
          <Pressable
            style={styles.segmentItem}
            onPress={() => navigation.navigate('Home', { mode: 'selling' })}
          >
            <Text style={styles.segmentTextDim}>Selling</Text>
          </Pressable>
          <Pressable
            style={[styles.segmentItem, styles.segmentItemActive]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.segmentTextAct}>Buying</Text>
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <Ionicons name="search" size={18} color={brand.sage} style={styles.searchIcon} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Suburb or area"
              placeholderTextColor={brand.sage}
              style={styles.searchInput}
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => {}}
            />
          </View>
          <Pressable
            style={styles.exploreBtn}
            onPress={() => {
              setQuery((q) => (q || '').trim() || 'Hawthorn');
            }}
            accessibilityLabel="Explore search"
          >
            <Text style={styles.exploreLabel}>EXPLORE</Text>
          </Pressable>
        </View>

        <View style={styles.alertBanner}>
          <Ionicons name="star" size={22} color="rgba(254,253,251,0.95)" style={styles.alertStar} />
          <View style={styles.alertCopy}>
            <Text style={styles.alertTitle}>Save search & get alerts</Text>
            <Text style={styles.alertSub}>Notify me the moment a new match appears</Text>
          </View>
          <Switch
            value={alertsOn}
            onValueChange={setAlertsOn}
            trackColor={{ false: '#3d3d3d', true: brand.terracotta }}
            thumbColor={brand.warmWhite}
            ios_backgroundColor="#3d3d3d"
            style={styles.alertSwitch}
          />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.listPad}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.resultsHead}>
          <Text style={styles.resultsCount}>
            {matchCount} off-market matches{query ? ` · ${query}` : ''}
          </Text>
          <Pressable hitSlop={8} onPress={() => {}}>
            <Text style={styles.sortLink}>SORT · BEST MATCH</Text>
          </Pressable>
        </View>

        {RESULTS.map((r) => (
          <Pressable
            key={r.id}
            style={styles.card}
            onPress={() => {}}
            android_ripple={{ color: 'rgba(0,0,0,0.04)' }}
          >
            <View style={styles.cardImageCol}>
              <Image source={r.image} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              <View style={styles.pillOff}>
                <Text style={styles.pillOffText}>OFF-MARKET</Text>
              </View>
              <View style={styles.pillMatch}>
                <Text style={styles.pillMatchText}>{r.matchPct} MATCH</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {r.title}
              </Text>
              <Text style={styles.cardAddr} numberOfLines={2}>
                {r.address}
              </Text>
              <Text style={styles.cardPrice} numberOfLines={1}>
                {r.price}
              </Text>
              <Text style={styles.cardSpecs} numberOfLines={1}>
                {r.specs}
              </Text>
            </View>
          </Pressable>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const M = 16;
const R = 12;
/** ~40% image column; detail text is left-aligned in the right column. */
const IMG_COL_PCT = '40%';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.warmWhite },
  safe: { paddingHorizontal: M, paddingBottom: 8 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  back: { width: 40, height: 44, justifyContent: 'center' },
  pageTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '500',
    color: brand.charcoal,
    fontFamily: brand.fontSans,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: brand.cream,
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  segmentItemActive: { backgroundColor: brand.white, shadowColor: brand.charcoal, shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  segmentTextDim: { color: brand.sage, fontSize: 16, fontWeight: '500' },
  segmentTextAct: { color: brand.charcoal, fontSize: 16, fontWeight: '500' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.cream,
    borderRadius: R,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: brand.charcoal,
    paddingVertical: 10,
    fontFamily: brand.fontSans,
  },
  exploreBtn: {
    backgroundColor: brand.charcoal,
    paddingHorizontal: 18,
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
  },
  exploreLabel: {
    color: brand.warmWhite,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.charcoal,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  alertStar: { marginRight: 10 },
  alertCopy: { flex: 1, paddingRight: 4 },
  alertTitle: { color: brand.warmWhite, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  alertSub: { color: 'rgba(254,253,251,0.7)', fontSize: 12, lineHeight: 17 },
  alertSwitch: { transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }] },
  listPad: { paddingHorizontal: M, paddingTop: 4 },
  resultsHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  resultsCount: { fontSize: 14, fontWeight: '500', color: brand.charcoal, fontFamily: brand.fontSans, flex: 1, paddingRight: 8 },
  sortLink: { fontSize: 10, color: brand.sage, letterSpacing: 0.2 },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.2)',
    marginBottom: 12,
    overflow: 'hidden',
    minHeight: 120,
    shadowColor: brand.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImageCol: {
    width: IMG_COL_PCT,
    minHeight: 120,
    backgroundColor: '#e8e4df',
    position: 'relative',
    alignSelf: 'stretch',
  },
  pillOff: {
    position: 'absolute',
    top: 10,
    left: 8,
    zIndex: 1,
    backgroundColor: brand.charcoal,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pillOffText: { color: brand.warmWhite, fontSize: 8, fontWeight: '800', letterSpacing: 0.2 },
  pillMatch: {
    position: 'absolute',
    bottom: 10,
    left: 8,
    zIndex: 1,
    backgroundColor: brand.charcoal,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pillMatchText: { color: brand.warmWhite, fontSize: 8, fontWeight: '800' },
  cardBody: {
    flex: 1,
    minWidth: 0,
    backgroundColor: brand.white,
    paddingLeft: 14,
    paddingRight: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cardTitle: {
    width: '100%',
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    color: brand.charcoal,
    fontFamily: brand.fontSans,
  },
  cardAddr: {
    width: '100%',
    textAlign: 'left',
    fontSize: 12,
    lineHeight: 16,
    color: brand.sage,
    marginTop: 3,
  },
  cardPrice: {
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    color: brand.charcoal,
    marginTop: 8,
    fontFamily: brand.fontSans,
  },
  cardSpecs: {
    textAlign: 'left',
    fontSize: 11,
    lineHeight: 16,
    color: brand.sage,
    marginTop: 4,
  },
});
