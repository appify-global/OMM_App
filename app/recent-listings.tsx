import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Text } from '@/components/OMMText';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** [Figma 1053:1232](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-1232) — See All · Listings */

import { ScreenHeader } from '@/components/ScreenHeader';
import { useScreenHorizontalPadding } from '@/lib/useScreenHorizontalPadding';
import { propertyImageAtIndex } from '@/lib/propertyImages';

const PAD = 24;
const CARD_GAP = 14;
const ROW_PAD = 16;

type Row = {
  id: string;
  street: string;
  suburb: string;
  price: string;
  status: 'LIVE' | 'SOLD';
  beds: number;
  baths: number;
  cars: number;
};

const ROWS: Row[] = [
  {
    id: '1',
    street: '12 Hartington St',
    suburb: 'Elsternwick',
    price: '$1,850,000',
    status: 'LIVE',
    beds: 3,
    baths: 2,
    cars: 2,
  },
  {
    id: '2',
    street: '44 Orrong Rd',
    suburb: 'Armadale',
    price: '$2,100,000',
    status: 'LIVE',
    beds: 4,
    baths: 3,
    cars: 2,
  },
  {
    id: '3',
    street: '9 Pasley St',
    suburb: 'St Kilda',
    price: '$1,420,000',
    status: 'SOLD',
    beds: 2,
    baths: 2,
    cars: 1,
  },
  {
    id: '4',
    street: '71 Wheatland Rd',
    suburb: 'Malvern',
    price: '$3,250,000',
    status: 'LIVE',
    beds: 3,
    baths: 2,
    cars: 2,
  },
];

function ListingRow({ row, index }: { row: Row; index: number }) {
  const statusStyle = row.status === 'SOLD' ? styles.statusSold : styles.statusLive;
  return (
    <View style={styles.row}>
      <Image source={propertyImageAtIndex(index)} style={styles.thumb} resizeMode="cover" />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.street} numberOfLines={2}>
            {row.street}
          </Text>
          <View style={[styles.statusPill, statusStyle]}>
            <Text style={styles.statusText}>{row.status}</Text>
          </View>
        </View>
        <View style={styles.locRow}>
          <FontAwesome name="map-marker" size={13} color="rgba(0, 0, 0, 0.55)" style={styles.locIcon} />
          <Text style={styles.suburb}>{row.suburb}</Text>
        </View>
        <Text style={styles.price}>{row.price}</Text>
        <View style={styles.features}>
          <View style={styles.feat}>
            <MaterialCommunityIcons name="bed" size={15} color="rgba(0, 0, 0, 0.55)" />
            <Text style={styles.featNum}>{row.beds}</Text>
          </View>
          <View style={styles.feat}>
            <MaterialCommunityIcons name="shower" size={15} color="rgba(0, 0, 0, 0.55)" />
            <Text style={styles.featNum}>{row.baths}</Text>
          </View>
          <View style={styles.feat}>
            <MaterialCommunityIcons name="car" size={15} color="rgba(0, 0, 0, 0.55)" />
            <Text style={styles.featNum}>{row.cars}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function RecentListingsScreen() {
  const insets = useSafeAreaInsets();
  const hPad = useScreenHorizontalPadding();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.headBlock, hPad]}>
        <ScreenHeader title="Recently published" onBack={() => router.back()} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaLeft}>24 off-market listings</Text>
        <Text style={styles.metaRight}>Sort · Newest</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 28 }]}>
          {ROWS.map((row, index) => (
            <ListingRow key={row.id} row={row} index={index} />
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
    paddingHorizontal: PAD,
    marginBottom: 18,
  },
  metaLeft: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#6b6b6b' },
  metaRight: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: '#595959' },
  list: { paddingHorizontal: PAD, gap: CARD_GAP },
  row: {
    flexDirection: 'row',
    minHeight: 128,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.18)',
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
  },
  statusLive: { backgroundColor: '#000000' },
  statusSold: { backgroundColor: '#3a3a3a' },
  statusText: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: '#fff', letterSpacing: 0.35, textTransform: 'uppercase' },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  locIcon: { marginTop: 0 },
  suburb: { fontSize: 13, fontWeight: '400', color: 'rgba(0, 0, 0, 0.65)', lineHeight: 19 },
  price: { marginTop: 10, fontSize: 17, fontFamily: 'Satoshi-Medium', color: '#000000', lineHeight: 24 },
  features: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 },
  feat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featNum: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.65)', lineHeight: 18 },
});
