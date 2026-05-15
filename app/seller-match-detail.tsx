import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { frost, layout, slateNavy } from '@/constants/theme';
import { AppButton } from '@/components/AppButton';
import { ContactSellerOptionsSheet } from '@/components/ContactSellerOptionsSheet';
import { SellerContactSheet } from '@/components/SellerContactSheet';

/**
 * Vendor / seller match detail.
 * [Figma 1053:7134](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-7134&t=gEfFuYKIwBHVUzXh-4)
 */

import { PROPERTY_IMG_1 } from '@/lib/propertyImages';


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
  role: 'Real Estate Agent · selling with AZ Real Estate',
  contactEmail: 'jane.doe@azrealestate.com.au',
  address: 'Unit 2/55 Sydney Rd, Brunswick VIC 3056',
  asking: '$1.80m',
  summary: 'Renovated townhouse · 4 bedrooms · 3 bathrooms · 2 car spaces · land 320m²',
  listingStatus: 'Off-market · exclusive authority · SOI published',
  settlement: '60–90 days · vendor flexible for strong offer',
  keyPoints: 'North-facing living · premium kitchen · walk to schools & Sydney Rd retail',
  avoid: 'Subject to vendor terms',
};

export default function SellerMatchDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const [contactSheetOpen, setContactSheetOpen] = useState(false);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backBtn}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.profileBlock}>
          <Image source={PROPERTY_IMG_1} style={styles.avatar} resizeMode="cover" />
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
          onPress={() => setContactMenuOpen(true)}
          textStyle={styles.contactLabel}>
          Contact Seller
        </AppButton>
      </View>

      <ContactSellerOptionsSheet
        visible={contactMenuOpen}
        onClose={() => setContactMenuOpen(false)}
        onMessageSeller={() => {
          setContactMenuOpen(false);
          router.push('/contact-seller-chat' as Href);
        }}
        onContactInfo={() => {
          setContactMenuOpen(false);
          setContactSheetOpen(true);
        }}
      />

      <SellerContactSheet
        visible={contactSheetOpen}
        onClose={() => setContactSheetOpen(false)}
        title="Contact details"
        hint="Reach this seller using the details below."
        displayName={DEMO_VENDOR.name}
        email={DEMO_VENDOR.contactEmail}
        showPhone={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  topBar: { paddingHorizontal: layout.screenGutter, paddingVertical: 8 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  scroll: { paddingHorizontal: layout.screenGutter, paddingTop: 8 },
  profileBlock: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginBottom: 14,
  },
  name: { fontSize: 22, fontFamily: 'Satoshi-Medium', color: '#000000' },
  role: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)', marginTop: 6, textAlign: 'center' },
  sectionKicker: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  card: {
    backgroundColor: slateNavy,
    borderRadius: 11,
    padding: 18,
    gap: 18,
  },
  fieldBlock: { gap: 6 },
  fieldLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(248, 250, 252, 0.55)',
    letterSpacing: 0.35,
  },
  fieldValue: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: frost, lineHeight: 22 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  contactLabel: { fontSize: 16, fontFamily: 'Satoshi-Medium' },
});
