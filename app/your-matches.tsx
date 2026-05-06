import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Your Matches — seller/buyer brief matches list.
 * [Figma 1053:7056](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-7056&t=gEfFuYKIwBHVUzXh-4)
 */

const THUMB = require('@/assets/images/welcome-bg.jpg');

const PAD = 20;

type Row = {
  id: string;
  title: string;
  priceRange: string;
  meta: string;
};

const MATCHES: Row[] = [
  {
    id: '1',
    title: 'Inner east family relocation',
    priceRange: '$1.80m – $2.60m',
    meta: 'Hawthorn, Camberwell, Kew · Period home · 4 bed+',
  },
  {
    id: '2',
    title: 'Low-maintenance downsizer',
    priceRange: '$2.10m – $2.80m',
    meta: 'Malvern, Armadale · Townhouse or small lot',
  },
  {
    id: '3',
    title: 'First home + two parks',
    priceRange: '$900k – $1.15m',
    meta: 'Brunswick East · Apt or TH · pet-friendly',
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
    meta: 'Toorak · off-market only · north-facing garden',
  },
  {
    id: '6',
    title: 'Inner-north terrace uplift',
    priceRange: '$1.35m – $1.65m',
    meta: 'Northcote · renovator · walk to Merri Creek',
  },
];

export default function YourMatchesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backBtn}>
          <FontAwesome name="chevron-left" size={20} color="#1c1c1e" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Your Matches</Text>
          <Text style={styles.subtitle}>6 matched listings</Text>
        </View>
        <View style={styles.headerEnd} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>New briefs land here automatically</Text>
          <Text style={styles.bannerBody}>
            When a buyer or buyer agent posts a brief that fits your profile, it appears as a private lead — suburbs,
            budget, and timing come straight from their form.
          </Text>
        </View>

        <View style={styles.sortRow}>
          <Text style={styles.sortText}>Sort · Newest briefs</Text>
        </View>

        {MATCHES.map((m, i) => (
          <View key={m.id}>
            {i > 0 ? <View style={styles.divider} /> : null}
            <Pressable
              style={styles.row}
              onPress={() =>
                router.push({ pathname: '/seller-match-detail', params: { id: m.id } } as Href)
              }
              accessibilityRole="button">
              <Image source={THUMB} style={styles.thumb} resizeMode="cover" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.12)',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerEnd: { width: 40 },
  title: { fontSize: 18, fontWeight: '700', color: '#1c1c1e' },
  subtitle: { fontSize: 13, fontWeight: '500', color: 'rgba(60,60,67,0.45)', marginTop: 4 },
  scroll: { paddingHorizontal: PAD, paddingTop: 16 },
  banner: {
    backgroundColor: '#f3efe8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#1c1c1e', marginBottom: 8 },
  bannerBody: { fontSize: 13, fontWeight: '400', color: 'rgba(60,60,67,0.55)', lineHeight: 19 },
  sortRow: { alignItems: 'flex-end', marginBottom: 12 },
  sortText: { fontSize: 12, fontWeight: '600', color: 'rgba(60,60,67,0.45)', letterSpacing: 0.2 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 14 },
  thumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#e8e4df' },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: '#1c1c1e', marginBottom: 4 },
  rowPrice: { fontSize: 15, fontWeight: '700', color: '#1c1c1e', marginBottom: 6 },
  rowMeta: { fontSize: 12, fontWeight: '500', color: 'rgba(60,60,67,0.5)', lineHeight: 17 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(60,60,67,0.12)' },
  endLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(60,60,67,0.35)',
    marginTop: 28,
    marginBottom: 8,
  },
});
