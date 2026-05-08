import { type Href, useRouter } from 'expo-router';
import { Text } from '@/components/OMMText';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { useScreenHorizontalPadding } from '@/lib/useScreenHorizontalPadding';

/**
 * Potential buyers — buyer briefs list.
 * [Figma 1053:6927](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-6927&t=gEfFuYKIwBHVUzXh-4)
 */

import { PROPERTY_IMG_1 } from '@/lib/propertyImages';

const PAD = 20;

type Row = {
  id: string;
  title: string;
  priceRange: string;
  meta: string;
};

const BRIEFS: Row[] = [
  {
    id: '1',
    title: 'Inner east family relocation',
    priceRange: '$1.80m – $2.60m',
    meta: 'Hawthorn East, Camberwell · Period home · 4 bed · schools',
  },
  {
    id: '2',
    title: 'Low-maintenance downsizer',
    priceRange: '$2.10m – $2.80m',
    meta: 'Malvern, Armadale · Townhouse · 1 level preferred',
  },
  {
    id: '3',
    title: 'First home + two parks',
    priceRange: '$900k – $1.15m',
    meta: 'Brunswick East · Apt or TH · walk to two parks',
  },
  {
    id: '4',
    title: 'Yield-led investor',
    priceRange: '$650k – $850k',
    meta: 'Footscray · 2 bed · prefers settled tenant',
  },
  {
    id: '5',
    title: 'Single-level prestige',
    priceRange: '$5.0m – $7.0m',
    meta: 'Brighton East · off-market only · north-facing garden',
  },
  {
    id: '6',
    title: 'Inner-north terrace uplift',
    priceRange: '$1.35m – $1.65m',
    meta: 'Northcote · renovator · walk to Merri Creek',
  },
];

export default function PotentialBuyersScreen() {
  const insets = useSafeAreaInsets();
  const hPad = useScreenHorizontalPadding();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.headBlock, hPad]}>
        <ScreenHeader title="Potential buyers" onBack={() => router.back()} />
        <Text style={styles.subtitle}>6 buyer briefs</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>New briefs land here automatically</Text>
          <Text style={styles.bannerBody}>
            When a buyer or buyer agent posts a brief that fits your profile, it appears as a private lead, suburbs,
            budget, and timing come straight from their form.
          </Text>
        </View>

        <View style={styles.sortRow}>
          <Text style={styles.sortText}>Sort · Newest briefs</Text>
        </View>

        {BRIEFS.map((m, i) => (
          <View key={m.id}>
            {i > 0 ? <View style={styles.divider} /> : null}
            <Pressable
              style={styles.row}
              onPress={() =>
                router.push({ pathname: '/buyer-lead-detail', params: { id: m.id } } as Href)
              }
              accessibilityRole="button">
              <Image source={PROPERTY_IMG_1} style={styles.thumb} resizeMode="cover" />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{m.title}</Text>
                <Text style={styles.rowPrice}>{m.priceRange}</Text>
                <Text style={styles.rowMeta} numberOfLines={2}>
                  {m.meta}
                </Text>
              </View>
            </Pressable>
          </View>
        ))}

        <Text style={styles.endLabel}>End of briefs</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  headBlock: { paddingTop: 8, paddingBottom: 12 },
  subtitle: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
  },
  scroll: { paddingHorizontal: PAD, paddingTop: 16 },
  banner: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  bannerTitle: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000', marginBottom: 8 },
  bannerBody: { fontSize: 13, fontWeight: '400', color: 'rgba(0, 0, 0, 0.55)', lineHeight: 19 },
  sortRow: { alignItems: 'flex-end', marginBottom: 12 },
  sortText: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)', letterSpacing: 0.2 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 14 },
  thumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.06)' },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000', marginBottom: 4 },
  rowPrice: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000', marginBottom: 6 },
  rowMeta: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.5)', lineHeight: 17 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(0, 0, 0, 0.12)' },
  endLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.35)',
    marginTop: 28,
    marginBottom: 8,
  },
});
