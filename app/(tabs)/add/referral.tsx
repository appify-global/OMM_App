import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text } from '@/components/OMMText';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { StoredUserRole } from '@/lib/auth-session';
import { getUserRole } from '@/lib/auth-session';
import {
  ILLUSTRATIVE_COMMISSION_OF_SALE_PCT,
  formatAudWhole,
  formatReferralEstimateLine,
  resolvePriceGuideRange,
} from '@/lib/referral-pricing';

import {
  PL_PAD,
  PL_BORDER,
  PL_CARD,
  PrimaryCta,
  PublishStepHeader,
  dashedShell,
  useListingFlowBottomPad,
} from './_shared';
import { useListingDraft } from './listing-draft-context';

const COMMISSION_ASSUMPTION_PRESETS = [2.0, 2.2, 2.5, 2.75, 3.0] as const;

const SLIDER_MIN_ELIGIBLE = 10;
const SLIDER_MAX = 100;

export default function PublishListingReferral() {
  const router = useRouter();
  const bottomPad = useListingFlowBottomPad();
  const { listingPriceFromAud, listingPriceToAud } = useListingDraft();

  const [pct, setPct] = useState(25);
  const [commissionModalOpen, setCommissionModalOpen] = useState(false);
  const [assumedCommissionPct, setAssumedCommissionPct] = useState(ILLUSTRATIVE_COMMISSION_OF_SALE_PCT);
  const [role, setRole] = useState<StoredUserRole | null | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getUserRole().then((r) => {
        if (!cancelled) setRole(r);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const isBuyerAgent = role === 'Buyer Agent';
  const eligibleReferral = role !== 'Buyer Agent';

  useEffect(() => {
    if (role === undefined) return;
    if (isBuyerAgent) {
      setPct(0);
      return;
    }
    setPct((p) => {
      if (p < SLIDER_MIN_ELIGIBLE) return SLIDER_MIN_ELIGIBLE;
      if (p > SLIDER_MAX) return SLIDER_MAX;
      return p;
    });
  }, [role, isBuyerAgent]);

  const guide = useMemo(
    () => resolvePriceGuideRange(listingPriceFromAud, listingPriceToAud),
    [listingPriceFromAud, listingPriceToAud],
  );

  const earnLine = useMemo(() => {
    if (!eligibleReferral) return '$0';
    return formatReferralEstimateLine(guide, pct, assumedCommissionPct);
  }, [eligibleReferral, guide, pct, assumedCommissionPct]);

  const earnSub = useMemo(() => {
    if (!eligibleReferral) {
      return "Buyer's agents don't receive listing-agent referral fees on OMM, so this step stays at 0%. This avoids double‑dipping with buyer-side arrangements.";
    }
    if (!guide) {
      return `Estimates: price guide × ${assumedCommissionPct}% illustrative commission on sale → referral % of that commission pool. Not % of the sale price. Replace the ${assumedCommissionPct}% figure with your authority when linked.`;
    }
    if (guide.lowAud === guide.highAud) {
      return `Guide ${formatAudWhole(guide.lowAud)} · pool uses ${assumedCommissionPct}% of sale as illustrative total commission · referral is ${pct}% of that pool · whole dollars (GST per agreement).`;
    }
    return `Guide ${formatAudWhole(guide.lowAud)} — ${formatAudWhole(guide.highAud)} · illustrative commission ${assumedCommissionPct}% of sale · referral ${pct}% of that pool · whole dollars (GST per agreement).`;
  }, [eligibleReferral, guide, assumedCommissionPct, pct]);

  const heroFoot = useMemo(() => {
    if (isBuyerAgent) return 'Referral offers are disabled for buyer agent accounts.';
    if (role === 'Vendor Agent') {
      return 'Vendor advocates may earn referral fees when referring buyers. Typical referral share is 25–30% of the listing agent’s commission pool — not 25–30% of the sale price.';
    }
    return 'Typical referral share: 25–30% of commission pool · Slider is % of your commission (max 100% of that pool), not % of sale price.';
  }, [isBuyerAgent, role]);

  const saveDraft = useCallback(() => {
    Alert.alert('Draft saved', 'Your listing draft has been saved.');
  }, []);

  return (
    <View style={[styles.root, { paddingBottom: bottomPad }]}>
      <PublishStepHeader step={4} onBack={() => router.back()} onSaveDraft={saveDraft} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Referral Fee</Text>

        {isBuyerAgent ? (
          <View style={styles.policyCallout}>
            <FontAwesome name="info-circle" size={16} color="rgba(0,0,0,0.55)" style={styles.policyIcon} />
            <Text style={styles.policyText}>
              Platform rule: listing referral fees are not paid to buyer&apos;s agents. Continue with 0% or go back if
              you reached this flow in error.
            </Text>
          </View>
        ) : null}

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>REFERRAL FEE</Text>
            {eligibleReferral ? (
              <View style={styles.recBadge}>
                <Text style={styles.recBadgeText}>REC: 25% OF POOL</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.heroPctRow}>
            <Text style={styles.heroPct}>{pct}</Text>
            <Text style={styles.heroPctSuffix}>%</Text>
          </View>
          {eligibleReferral ? (
            <Text style={styles.heroPctCaption}>of listing agent commission pool</Text>
          ) : null}
          <View style={styles.heroRule} />
          <Text style={styles.heroFoot}>{heroFoot}</Text>
        </View>

        {eligibleReferral ? (
          <>
            <View style={styles.sliderBlock}>
              <Slider
                style={styles.slider}
                minimumValue={SLIDER_MIN_ELIGIBLE}
                maximumValue={SLIDER_MAX}
                step={1}
                value={pct}
                onValueChange={setPct}
                minimumTrackTintColor="#000000"
                maximumTrackTintColor="rgba(0,0,0,0.06)"
                thumbTintColor="#fff"
              />
              <View style={styles.tickRow}>
                {['10%', '25%', '50%', '75%', '100%'].map((t) => (
                  <Text key={t} style={styles.tick}>
                    {t}
                  </Text>
                ))}
              </View>
            </View>

            <Text style={styles.rulesNote}>
              Eligible referrers include vendor advocates and co-agents. Not payable to buyer&apos;s agents (no
              double‑dipping).
            </Text>

            <Pressable
              style={[styles.assumptionRow, dashedShell]}
              onPress={() => setCommissionModalOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Change illustrative commission percent">
              <Text style={styles.assumptionText}>
                Illustrative commission on sale: {assumedCommissionPct}% (until authority is linked){' '}
                <Text style={styles.assumptionChange}>Change</Text>
              </Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.sliderDisabledHint}>
            <Text style={styles.sliderDisabledText}>Slider disabled — referral set to 0% for buyer agents.</Text>
          </View>
        )}

        <View style={styles.earnCard}>
          <Text style={styles.earnKicker}>
            {eligibleReferral ? 'ESTIMATED REFERRAL (AUD)' : 'REFERRAL (AUD)'}
          </Text>
          <Text style={styles.earnBig} numberOfLines={2}>
            {earnLine}
          </Text>
          <Text style={styles.earnSub}>{earnSub}</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={{ paddingBottom: 6 }}>
        <PrimaryCta label="CONTINUE" onPress={() => router.push('/add/review' as Href)} />
      </View>

      <Modal visible={commissionModalOpen} transparent animationType="fade">
        <Pressable style={styles.modalScrim} onPress={() => setCommissionModalOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Illustrative commission (% of sale)</Text>
            <Text style={styles.modalHint}>
              Used only until your authority supplies gross commission. Referral % always applies to that commission
              pool — never directly to the sale price.
            </Text>
            {COMMISSION_ASSUMPTION_PRESETS.map((c) => (
              <Pressable
                key={c}
                style={styles.modalOpt}
                onPress={() => {
                  setAssumedCommissionPct(c);
                  setCommissionModalOpen(false);
                }}>
                <Text style={styles.modalOptText}>
                  {c}% {c === assumedCommissionPct ? '· current' : ''}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingTop: 12, paddingHorizontal: PL_PAD, paddingBottom: 16 },
  pageTitle: { fontSize: 24, fontFamily: 'Satoshi-Medium', color: '#000', marginBottom: 20 },

  policyCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginBottom: 16,
  },
  policyIcon: { marginTop: 2 },
  policyText: { flex: 1, fontSize: 13, fontFamily: 'Satoshi-Medium', color: 'rgba(0,0,0,0.75)', lineHeight: 19 },

  heroCard: {
    backgroundColor: PL_CARD,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    minHeight: 225,
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0.55,
  },
  recBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  recBadgeText: { fontSize: 11, fontFamily: 'Satoshi-Medium', color: '#fff', letterSpacing: 0.35 },
  heroPctRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 16 },
  heroPct: {
    fontSize: 72,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: -2,
    lineHeight: 80,
  },
  heroPctSuffix: {
    fontSize: 36,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    marginBottom: 14,
    marginLeft: 2,
  },
  heroPctCaption: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(255,255,255,0.88)',
    marginTop: -6,
    marginBottom: 6,
    lineHeight: 18,
  },
  heroRule: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(248,248,248,0.14)',
    marginTop: 20,
    paddingTop: 16,
  },
  heroFoot: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 0.35,
    lineHeight: 17,
  },

  sliderBlock: { marginBottom: 12 },
  slider: { width: '100%', height: 36 },
  tickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  tick: { fontSize: 11, fontFamily: 'Satoshi-Medium', color: PL_BORDER },

  rulesNote: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0,0,0,0.5)',
    lineHeight: 17,
    marginBottom: 12,
  },

  assumptionRow: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderRadius: 14,
  },
  assumptionText: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: 'rgba(0,0,0,0.55)', lineHeight: 18 },
  assumptionChange: { fontFamily: 'Satoshi-Medium', color: '#000', textDecorationLine: 'underline' },

  sliderDisabledHint: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  sliderDisabledText: { fontSize: 13, color: 'rgba(0,0,0,0.45)', fontFamily: 'Satoshi-Medium' },

  earnCard: {
    backgroundColor: PL_CARD,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 22,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
  earnKicker: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.55,
    marginBottom: 10,
    lineHeight: 16,
  },
  earnBig: { fontSize: 28, fontFamily: 'Satoshi-Medium', color: '#fff', lineHeight: 38 },
  earnSub: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.96,
    marginTop: 10,
    lineHeight: 22,
  },

  modalScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: { fontSize: 16, fontFamily: 'Satoshi-Medium', marginBottom: 8 },
  modalHint: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.55)',
    lineHeight: 17,
    marginBottom: 14,
    fontFamily: 'Satoshi-Medium',
  },
  modalOpt: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)' },
  modalOptText: { fontSize: 16, color: '#000000' },
});
