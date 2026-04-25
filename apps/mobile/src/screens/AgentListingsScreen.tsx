import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { brand } from '../theme/brand';
import { images } from '../constants/images';

type Props = RootStackScreenProps<'AgentListings'>;
type StatusFilter = 'all' | 'live' | 'under' | 'sold';
type RowStatus = 'LIVE' | 'UNDER_OFFER' | 'SOLD';

type Row = {
  id: string;
  address: string;
  specs: string;
  price: string;
  lineLeft: string;
  lineRight: string;
  image: (typeof images)[keyof typeof images];
  status: RowStatus;
  filter: Exclude<StatusFilter, 'all'>;
};

const DATA: Row[] = [
  {
    id: '1',
    address: '22 Lilac Ave, Hawthorn',
    specs: 'HOUSE · 4 BED · 2 BATH · 2 CAR',
    price: '$2.1m — $2.3m',
    lineLeft: 'LISTED 3 DAYS AGO',
    lineRight: '4 ENQUIRIES',
    image: images.propertyHouse1,
    status: 'LIVE',
    filter: 'live',
  },
  {
    id: '2',
    address: '18 Gordon St, Balwyn',
    specs: 'HOUSE · 4 BED · 2 BATH · 2 CAR',
    price: '$1.7m — $1.8m',
    lineLeft: 'LISTED 2 WEEKS AGO',
    lineRight: '12 ENQUIRIES',
    image: images.propertyHouse2,
    status: 'UNDER_OFFER',
    filter: 'under',
  },
  {
    id: '3',
    address: '30 Temple St, Kew',
    specs: 'TOWNHOUSE · 3 BED · 2 BATH · 1 CAR',
    price: 'SOLD $2.65m',
    lineLeft: 'SETTLED 6 WEEKS AGO',
    lineRight: '8 ENQUIRIES',
    image: images.propertyHouse3,
    status: 'SOLD',
    filter: 'sold',
  },
];

const BADGE: Record<RowStatus, { bg: string; text: string }> = {
  LIVE: { bg: brand.terracotta, text: 'LIVE' },
  UNDER_OFFER: { bg: '#9a7b6a', text: 'UNDER OFFER' },
  SOLD: { bg: '#3d2a22', text: 'SOLD' },
};

export function AgentListingsScreen({ navigation }: Props) {
  const [f, setF] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<string | null>(DATA[1]!.id);

  const list = useMemo(
    () => (f === 'all' ? DATA : DATA.filter((d) => d.filter === f)),
    [f],
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.topIcon} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={26} color={brand.charcoal} />
          </Pressable>
          <Text style={styles.topTitle}>Active listings</Text>
          <Pressable style={styles.topIcon}>
            <Ionicons name="ellipsis-vertical" size={22} color={brand.charcoal} />
          </Pressable>
        </View>
        <View style={styles.agentStrip}>
          <Image source={images.agentAnton} style={styles.agentPh} />
          <View>
            <Text style={styles.agentN}>Anton Zhouk</Text>
            <Text style={styles.agentA}>Listing Agent · Ray White Hawthorn</Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {(
            [
              ['all', 'ALL'] as [StatusFilter, string],
              ['live', 'LIVE'] as [StatusFilter, string],
              ['under', 'UNDER OFFER'] as [StatusFilter, string],
              ['sold', 'SOLD'] as [StatusFilter, string],
            ] as const
          ).map(([id, label]) => {
            const active = f === id;
            return (
              <Pressable
                key={id}
                onPress={() => setF(id)}
                style={[styles.chip, active && styles.chipOn]}
              >
                <Text style={[styles.chipT, active && styles.chipTOn]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.subHeadRow}>
          <Text style={styles.subHeadL}>12 LISTINGS</Text>
          <Text style={styles.subHeadR}>NEWEST ↓</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.listFlex}
        contentContainerStyle={styles.listScroll}
        showsVerticalScrollIndicator={false}
      >
        {list.map((d) => {
          const b = BADGE[d.status];
          const isSel = selected === d.id;
          return (
            <Pressable
              key={d.id}
              onPress={() => setSelected(d.id)}
              style={[styles.listCard, isSel && styles.listCardSelect]}
            >
              <View style={styles.listImgBox}>
                <Image source={d.image} style={styles.listImg} resizeMode="cover" />
                <View style={[styles.badge, { backgroundColor: b.bg }]}>
                  <Text style={styles.badgeT}>{b.text}</Text>
                </View>
              </View>
              <Text style={styles.addr}>{d.address}</Text>
              <Text style={styles.spec}>{d.specs}</Text>
              <Text style={styles.pr}>{d.price}</Text>
              <View style={styles.foot} />
              <View style={styles.footR}>
                <Text style={styles.footL}>{d.lineLeft}</Text>
                <Text style={styles.footE}>{d.lineRight}</Text>
              </View>
            </Pressable>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.warmWhite },
  safe: { backgroundColor: brand.warmWhite },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: brand.space.xs },
  topIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, textAlign: 'center', fontSize: brand.type.subtitle, fontWeight: '500' },
  agentStrip: {
    flexDirection: 'row',
    paddingHorizontal: brand.space.sm,
    marginBottom: brand.space.sm,
    alignItems: 'center',
  },
  agentPh: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  agentN: { fontWeight: '500', color: brand.charcoal },
  agentA: { fontSize: 12, color: brand.sage, marginTop: 2 },
  chips: { gap: 8, paddingHorizontal: brand.space.sm, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  chipOn: { backgroundColor: brand.terracotta, borderColor: brand.terracotta },
  chipT: { fontSize: 12, color: brand.charcoal, fontWeight: '500' },
  chipTOn: { color: brand.warmWhite },
  subHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: brand.space.sm,
    marginBottom: 4,
  },
  subHeadL: { fontSize: 10, color: brand.sage, letterSpacing: 0.4 },
  subHeadR: { fontSize: 10, color: brand.sage },
  listFlex: { flex: 1 },
  listScroll: { padding: brand.space.sm, paddingTop: 0 },
  listCard: {
    backgroundColor: brand.white,
    borderRadius: brand.radius.lg,
    marginBottom: 16,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  listCardSelect: {
    borderColor: '#2563eb',
    borderWidth: 2,
  },
  listImgBox: { position: 'relative' },
  listImg: { width: '100%', height: 180, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeT: { color: brand.warmWhite, fontSize: 9, fontWeight: '500', letterSpacing: 0.5 },
  addr: { fontSize: 16, fontWeight: '500', color: brand.charcoal, marginTop: 10, marginHorizontal: 12 },
  spec: { fontSize: 10, color: brand.sage, marginTop: 4, marginHorizontal: 12, letterSpacing: 0.3 },
  pr: { fontSize: 17, fontWeight: '500', marginTop: 8, marginHorizontal: 12 },
  foot: { height: 1, backgroundColor: 'rgba(138,155,142,0.25)', marginTop: 12, marginHorizontal: 12 },
  footR: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginHorizontal: 12,
  },
  footL: { fontSize: 10, color: brand.sage, letterSpacing: 0.2 },
  footE: { fontSize: 10, color: brand.sage, letterSpacing: 0.2 },
});
