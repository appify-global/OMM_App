import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Archive listing confirmation.
 * [Figma 1053:9411](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-9411&t=2eZigRM0BwNtC5wd-4)
 */

const H_PAD = 20;
const FIELD_RADIUS = 12;
const ACCENT = '#C07A50';

const DASH = {
  borderWidth: 1.5,
  borderColor: 'rgba(60,60,67,0.45)',
  borderStyle: 'dashed' as const,
  backgroundColor: '#fff',
};

const BULLETS = [
  'Listing becomes invisible to buyers',
  'Removed from search results',
  'Can be restored anytime',
];

export default function ArchiveListingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.title}>Archive listing</Text>

        <Text style={styles.lead}>
          Archiving hides <Text style={styles.leadBold}>Hawthorn City Center</Text> from active search.
          Buyers will no longer see it. You can restore it later from archived listings.
        </Text>

        <View style={[styles.infoCard, DASH]}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="alert-circle" size={22} color={ACCENT} />
            <Text style={styles.infoTitle}>Your data is preserved</Text>
          </View>
          <Text style={styles.infoBody}>
            This does not delete your listing data. All photos, details, and performance history remain
            accessible.
          </Text>
        </View>

        <View style={[styles.infoCard, DASH]}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="archive-outline" size={22} color="rgba(60,60,67,0.45)" />
            <Text style={styles.infoTitle}>What happens when you archive</Text>
          </View>
          {BULLETS.map((line, i) => (
            <View
              key={line}
              style={[styles.bulletRow, i === BULLETS.length - 1 && styles.bulletRowLast]}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.archiveBtn}
          onPress={() => router.back()}
          accessibilityRole="button">
          <Text style={styles.archiveBtnText}>ARCHIVE LISTING</Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          style={styles.cancelWrap}
          accessibilityRole="button"
          accessibilityLabel="Cancel">
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: H_PAD, paddingTop: 4 },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1c1c1e',
    letterSpacing: -0.6,
    marginBottom: 14,
  },
  lead: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(60,60,67,0.55)',
    lineHeight: 22,
    marginBottom: 20,
  },
  leadBold: { fontWeight: '700', color: '#1c1c1e' },
  infoCard: {
    borderRadius: FIELD_RADIUS,
    padding: 16,
    marginBottom: 14,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#1c1c1e', flex: 1 },
  infoBody: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(60,60,67,0.55)',
    lineHeight: 21,
    paddingLeft: 32,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
    paddingLeft: 32,
  },
  bulletRowLast: { marginBottom: 0 },
  bulletDot: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(60,60,67,0.45)',
    lineHeight: 21,
    marginTop: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(60,60,67,0.55)',
    lineHeight: 21,
  },
  archiveBtn: {
    backgroundColor: '#1c1c1e',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  archiveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.45,
  },
  cancelWrap: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  cancel: { fontSize: 15, fontWeight: '500', color: 'rgba(60,60,67,0.55)' },
});
