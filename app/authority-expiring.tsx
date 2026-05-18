import { ScreenHeader } from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text } from '@/components/OMMText';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, borderHairline, Fonts, ink, inkMuted, palette, slateNavy } from '@/constants/theme';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';
import { useScreenHorizontalPadding } from '@/lib/useScreenHorizontalPadding';

/** [Figma 1053:1981](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-1981) */

type FilterKey = 'all' | 'week' | 'month' | 'expired';

type Listing = {
  id: string;
  title: string;
  address: string;
  daysLeft: string;
  soiLine: string;
  filter: FilterKey;
};

const LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Moonee Ponds Villa',
    address: '45 Buckley St, Moonee Ponds',
    daysLeft: '6D LEFT',
    soiLine: 'SOI ATTACHED',
    filter: 'week',
  },
  {
    id: '2',
    title: 'Elsternwick Corner',
    address: '102 Glenhuntly Rd, Elsternwick',
    daysLeft: '11D LEFT',
    soiLine: 'SOI MISSING — ACTION NEEDED',
    filter: 'week',
  },
  {
    id: '3',
    title: 'Williamstown Period',
    address: '17 Ferguson St, Williamstown',
    daysLeft: '16D LEFT',
    soiLine: 'SOI ATTACHED',
    filter: 'month',
  },
  {
    id: '4',
    title: 'Northcote Corner Block',
    address: '72 Arthurton Rd, Northcote',
    daysLeft: '24D LEFT',
    soiLine: 'SOI ATTACHED',
    filter: 'month',
  },
  {
    id: '5',
    title: 'Prahran Loft',
    address: 'Lot 4, Commercial Rd, Prahran',
    daysLeft: 'EXPIRED',
    soiLine: 'SOI ATTACHED',
    filter: 'expired',
  },
];

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipOn : styles.chipOff]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}>
      <Text style={[styles.chipLabel, active && styles.chipLabelOn]}>{label}</Text>
    </Pressable>
  );
}

function AuthorityListCard({
  title,
  address,
  daysLeft,
  soiLine,
}: {
  title: string;
  address: string;
  daysLeft: string;
  soiLine: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.daysPill}>
          <Text style={styles.daysPillText}>{daysLeft}</Text>
        </View>
      </View>
      <Text style={styles.cardAddr} numberOfLines={2}>
        {address}
      </Text>
      <Text style={styles.cardSoi}>{soiLine}</Text>
      <View style={styles.cardRule} />
      <View style={styles.cardActions}>
        <Text style={styles.actionStrong}>RENEW AUTHORITY</Text>
        <Text style={styles.actionBullet}> • </Text>
        <Text style={styles.actionMuted}>CONTACT VENDOR</Text>
      </View>
    </View>
  );
}

export default function AuthorityExpiringScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const hPad = useScreenHorizontalPadding();
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return LISTINGS;
    return LISTINGS.filter((l) => l.filter === filter);
  }, [filter]);

  const count = filtered.length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.headerChrome, hPad]}>
        <ScreenHeader title="Authority expiring" onBack={() => router.back()} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
        <View style={[styles.stickyFilters, hPad]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterStrip}>
            <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
            <FilterChip label="Week" active={filter === 'week'} onPress={() => setFilter('week')} />
            <FilterChip label="Month" active={filter === 'month'} onPress={() => setFilter('month')} />
            <FilterChip label="Expired" active={filter === 'expired'} onPress={() => setFilter('expired')} />
          </ScrollView>
        </View>

        <View style={[styles.body, hPad]}>
          <View style={styles.metaRow}>
            <Text style={styles.metaCount}>
              {count} listing{count === 1 ? '' : 's'} expiring
            </Text>
            <Text style={styles.metaSort}>SORT • SOONEST</Text>
          </View>

          {filtered.map((item) => (
            <AuthorityListCard
              key={item.id}
              title={item.title}
              address={item.address}
              daysLeft={item.daysLeft}
              soiLine={item.soiLine}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.white },
  headerChrome: {
    paddingBottom: 4,
  },
  stickyFilters: {
    backgroundColor: palette.white,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderHairline,
  },
  body: {
    paddingTop: 16,
  },
  filterStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    height: 30,
    paddingHorizontal: 14,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: accent },
  chipOff: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: borderHairline,
  },
  chipLabel: { fontSize: 13, fontFamily: Fonts.medium, color: inkMuted },
  chipLabelOn: { color: ink },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  metaCount: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: 'rgba(0,0,0,0.55)', letterSpacing: 0.5 },
  metaSort: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: 'rgba(0,0,0,0.55)', letterSpacing: 0.6 },
  card: {
    minHeight: 144,
    backgroundColor: '#fff',
    borderRadius: 11,
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 14,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 24,
  },
  daysPill: {
    minWidth: 56,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: slateNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysPillText: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  cardAddr: {
    marginTop: 8,
    fontSize: 13,
    color: inkMuted,
    lineHeight: 19,
  },
  cardSoi: {
    marginTop: 10,
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
  },
  cardRule: {
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ebebeb',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 2,
  },
  actionStrong: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    lineHeight: 16,
  },
  actionBullet: {
    fontSize: 11,
    fontWeight: '400',
    color: '#b3b3b3',
    lineHeight: 16,
  },
  actionMuted: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0,0,0,0.55)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    lineHeight: 16,
  },
});
