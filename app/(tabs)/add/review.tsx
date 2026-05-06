import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  PL_PAD,
  PL_BODY,
  PL_BORDER,
  PL_CARD,
  PL_CTA,
  PublishStepHeader,
  useListingFlowBottomPad,
} from './_shared';

const DEMO = {
  address: 'Hawthorn City Center, Victoria',
  price: '$2.0—2.2M',
  referralFee: '$500—550K',
  soi: 'Auto-generated • Attached',
};

export default function PublishListingReview() {
  const router = useRouter();
  const bottomPad = useListingFlowBottomPad();

  const saveDraft = useCallback(() => {
    Alert.alert('Draft saved', 'Your listing draft has been saved.');
  }, []);

  return (
    <View style={[styles.root, { paddingBottom: bottomPad }]}>
      <PublishStepHeader step={5} onBack={() => router.back()} onSaveDraft={saveDraft} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Review Listing</Text>

        <View style={styles.heroWrap}>
          <Image
            source={require('@/assets/images/welcome-bg.jpg')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={styles.previewPill}>
            <Text style={styles.previewPillText}>PREVIEW</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.addrBlock}>
            <Text style={styles.label}>PROPERTY ADDRESS</Text>
            <Text style={styles.addrLine}>{DEMO.address}</Text>
          </View>

          <View style={styles.row2}>
            <View style={styles.colHalf}>
              <Text style={styles.label}>LISTING PRICE</Text>
              <Text style={styles.value}>{DEMO.price}</Text>
            </View>
            <View style={styles.colHalf}>
              <Text style={styles.label}>REFERRAL FEE</Text>
              <Text style={styles.value}>{DEMO.referralFee}</Text>
            </View>
          </View>

          <View style={styles.soiRow}>
            <View style={styles.soiIcon}>
              <FontAwesome name="check" size={12} color="#fff" />
            </View>
            <View style={styles.soiCopy}>
              <Text style={styles.label}>STATEMENT OF INFORMATION</Text>
              <Text style={styles.soiSub}>{DEMO.soi}</Text>
            </View>
          </View>

          <View style={styles.rule} />

          <Text style={styles.ready}>READY TO GO?</Text>

          <Text style={styles.legal}>
            By publishing, you confirm property data, photos, SOI, and authority documents are accurate and comply with
            Victorian regulations.
          </Text>

          <View style={styles.draftRow}>
            <FontAwesome name="clock-o" size={14} color="rgba(60,60,67,0.45)" />
            <Text style={styles.draftMeta}>DRAFT SAVED AT 10:45 AM</Text>
          </View>
        </View>
        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.ctaWrap}>
        <Pressable
          onPress={() => router.push('/add/listing-published' as Href)}
          style={styles.publishBtn}
          accessibilityRole="button">
          <Text style={styles.publishLabel}>PUBLISH LISTING</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: 16 },
  pageTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#000',
    marginLeft: PL_PAD,
    marginBottom: 12,
    marginTop: 8,
  },
  heroWrap: {
    width: '100%',
    height: 256,
    backgroundColor: '#e8e4df',
    overflow: 'hidden',
  },
  previewPill: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: PL_CARD,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 4,
  },
  previewPillText: { color: '#fff', fontSize: 11, fontWeight: '600', letterSpacing: 0.55 },
  body: { paddingHorizontal: PL_PAD, paddingTop: 24 },
  addrBlock: { marginBottom: 24 },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: PL_BORDER,
    letterSpacing: 0.45,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  addrLine: { fontSize: 24, fontWeight: '600', color: PL_BODY, letterSpacing: -0.5, lineHeight: 30 },
  row2: { flexDirection: 'row', gap: 24, marginBottom: 24 },
  colHalf: { flex: 1, minWidth: 0 },
  value: { fontSize: 20, fontWeight: '600', color: PL_BODY },
  soiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 8 },
  soiCopy: { flex: 1, minWidth: 0 },
  soiIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: PL_CARD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  soiSub: { fontSize: 14, fontWeight: '400', color: PL_BODY, marginTop: 4, lineHeight: 20 },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: '#c6c6c8', marginTop: 20, marginBottom: 24 },
  ready: {
    fontSize: 11,
    fontWeight: '600',
    color: PL_BODY,
    letterSpacing: 2.5,
    marginBottom: 12,
  },
  legal: {
    fontSize: 14,
    color: '#474747',
    lineHeight: 22,
    marginBottom: 20,
  },
  draftRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  draftMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(60,60,67,0.45)',
    letterSpacing: 0.35,
  },

  ctaWrap: { paddingBottom: 6 },
  publishBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: PL_CTA,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: PL_PAD,
  },
  publishLabel: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 0.35 },
});
