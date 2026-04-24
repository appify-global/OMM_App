import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { images } from '../constants/images';
import { brand } from '../theme/brand';

type Props = RootStackScreenProps<'ListingSeeAll'>;

type CardStatus = 'LIVE' | 'SOLD';

type Row = {
  id: string;
  image: (typeof images)[keyof typeof images];
  status: CardStatus;
  address: string;
  suburb: string;
  price: string;
  beds: number;
  baths: number;
  cars: number;
};

const SELLING_ROWS: Row[] = [
  {
    id: '1',
    image: images.propertyHouse1,
    status: 'LIVE',
    address: '47 Hawthorn St',
    suburb: 'City Center',
    price: '$1,850,000',
    beds: 4,
    baths: 3,
    cars: 2,
  },
  {
    id: '2',
    image: images.propertyHouse2,
    status: 'LIVE',
    address: '12 Park St',
    suburb: 'Brighton',
    price: '$2,200,000',
    beds: 3,
    baths: 2,
    cars: 1,
  },
  {
    id: '3',
    image: images.propertyHouse3,
    status: 'SOLD',
    address: '88 Auburn Rd',
    suburb: 'Hawthorn',
    price: '$1,450,000',
    beds: 3,
    baths: 2,
    cars: 1,
  },
  {
    id: '4',
    image: images.propertyHouse1,
    status: 'LIVE',
    address: '2 Esplanade',
    suburb: 'Brighton',
    price: '$3,100,000',
    beds: 5,
    baths: 4,
    cars: 3,
  },
];

const OFF_MARKET_ROWS: Row[] = [
  {
    id: 'o1',
    image: images.propertyHouse1,
    status: 'LIVE',
    address: '8 Riverside Ave',
    suburb: 'Camberwell',
    price: '$2,100,000',
    beds: 4,
    baths: 3,
    cars: 2,
  },
  {
    id: 'o2',
    image: images.propertyHouse2,
    status: 'LIVE',
    address: '16 Lynch St',
    suburb: 'Hawthorn',
    price: '$1,550,000',
    beds: 3,
    baths: 2,
    cars: 1,
  },
  {
    id: 'o3',
    image: images.propertyHouse3,
    status: 'SOLD',
    address: '44 Canterbury Rd',
    suburb: 'Surrey Hills',
    price: '$3,200,000',
    beds: 4,
    baths: 3,
    cars: 2,
  },
  {
    id: 'o4',
    image: images.propertyHouse2,
    status: 'LIVE',
    address: '3 Kooyong Rd',
    suburb: 'South Yarra',
    price: '$1,900,000',
    beds: 2,
    baths: 2,
    cars: 1,
  },
];

export function ListingSeeAllScreen({ navigation, route }: Props) {
  const { context } = route.params;
  const isSelling = context === 'selling';
  const rows = isSelling ? SELLING_ROWS : OFF_MARKET_ROWS;
  const count = rows.length;
  const pageTitle = isSelling ? 'Your active listings' : 'Off-market matches';
  const countLine = isSelling
    ? `${count} active ${count === 1 ? 'listing' : 'listings'}`
    : `${count} off-market ${count === 1 ? 'listing' : 'listings'}`;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={10} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={26} color={brand.charcoal} />
          </Pressable>
          <Text style={styles.title} numberOfLines={2}>
            {pageTitle}
          </Text>
          <View style={styles.backSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.subRow}>
          <Text style={styles.subCount}>{countLine}</Text>
          <Pressable onPress={() => {}} hitSlop={6}>
            <Text style={styles.sort}>Sort · Newest</Text>
          </Pressable>
        </View>

        {rows.map((r) => (
          <View key={r.id} style={styles.card}>
            <Image source={r.image} style={styles.thumb} />
            <View style={styles.cardBody}>
              <View style={styles.titleRow}>
                <Text style={styles.addr} numberOfLines={1}>
                  {r.address}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    r.status === 'LIVE' ? styles.pillLive : styles.pillSold,
                  ]}
                >
                  <Text style={styles.pillText}>{r.status}</Text>
                </View>
              </View>
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={12} color={brand.sage} />
                <Text style={styles.suburb}>{r.suburb}</Text>
              </View>
              <Text style={styles.price}>{r.price}</Text>
              <View style={styles.specsRow}>
                <View style={styles.specItem}>
                  <Ionicons name="bed-outline" size={14} color={brand.sage} />
                  <Text style={styles.specN}>{r.beds}</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="water-outline" size={14} color={brand.sage} />
                  <Text style={styles.specN}>{r.baths}</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="car-outline" size={14} color={brand.sage} />
                  <Text style={styles.specN}>{r.cars}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const THUMB = 100;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.cream },
  safe: { paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backSpacer: { width: 44 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: brand.charcoal,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subCount: { fontSize: 13, color: brand.sage },
  sort: { fontSize: 12, color: brand.sage, fontWeight: '500' },
  card: {
    flexDirection: 'row',
    backgroundColor: brand.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.3)',
    padding: 10,
    marginBottom: 12,
    gap: 12,
  },
  thumb: { width: THUMB, height: THUMB, borderRadius: 8, backgroundColor: brand.cream },
  cardBody: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 },
  addr: { flex: 1, fontSize: 15, fontWeight: '700', color: brand.charcoal },
  statusPill: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  pillLive: { backgroundColor: brand.terracotta },
  pillSold: { backgroundColor: brand.charcoal },
  pillText: { fontSize: 9, fontWeight: '800', color: brand.warmWhite, letterSpacing: 0.2 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  suburb: { fontSize: 12, color: brand.sage },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: brand.terracotta,
    marginTop: 6,
  },
  specsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  specItem: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  specN: { fontSize: 12, color: brand.sage, fontWeight: '500' },
});
