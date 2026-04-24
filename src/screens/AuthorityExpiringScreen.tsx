import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { brand } from '../theme/brand';

type Props = RootStackScreenProps<'AuthorityExpiring'>;

type FilterId = 'all' | 'week' | 'month' | 'expired';

type Listing = {
  id: string;
  title: string;
  address: string;
  badge: string;
  soiLine: string;
  isExpired: boolean;
  daysLeft: number | null;
};

const ALL: Listing[] = [
  {
    id: '1',
    title: 'Brighton Terrace',
    address: '12 Park St, Brighton',
    badge: '6D LEFT',
    soiLine: 'SOI ATTACHED',
    isExpired: false,
    daysLeft: 6,
  },
  {
    id: '2',
    title: 'Kooyong Family Home',
    address: '14 Kooyong Rd, Kooyong',
    badge: '14D LEFT',
    soiLine: 'SOI MISSING — ACTION NEEDED',
    isExpired: false,
    daysLeft: 14,
  },
  {
    id: '3',
    title: 'Camberwell Art Deco',
    address: '2 Burke Rd, Camberwell',
    badge: '21D LEFT',
    soiLine: 'SOI ATTACHED',
    isExpired: false,
    daysLeft: 21,
  },
  {
    id: '4',
    title: 'Glen Iris Gardens',
    address: '8 Ferndale Pl, Glen Iris',
    badge: '28D LEFT',
    soiLine: 'SOI ATTACHED',
    isExpired: false,
    daysLeft: 28,
  },
  {
    id: '5',
    title: 'Malvern Period',
    address: '3 Wattletree Rd, Malvern',
    badge: 'EXPIRED',
    soiLine: 'EXPIRED — LISTING DE-PUBLISHED',
    isExpired: true,
    daysLeft: 0,
  },
  {
    id: '6',
    title: 'St Kilda West',
    address: '90A Blessington St, St Kilda',
    badge: '2D LEFT',
    soiLine: 'SOI ATTACHED',
    isExpired: false,
    daysLeft: 2,
  },
  {
    id: '7',
    title: 'Hampton Villa',
    address: '1 Marine Pde, Hampton',
    badge: 'EXPIRED',
    soiLine: 'EXPIRED — LISTING DE-PUBLISHED',
    isExpired: true,
    daysLeft: 0,
  },
];

const CHIPS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'week', label: 'WEEK' },
  { id: 'month', label: 'MONTH' },
  { id: 'expired', label: 'EXPIRED' },
];

function matchesFilter(f: FilterId, item: Listing) {
  if (f === 'all') return true;
  if (f === 'expired') return item.isExpired;
  if (f === 'week') return !item.isExpired && item.daysLeft != null && item.daysLeft <= 7;
  if (f === 'month') {
    return !item.isExpired && item.daysLeft != null && item.daysLeft > 7 && item.daysLeft <= 31;
  }
  return true;
}

export function AuthorityExpiringScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<FilterId>('all');
  const list = useMemo(() => ALL.filter((i) => matchesFilter(filter, i)), [filter]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={10} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={26} color={brand.charcoal} />
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            Authority expiring
          </Text>
          <View style={styles.backSpacer} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {CHIPS.map((c) => {
            const on = filter === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setFilter(c.id)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.subHead}>
          <Text style={styles.subL}>
            {list.length} listing{list.length === 1 ? '' : 's'} expiring
          </Text>
          <Pressable onPress={() => {}}>
            <Text style={styles.subR}>SORT · SOONEST</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {list.map((l) => (
          <View key={l.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardName} numberOfLines={1}>
                {l.title}
              </Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{l.badge}</Text>
              </View>
            </View>
            <Text style={styles.addr}>{l.address}</Text>
            <Text style={styles.soi} numberOfLines={2}>
              {l.soiLine}
            </Text>
            <View style={styles.rule} />
            <Text style={styles.actionLine}>RENEW AUTHORITY · CONTACT VENDOR</Text>
          </View>
        ))}
        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#efede9' },
  safe: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backSpacer: { width: 44 },
  title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '600', color: brand.charcoal },
  chipRow: { gap: 8, marginBottom: 8, paddingRight: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  chipOn: { backgroundColor: brand.charcoal, borderColor: brand.charcoal },
  chipText: { fontSize: 12, fontWeight: '600', color: brand.charcoal },
  chipTextOn: { color: brand.warmWhite },
  subHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 6,
  },
  subL: { fontSize: 11, color: brand.sage, fontWeight: '600' },
  subR: { fontSize: 10, color: brand.sage, letterSpacing: 0.2, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 },
  card: {
    backgroundColor: brand.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.25)',
    padding: 16,
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  cardName: { flex: 1, fontSize: 16, fontWeight: '600', color: brand.charcoal },
  statusPill: {
    backgroundColor: brand.charcoal,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusPillText: { color: brand.warmWhite, fontSize: 8, fontWeight: '800', letterSpacing: 0.2 },
  addr: { fontSize: 14, color: brand.sage, marginTop: 4 },
  soi: { fontSize: 11, color: brand.sage, marginTop: 8, letterSpacing: 0.2, textTransform: 'uppercase' },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(138,155,142,0.35)', marginVertical: 12 },
  actionLine: { fontSize: 11, fontWeight: '800', color: brand.charcoal, letterSpacing: 0.1 },
});
