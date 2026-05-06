import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** [Figma 1053:1981](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-1981) */

const PAD = 32;

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
    title: 'Brighton Terrace',
    address: '12 Park St, Brighton',
    daysLeft: '6D LEFT',
    soiLine: 'SOI ATTACHED',
    filter: 'week',
  },
  {
    id: '2',
    title: 'South Yarra Penthouse',
    address: '5 Toorak Rd, South Yarra',
    daysLeft: '11D LEFT',
    soiLine: 'SOI MISSING — ACTION NEEDED',
    filter: 'week',
  },
  {
    id: '3',
    title: 'Kew Heritage',
    address: '14 Studley Park Rd, Kew',
    daysLeft: '16D LEFT',
    soiLine: 'SOI ATTACHED',
    filter: 'month',
  },
  {
    id: '4',
    title: 'St Kilda Quarter',
    address: '88 Fitzroy St, St Kilda',
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
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return LISTINGS;
    return LISTINGS.filter((l) => l.filter === filter);
  }, [filter]);

  const count = filtered.length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.headerSide}>
          <FontAwesome name="chevron-left" size={20} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Authority expiring</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterStrip}>
          <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          <FilterChip label="Week" active={filter === 'week'} onPress={() => setFilter('week')} />
          <FilterChip label="Month" active={filter === 'month'} onPress={() => setFilter('month')} />
          <FilterChip label="Expired" active={filter === 'expired'} onPress={() => setFilter('expired')} />
        </ScrollView>

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerSide: { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  scroll: { paddingHorizontal: PAD },
  filterStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  chip: {
    height: 30,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: '#1c1c1e' },
  chipOff: { backgroundColor: '#ededed' },
  chipLabel: { fontSize: 13, fontWeight: '500', color: '#2e2e2e' },
  chipLabelOn: { color: '#fff' },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  metaCount: { fontSize: 15, fontWeight: '700', color: '#666', letterSpacing: 0.5 },
  metaSort: { fontSize: 12, fontWeight: '700', color: '#737373', letterSpacing: 0.6 },
  card: {
    minHeight: 144,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(60,60,67,0.55)',
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
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 24,
  },
  daysPill: {
    minWidth: 56,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  cardAddr: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '400',
    color: '#808080',
    lineHeight: 19,
  },
  cardSoi: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(60,60,67,0.55)',
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
    fontWeight: '600',
    color: '#1a1a1a',
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
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    lineHeight: 16,
  },
});
