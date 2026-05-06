import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';

/**
 * Vendor / seller match detail.
 * [Figma 1053:7134](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-7134&t=gEfFuYKIwBHVUzXh-4)
 */

const AVATAR = require('@/assets/images/welcome-bg.jpg');

const PAD = 20;

function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const DEMO_VENDOR = {
  name: 'Jane Doe',
  role: 'Vendor · selling with AZ Real Estate',
  address: 'No 132, Barkers Rd, Kew, Melbourne, Victoria',
  asking: '$1.80m',
  summary: 'Renovated townhouse · 4 bed · 3 bath · 2 car · land 320m²',
  listingStatus: 'Off-market · exclusive authority · SOI published',
  settlement: '60–90 days · vendor flexible for strong offer',
  keyPoints: 'North-facing living · premium kitchen · walk to schools & Barkers Rd retail',
  avoid: 'Subject to vendor terms',
};

export default function SellerMatchDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backBtn}>
          <FontAwesome name="chevron-left" size={20} color="#1c1c1e" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.profileBlock}>
          <Image source={AVATAR} style={styles.avatar} resizeMode="cover" />
          <Text style={styles.name}>{DEMO_VENDOR.name}</Text>
          <Text style={styles.role}>{DEMO_VENDOR.role}</Text>
        </View>

        <Text style={styles.sectionKicker}>WHAT THEY ARE LOOKING FOR</Text>

        <View style={styles.card}>
          <FieldBlock label="ADDRESS" value={DEMO_VENDOR.address} />
          <FieldBlock label="ASKING PRICE" value={DEMO_VENDOR.asking} />
          <FieldBlock label="PROPERTY SUMMARY" value={DEMO_VENDOR.summary} />
          <FieldBlock label="LISTING STATUS" value={DEMO_VENDOR.listingStatus} />
          <FieldBlock label="SETTLEMENT PREFERENCE" value={DEMO_VENDOR.settlement} />
          <FieldBlock label="KEY POINTS" value={DEMO_VENDOR.keyPoints} />
          <FieldBlock label="AVOID" value={DEMO_VENDOR.avoid} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <AppButton
          variant="filled"
          onPress={() => router.push('/contact-seller-chat' as Href)}
          textStyle={styles.contactLabel}>
          Contact Seller
        </AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  topBar: { paddingHorizontal: PAD, paddingVertical: 8 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  scroll: { paddingHorizontal: PAD, paddingTop: 8 },
  profileBlock: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#e8e4df',
    marginBottom: 14,
  },
  name: { fontSize: 22, fontWeight: '700', color: '#1c1c1e' },
  role: { fontSize: 14, fontWeight: '500', color: 'rgba(60,60,67,0.55)', marginTop: 6, textAlign: 'center' },
  sectionKicker: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(60,60,67,0.45)',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#f5f1eb',
    borderRadius: 14,
    padding: 18,
    gap: 18,
  },
  fieldBlock: { gap: 6 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(60,60,67,0.45)',
    letterSpacing: 0.35,
  },
  fieldValue: { fontSize: 15, fontWeight: '500', color: '#1c1c1e', lineHeight: 22 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: PAD,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(60,60,67,0.08)',
  },
  contactLabel: { fontSize: 16, fontWeight: '600' },
});
