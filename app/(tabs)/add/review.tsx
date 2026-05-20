import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Text } from '@/components/OMMText';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  PL_PAD,
  PL_BODY,
  PL_BORDER,
  PL_CARD,
  PL_CTA,
  PublishStepHeader,
  useListingFlowBottomPad,
} from '@/components/list-add/flow-shared';
import { useListingDraft } from '@/components/list-add/listing-draft-context';
import { useAgentPublishedListings } from '@/lib/agent-published-listings-context';
import {
  buildPublishedAgentListingPayload,
  formatListingPriceRangeDisplay,
} from '@/lib/agent-published-listings';
import {
  formatSellerInspectionAvailability,
  inspectionAvailabilityIsComplete,
} from '@/lib/listing-inspection-availability';
import type { StoredUserRole } from '@/lib/auth-session';
import { getUserRole } from '@/lib/auth-session';
import { DEMO_PRIMARY_SUBURB_LINE } from '@/lib/melbourne-demo-locations';
import { PROPERTY_IMG_1 } from '@/lib/propertyImages';
import { formatReferralEstimateLine, resolvePriceGuideRange } from '@/lib/referral-pricing';
import { loadSoiAttachment, type SoiAttachment } from '@/lib/soi-attachment';

export default function PublishListingReview() {
  const router = useRouter();
  const bottomPad = useListingFlowBottomPad();
  const {
    addressDisclosure,
    listingDetails,
    listingPriceFromAud,
    listingPriceToAud,
    draftPhotos,
    draftFloorPlan,
    referralSharePct,
    referralAssumedCommissionPct,
    publishFlowSoiChoice,
    inspectionAvailabilityTags,
    inspectionAvailabilityNotes,
    draftLastSavedAtIso,
    touchDraftSaved,
  } = useListingDraft();
  const { recordListing } = useAgentPublishedListings();
  const [publishing, setPublishing] = useState(false);
  const [soiAttachment, setSoiAttachment] = useState<SoiAttachment | null>(null);
  const [role, setRole] = useState<StoredUserRole | null | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void loadSoiAttachment().then((a) => {
        if (!cancelled) setSoiAttachment(a);
      });
      void getUserRole().then((r) => {
        if (!cancelled) setRole(r);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const previewAddress = listingDetails?.address?.trim()?.length
    ? listingDetails.address.trim()
    : DEMO_PRIMARY_SUBURB_LINE;

  const previewPrice = useMemo(
    () =>
      listingDetails?.address?.trim()?.length
        ? formatListingPriceRangeDisplay(listingPriceFromAud, listingPriceToAud)
        : '$2.0—2.2M',
    [listingDetails?.address, listingPriceFromAud, listingPriceToAud],
  );

  const heroSource = useMemo(() => {
    const uri = draftPhotos[0]?.uri?.trim();
    return uri?.length ? { uri } : PROPERTY_IMG_1;
  }, [draftPhotos]);

  const eligibleReferral = role !== 'Buyer Agent';

  const guide = useMemo(
    () => resolvePriceGuideRange(listingPriceFromAud, listingPriceToAud),
    [listingPriceFromAud, listingPriceToAud],
  );

  const referralFeeDisplay = useMemo(() => {
    if (!eligibleReferral) return '$0';
    return formatReferralEstimateLine(guide, referralSharePct, referralAssumedCommissionPct);
  }, [eligibleReferral, guide, referralSharePct, referralAssumedCommissionPct]);

  const soiDisplay = useMemo(() => {
    if (soiAttachment?.name?.trim()) return `${soiAttachment.name.trim()} • Attached`;
    if (publishFlowSoiChoice === 'auto') return 'Auto-generated • Attached';
    return 'Upload or generate SOI on step 3';
  }, [soiAttachment, publishFlowSoiChoice]);

  const inspectionAvailabilityDisplay = useMemo(
    () => formatSellerInspectionAvailability(inspectionAvailabilityTags, inspectionAvailabilityNotes),
    [inspectionAvailabilityTags, inspectionAvailabilityNotes],
  );

  const draftSavedLabel = useMemo(() => {
    if (!draftLastSavedAtIso) return null;
    const d = new Date(draftLastSavedAtIso);
    if (Number.isNaN(d.getTime())) return null;
    return `DRAFT SAVED AT ${d
      .toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })
      .toUpperCase()}`;
  }, [draftLastSavedAtIso]);

  const saveDraft = useCallback(() => {
    touchDraftSaved();
    Alert.alert('Draft saved', 'Your listing draft has been saved.');
  }, [touchDraftSaved]);

  const onPublish = useCallback(async () => {
    if (!listingDetails?.address?.trim()) {
      Alert.alert(
        'Property details missing',
        'Go back to step 1 and save the property address before publishing.',
      );
      return;
    }
    if (!inspectionAvailabilityIsComplete(inspectionAvailabilityTags, inspectionAvailabilityNotes)) {
      Alert.alert(
        'Inspection availability',
        'Go back to step 3 and tell buyers when they can inspect.',
      );
      return;
    }
    const sellerInspectionAvailability = formatSellerInspectionAvailability(
      inspectionAvailabilityTags,
      inspectionAvailabilityNotes,
    );
    setPublishing(true);
    try {
      const base = buildPublishedAgentListingPayload({
        details: listingDetails,
        listingPriceFromAud,
        listingPriceToAud,
        addressDisclosure,
        sellerInspectionAvailability,
        sellerInspectionAvailabilityTags: inspectionAvailabilityTags,
        sellerInspectionAvailabilityNotes: inspectionAvailabilityNotes.trim() || undefined,
      });
      const listingId = await recordListing({
        ...base,
        listingPhotos: draftPhotos.length > 0 ? draftPhotos : undefined,
        listingFloorPlan: draftFloorPlan ?? undefined,
      });
      router.push({
        pathname: '/add/listing-published',
        params: { listingId },
      } as Href);
    } catch {
      Alert.alert(
        'Could not publish',
        'Something went wrong saving your listing on this device. Try again.',
      );
    } finally {
      setPublishing(false);
    }
  }, [
    addressDisclosure,
    draftFloorPlan,
    draftPhotos,
    inspectionAvailabilityNotes,
    inspectionAvailabilityTags,
    listingDetails,
    listingPriceFromAud,
    listingPriceToAud,
    recordListing,
    router,
  ]);

  return (
    <View style={[styles.root, { paddingBottom: bottomPad }]}>
      <PublishStepHeader step={5} onBack={() => router.back()} onSaveDraft={saveDraft} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Review Listing</Text>

        <View style={styles.heroWrap}>
          <Image source={heroSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={styles.previewPill}>
            <Text style={styles.previewPillText}>PREVIEW</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.addrBlock}>
            <Text style={styles.label}>PROPERTY ADDRESS</Text>
            <Text style={styles.addrLine}>{previewAddress}</Text>
            <Text style={styles.addrVisibility}>
              {addressDisclosure === 'disclose'
                ? 'Full street address will be visible to buyers.'
                : 'Street address will not be shown on the listing — suburb / region only.'}
            </Text>
          </View>

          <View style={styles.row2}>
            <View style={styles.colHalf}>
              <Text style={styles.label}>LISTING PRICE</Text>
              <Text style={styles.value}>{previewPrice}</Text>
            </View>
            <View style={styles.colHalf}>
              <Text style={styles.label}>REFERRAL FEE</Text>
              <Text style={styles.value}>{referralFeeDisplay}</Text>
            </View>
          </View>

          <View style={styles.soiRow}>
            <View style={styles.soiIcon}>
              <FontAwesome name="check" size={12} color="#fff" />
            </View>
            <View style={styles.soiCopy}>
              <Text style={styles.label}>STATEMENT OF INFORMATION</Text>
              <Text style={styles.soiSub}>{soiDisplay}</Text>
            </View>
          </View>

          <View style={styles.inspectReviewRow}>
            <View style={styles.soiIcon}>
              <FontAwesome name="calendar" size={12} color="#fff" />
            </View>
            <View style={styles.soiCopy}>
              <Text style={styles.label}>INSPECTION AVAILABILITY</Text>
              <Text style={styles.soiSub}>{inspectionAvailabilityDisplay}</Text>
            </View>
          </View>

          <View style={styles.rule} />

          <Text style={styles.ready}>READY TO GO?</Text>

          <Text style={styles.legal}>
            By publishing, you confirm property data, photos, SOI, and authority documents are accurate and comply with
            Victorian regulations.
          </Text>

          <View style={styles.draftRow}>
            <FontAwesome name="clock-o" size={14} color="rgba(0, 0, 0, 0.45)" />
            <Text style={styles.draftMeta}>
              {draftSavedLabel ?? 'SAVE DRAFT FROM THE HEADER TO TIMESTAMP PROGRESS'}
            </Text>
          </View>
        </View>
        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.ctaWrap}>
        <Pressable
          onPress={() => void onPublish()}
          style={[styles.publishBtn, publishing && { opacity: 0.55 }]}
          accessibilityRole="button"
          disabled={publishing}
        >
          <Text style={styles.publishLabel}>
            {publishing ? 'PUBLISHING…' : 'PUBLISH LISTING'}
          </Text>
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
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    marginLeft: PL_PAD,
    marginBottom: 12,
    marginTop: 8,
  },
  heroWrap: {
    width: '100%',
    height: 256,
    backgroundColor: 'rgba(0,0,0,0.06)',
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
  previewPillText: { color: '#fff', fontSize: 11, fontFamily: 'Satoshi-Medium', letterSpacing: 0.55 },
  body: { paddingHorizontal: PL_PAD, paddingTop: 24 },
  addrBlock: { marginBottom: 24 },
  label: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: PL_BORDER,
    letterSpacing: 0.45,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  addrLine: { fontSize: 24, fontFamily: 'Satoshi-Medium', color: PL_BODY, letterSpacing: -0.5, lineHeight: 30 },
  addrVisibility: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: 18,
    marginTop: 8,
  },
  row2: { flexDirection: 'row', gap: 24, marginBottom: 24 },
  colHalf: { flex: 1, minWidth: 0 },
  value: { fontSize: 20, fontFamily: 'Satoshi-Medium', color: PL_BODY },
  soiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 8 },
  inspectReviewRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
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
    fontFamily: 'Satoshi-Medium',
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
    flex: 1,
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
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
  publishLabel: { color: PL_BODY, fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.35 },
});
