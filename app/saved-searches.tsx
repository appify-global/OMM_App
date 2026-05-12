import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import { Text } from '@/components/OMMText';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';

type SavedItem = {
  name: string;
  criteria: string;
  badge?: string;
  alertsOn: boolean;
  meta: string;
};

const SAVED_SEARCHES: SavedItem[] = [
  {
    name: 'Port Melbourne Townhouses',
    badge: '2 NEW',
    criteria: '3+ beds • Apartment • $4M+',
    alertsOn: true,
    meta: 'Yesterday',
  },
  {
    name: 'Carlton North Family',
    criteria: '4+ beds • House • $2.5M—3.5M',
    alertsOn: false,
    meta: 'Paused 3d ago',
  },
  {
    name: 'Altona Coastal',
    badge: '2 NEW',
    criteria: '3+ beds • Apartment • $4M+',
    alertsOn: true,
    meta: 'Yesterday',
  },
  {
    name: 'Essendon Heritage',
    criteria: '4+ beds • House • $2.5M—3.5M',
    alertsOn: false,
    meta: 'Paused 3d ago',
  },
];

function SavedSearchListCard({ item, onPress }: { item: SavedItem; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      {item.badge ? (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>{item.badge}</Text>
        </View>
      ) : null}
      <Text style={styles.cardCriteria}>{item.criteria}</Text>
      <View style={styles.cardDivider} />
      <View style={styles.cardFooter}>
        <Text style={styles.footerAlerts}>
          <Text style={item.alertsOn ? styles.footerDotOn : styles.footerDotOff}>●</Text>
          <Text style={styles.footerAlertsLabel}>
            {' '}
            {item.alertsOn ? 'ALERTS ON' : 'ALERTS OFF'}
          </Text>
        </Text>
        <Text style={styles.footerMeta}>{item.meta}</Text>
      </View>
    </Pressable>
  );
}

export default function SavedSearchesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleGoToResults = () => {
    const href = `/(tabs)?openBuyingSearch=results&_ts=${Date.now()}` as Href;
    router.replace(href);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.headerSide}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
        <Text style={styles.headerTitle}>Saved Searches</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <AppButton
          variant="filled"
          onPress={handleGoToResults}
          textStyle={styles.newSearchBtnText}
          style={styles.newSearchBtn}>
          + NEW SEARCH
        </AppButton>
        <Text style={styles.helper}>
          Get notified the moment a listing or off-market matches your brief.
        </Text>

        <View style={styles.listMetaRow}>
          <Text style={styles.countLabel}>4 active searches</Text>
          <Text style={styles.sortLabel}>SORT • NEWEST</Text>
        </View>

        {SAVED_SEARCHES.map((item) => (
          <View key={item.name} style={styles.cardGap}>
            <SavedSearchListCard item={item} onPress={handleGoToResults} />
          </View>
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
    paddingBottom: 12,
  },
  headerSide: { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  scroll: { paddingHorizontal: 20 },
  newSearchBtn: { marginTop: 4 },
  newSearchBtnText: { fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.6 },
  helper: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    lineHeight: 20,
  },
  listMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
  },
  countLabel: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)' },
  sortLabel: { fontSize: 11, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)', letterSpacing: 0.4 },
  cardGap: { marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
  },
  cardPressed: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  cardTitle: { fontSize: 17, fontFamily: 'Satoshi-Medium', color: '#000000' },
  newBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBadgeText: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: '#fff' },
  cardCriteria: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)', marginTop: 10 },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    marginTop: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  footerAlerts: { fontSize: 12, fontFamily: 'Satoshi-Medium', letterSpacing: 0.3 },
  footerDotOn: { color: '#000000' },
  footerDotOff: { color: 'rgba(0, 0, 0, 0.35)' },
  footerAlertsLabel: { color: 'rgba(0, 0, 0, 0.55)' },
  footerMeta: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)' },
});
