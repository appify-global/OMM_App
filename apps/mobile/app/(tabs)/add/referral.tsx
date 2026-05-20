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
  formatCommissionPoolLine,
  formatReferralEstimateLine,
  referralFeeMidEstimateAud,
  resolvePriceGuideRange,
} from '@/lib/referral-pricing';

import {
  PL_PAD,
  PL_BORDER,
  PL_CARD,
  PrimaryCta,
  PublishStepHeader,
  fieldShell,
  useListingFlowBottomPad,
} from './_shared';
import { useListingDraft } from './listing-draft-context';

const COMMISSION_ASSUMPTION_PRESETS = [2.0, 2.2, 2.5, 2.75, 3.0] as const;

const SLIDER_MIN_ELIGIBLE = 10;
const SLIDER_MAX = 100;
const SLIDER_TICK_PCTS = [10, 25, 50, 75, 100] as const;

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
      return "Buyer's agents don't receive listing-agent referral fees on OMM ($0). This avoids double‑dipping with buyer-side arrangements.";
    }
    if (!guide) {
      return 'Set a listing price on step 1 to see dollar estimates. Amounts update from your guide and an illustrative gross commission until your authority is linked (GST per your agreement).';
    }
    const poolLine = formatCommissionPoolLine(guide, assumedCommissionPct);
    if (guide.lowAud === guide.highAud) {
      return `Sale guide ${formatAudWhole(guide.lowAud)} · illustrative commission pool about ${poolLine} · referral share you set below applies to that pool · whole dollars (GST per agreement).`;
    }
    return `Sale guide ${formatAudWhole(guide.lowAud)} - ${formatAudWhole(guide.highAud)} · illustrative commission pool about ${poolLine} · figures update as you move the slider · GST per agreement.`;
  }, [eligibleReferral, guide, assumedCommissionPct]);

  const heroFoot = useMemo(() => {
    if (isBuyerAgent) return 'Referral offers are disabled for buyer agent accounts.';
    if (role === 'Vendor advocate') {
      return 'Vendor advocates: typical introductory referral sits around the mid‑range of the slider; final dollars follow your authority and settlement.';
    }
    return 'Use the slider to change your share of the illustrative commission pool. Dollar outcomes above update immediately from your listing guide.';
  }, [isBuyerAgent, role]);

  const recDollarBadge = useMemo(() => {
    if (!eligibleReferral || !guide) return null;
    return formatAudWhole(referralFeeMidEstimateAud(guide, 25, assumedCommissionPct));
  }, [eligibleReferral, guide, assumedCommissionPct]);

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
              Platform rule: listing referral fees are not paid to buyer&apos;s agents ($0). Go back if you reached
              this flow in error.
            </Text>
          </View>
        ) : null}

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>ESTIMATED REFERRAL (AUD)</Text>
            {eligibleReferral && recDollarBadge ? (
              <View style={styles.recBadge}>
                <Text style={styles.recBadgeText}>REC · {recDollarBadge}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.heroAud} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.65}>
            {eligibleReferral ? earnLine : '$0'}
          </Text>
          <Text style={styles.heroAudCaption}>Whole dollars · illustrative until authority is linked</Text>
          <View style={styles.heroRule} />
          {eligibleReferral && guide ? (
            <Text style={styles.heroPool}>
              Illustrative commission pool: {formatCommissionPoolLine(guide, assumedCommissionPct)}
            </Text>
          ) : null}
          <Text style={styles.heroFoot}>{heroFoot}</Text>
        </View>

        {eligibleReferral ? (
          <>
            <View style={styles.sliderBlock}>
              <Text style={styles.sliderLabel}>Your share of the commission pool - dollar markers at your price guide</Text>
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
                {SLIDER_TICK_PCTS.map((tickPct) => {
                  const label =
                    guide != null
                      ? formatAudWhole(referralFeeMidEstimateAud(guide, tickPct, assumedCommissionPct))
                      : '-';
                  return (
                    <Text key={tickPct} style={styles.tick} numberOfLines={1}>
                      {label}
                    </Text>
                  );
                })}
              </View>
            </View>

            <Text style={styles.rulesNote}>
              Eligible referrers include vendor advocates and co-agents. Not payable to buyer&apos;s agents (no
              double‑dipping).
            </Text>

            <Pressable
              style={[styles.assumptionRow, fieldShell]}
              onPress={() => setCommissionModalOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Change illustrative gross commission basis">
              <Text style={styles.assumptionText}>
                Illustrative gross commission:{' '}
                {guide != null ? formatCommissionPoolLine(guide, assumedCommissionPct) : 'set price on step 1'} ·{' '}
                <Text style={styles.assumptionChange}>Change basis</Text>
              </Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.sliderDisabledHint}>
            <Text style={styles.sliderDisabledText}>Referral fee is $0 for buyer agent accounts.</Text>
          </View>
        )}

        <View style={styles.detailCard}>
          <Text style={styles.detailKicker}>DETAIL</Text>
          <Text style={styles.detailBody}>{earnSub}</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={{ paddingBottom: 6 }}>
        <PrimaryCta label="CONTINUE" onPress={() => router.push('/add/review' as Href)} />
      </View>

      <Modal visible={commissionModalOpen} transparent animationType="fade">
        <Pressable style={styles.modalScrim} onPress={() => setCommissionModalOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Illustrative gross commission (AUD)</Text>
            <Text style={styles.modalHint}>
              Choose a basis until your authority supplies gross commission. Dollar pool below is computed from your
              listing guide; referral estimates use that pool - not the sale price directly.
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
                  {guide != null ? formatCommissionPoolLine(guide, c) : '-'}
                  {c === assumedCommissionPct ? ' · current' : ''}
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
  recBadgeText: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: '#fff', letterSpacing: 0.2 },
  heroAud: {
    fontSize: 40,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: -0.8,
    lineHeight: 46,
    marginTop: 12,
  },
  heroAudCaption: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(255,255,255,0.82)',
    marginTop: 8,
    lineHeight: 17,
  },
  heroPool: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(255,255,255,0.92)',
    marginTop: 14,
    lineHeight: 19,
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
  sliderLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0,0,0,0.55)',
    marginBottom: 10,
    lineHeight: 17,
  },
  slider: { width: '100%', height: 36 },
  tickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 4 },
  tick: { flex: 1, fontSize: 9, fontFamily: 'Satoshi-Medium', color: PL_BORDER, textAlign: 'center' },

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

  detailCard: {
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 24,
  },
  detailKicker: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0,0,0,0.5)',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  detailBody: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0,0,0,0.72)',
    lineHeight: 21,
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
