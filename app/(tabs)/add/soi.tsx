import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text } from '@/components/OMMText';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import {
  PL_PAD,
  PL_BODY,
  PL_CARD,
  PL_CTA,
  PL_MUTED,
  PL_TITLE,
  PrimaryCta,
  PublishStepHeader,
  fieldShell,
  useListingFlowBottomPad,
} from '@/components/list-add/flow-shared';
import { useListingDraft } from '@/components/list-add/listing-draft-context';
import { DEMO_SOI_SUBURB_POSTCODE } from '@/lib/melbourne-demo-locations';
import { suburbFromAddress } from '@/lib/agent-published-listings';
import {
  inspectionAvailabilityIsComplete,
  type InspectionAvailabilityTags,
} from '@/lib/listing-inspection-availability';
import { slateNavy } from '@/constants/theme';
import {
  SOI_MAX_BYTES,
  clearSoiAttachment,
  formatSoiSize,
  isSoiImageMime,
  loadSoiAttachment,
  pickSoiDocument,
  type SoiAttachment,
} from '@/lib/soi-attachment';

type SoiChoice = 'auto' | 'upload';
type ActiveSoiFlow = null | { kind: 'auto' };

function attachedAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'Uploaded recently';
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 60) return 'Uploaded just now';
  if (sec < 3600) return `Uploaded ${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `Uploaded ${Math.floor(sec / 3600)} hr ago`;
  return `Uploaded ${Math.floor(sec / 86400)} day${Math.floor(sec / 86400) === 1 ? '' : 's'} ago`;
}

function GeneratingSoiModal({
  visible,
  suburbLine,
  onCancel,
}: {
  visible: boolean;
  suburbLine: string;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={genStyles.scrim}>
        <Pressable style={genStyles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={genStyles.genTitle}>Generating your SOI</Text>
          <Text style={genStyles.genLede}>
            Pulling comparable sales for {suburbLine}. Usually takes 10—15 seconds.
          </Text>

          <View style={[genStyles.progressCard, fieldShell]}>
            <View style={genStyles.genStep}>
              <View style={genStyles.iconDone}>
                <FontAwesome name="check" size={12} color="#fff" />
              </View>
              <View style={genStyles.genStepText}>
                <Text style={genStyles.genStepTitle}>Property data verified</Text>
                <Text style={genStyles.genStepSub}>Address, type, and area confirmed.</Text>
              </View>
            </View>

            <View style={genStyles.genStep}>
              <View style={genStyles.iconLoading}>
                <ActivityIndicator size="small" color="#000000" />
              </View>
              <View style={genStyles.genStepText}>
                <Text style={genStyles.genStepTitle}>Fetching comparable sales</Text>
                <Text style={genStyles.genStepSub}>3 of 5 properties analysed.</Text>
              </View>
            </View>

            <View style={genStyles.genStep}>
              <View style={genStyles.iconPending} />
              <View style={genStyles.genStepText}>
                <Text style={genStyles.genStepTitle}>Generating PDF</Text>
                <Text style={genStyles.genStepSub}>Formatting and signing the document.</Text>
              </View>
            </View>
          </View>

          <Pressable onPress={onCancel} style={genStyles.cancelBtn} accessibilityRole="button">
            <Text style={genStyles.cancelLabel}>CANCEL GENERATION</Text>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}

const genStyles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    paddingHorizontal: PL_PAD,
    paddingTop: 24,
    paddingBottom: PL_PAD + 8,
  },
  genTitle: { fontSize: 20, fontFamily: 'Satoshi-Medium', color: PL_BODY, marginBottom: 10 },
  genLede: { fontSize: 14, color: PL_MUTED, lineHeight: 21, marginBottom: 20 },
  progressCard: {
    borderRadius: 9,
    padding: 16,
    marginBottom: 20,
    gap: 18,
  },
  genStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  iconDone: {
    width: 24,
    height: 24,
    borderRadius: 9,
    backgroundColor: PL_CARD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  iconLoading: {
    width: 24,
    height: 24,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: PL_BODY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  iconPending: {
    width: 24,
    height: 24,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.28)',
    marginTop: 2,
  },
  genStepText: { flex: 1 },
  genStepTitle: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: PL_BODY, marginBottom: 4 },
  genStepSub: { fontSize: 12, color: PL_MUTED, lineHeight: 17 },
  cancelBtn: {
    height: 48,
    borderRadius: 11,
    backgroundColor: PL_CTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: { color: PL_BODY, fontSize: 13, fontFamily: 'Satoshi-Medium', letterSpacing: 0.5 },
});

export default function PublishListingSoi() {
  const router = useRouter();
  const params = useLocalSearchParams<{ suburb?: string }>();
  const bottomPad = useListingFlowBottomPad();
  const {
    listingDetails,
    inspectionAvailabilityTags,
    setInspectionAvailabilityTags,
    inspectionAvailabilityNotes,
    setInspectionAvailabilityNotes,
    setPublishFlowSoiChoice,
    touchDraftSaved,
  } = useListingDraft();
  const [choice, setChoice] = useState<SoiChoice>('auto');
  const [activeFlow, setActiveFlow] = useState<ActiveSoiFlow>(null);
  const [attachment, setAttachment] = useState<SoiAttachment | null>(null);
  const [picking, setPicking] = useState(false);
  const flowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suburbFromDraft =
    listingDetails?.address?.trim().length ? suburbFromAddress(listingDetails.address).trim() : '';
  const suburbLine =
    typeof params.suburb === 'string' && params.suburb.trim().length > 0
      ? params.suburb.trim()
      : suburbFromDraft.length > 0
        ? suburbFromDraft
        : DEMO_SOI_SUBURB_POSTCODE;

  useEffect(() => {
    loadSoiAttachment().then(setAttachment);
  }, []);

  const saveDraft = useCallback(() => {
    touchDraftSaved();
    Alert.alert('Draft saved', 'Your listing draft has been saved.');
  }, [touchDraftSaved]);

  const clearFlowTimer = useCallback(() => {
    if (flowTimerRef.current != null) {
      clearTimeout(flowTimerRef.current);
      flowTimerRef.current = null;
    }
  }, []);

  const selectAuto = () => {
    setChoice('auto');
    setActiveFlow(null);
    clearFlowTimer();
    void clearSoiAttachment();
    setAttachment(null);
  };

  const selectUpload = () => {
    setChoice('upload');
    setActiveFlow(null);
    clearFlowTimer();
  };

  useEffect(() => {
    if (!activeFlow || activeFlow.kind !== 'auto') {
      clearFlowTimer();
      return;
    }
    flowTimerRef.current = setTimeout(() => {
      flowTimerRef.current = null;
      setActiveFlow(null);
      setPublishFlowSoiChoice('auto');
      router.push('/add/referral' as Href);
    }, 3000);
    return clearFlowTimer;
  }, [activeFlow, clearFlowTimer, router, setPublishFlowSoiChoice]);

  const cancelFlow = () => {
    setActiveFlow(null);
    clearFlowTimer();
  };

  const runPick = async () => {
    if (picking) return;
    setPicking(true);
    try {
      const result = await pickSoiDocument();
      if (result.ok) {
        setAttachment(result.attachment);
        return;
      }
      if ('error' in result) {
        Alert.alert('Cannot attach SOI', result.error);
      }
    } finally {
      setPicking(false);
    }
  };

  const toggleInspectionTag = (key: keyof InspectionAvailabilityTags) => {
    setInspectionAvailabilityTags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onContinue = () => {
    if (
      !inspectionAvailabilityIsComplete(inspectionAvailabilityTags, inspectionAvailabilityNotes)
    ) {
      Alert.alert(
        'Inspection availability',
        'Tell buyers when they can inspect — choose at least one option or add notes.',
      );
      return;
    }
    if (choice === 'auto') {
      setActiveFlow({ kind: 'auto' });
      return;
    }
    if (attachment) {
      setPublishFlowSoiChoice('upload');
      router.push('/add/referral' as Href);
      return;
    }
    void runPick();
  };

  const removeAttachment = async () => {
    await clearSoiAttachment();
    setAttachment(null);
  };

  const hasUpload = choice === 'upload' && attachment != null;

  return (
    <View style={[styles.root, { paddingBottom: bottomPad }]}>
      <PublishStepHeader step={3} onBack={() => router.back()} onSaveDraft={saveDraft} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Statement of Information</Text>
        <Text style={styles.lede}>
          Required by Victorian law for every listing. Your listing won't publish without it.
        </Text>

        <View style={styles.requiredBadge}>
          <Text style={styles.requiredText}>REQUIRED</Text>
        </View>

        <Pressable
          onPress={selectAuto}
          style={[styles.choiceCard, fieldShell, choice === 'auto' && styles.choiceCardSelected]}>
          <View style={styles.choiceRow}>
            <View
              style={[
                styles.choiceIcon,
                choice === 'auto' ? styles.choiceIconOn : styles.choiceIconMuted,
              ]}>
              {choice === 'auto' ? (
                <FontAwesome name="check" size={18} color="#fff" />
              ) : null}
            </View>
            <View style={styles.choiceCopy}>
              <View style={styles.titleRow}>
                <Text style={styles.choiceTitle}>Auto-generate SOI</Text>
                <View style={styles.recommendedPill}>
                  <Text style={styles.recommendedText}>RECOMMENDED</Text>
                </View>
              </View>
              <Text style={styles.choiceBody}>
                Pulls comparable sales for the listing's suburb. Editable before publish.
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          onPress={selectUpload}
          style={[styles.choiceCard, fieldShell, choice === 'upload' && styles.choiceCardSelected]}>
          <View style={styles.choiceRow}>
            <View
              style={[
                styles.choiceIcon,
                choice === 'upload' ? styles.choiceIconOn : styles.choiceIconMuted,
              ]}>
              {choice === 'upload' ? (
                <FontAwesome name="check" size={18} color="#fff" />
              ) : (
                <FontAwesome name="upload" size={16} color="#000000" />
              )}
            </View>
            <View style={styles.choiceCopy}>
              <Text style={styles.choiceTitle}>Upload SOI (PDF or images)</Text>
              <Text style={styles.choiceBody}>
                JPEG, PNG, WebP, HEIC, or PDF — max {formatSoiSize(SOI_MAX_BYTES)} per file. Use a clear photo or export
                from your CRM.
              </Text>
            </View>
          </View>
        </Pressable>

        {hasUpload ? (
          <View style={[styles.attachedCard, fieldShell]}>
            <View style={styles.attachedRow}>
              <View style={styles.docIcon}>
                {isSoiImageMime(attachment.mimeType) ? (
                  <MaterialCommunityIcons name="image-outline" size={22} color="#000000" />
                ) : (
                  <FontAwesome name="file-pdf-o" size={20} color="#000000" />
                )}
              </View>
              <View style={styles.attachedCopy}>
                <Text style={styles.attachedName} numberOfLines={2}>
                  {attachment.name}
                </Text>
                <Text style={styles.attachedMeta}>
                  {formatSoiSize(attachment.sizeBytes)} · {attachedAgo(attachment.attachedAt)}
                </Text>
                <View style={styles.attachedPill}>
                  <FontAwesome name="check" size={10} color="#fff" style={{ marginRight: 4 }} />
                  <Text style={styles.attachedPillText}>ATTACHED</Text>
                </View>
              </View>
            </View>
            <View style={styles.attachedActions}>
              <Pressable onPress={() => router.push('/soi-preview' as Href)} hitSlop={8}>
                <Text style={styles.actionLink}>VIEW</Text>
              </Pressable>
              <Pressable onPress={() => void runPick()} hitSlop={8} disabled={picking}>
                <Text style={[styles.actionLink, picking && { opacity: 0.45 }]}>REPLACE</Text>
              </Pressable>
              <Pressable onPress={() => void removeAttachment()} hitSlop={8}>
                <Text style={styles.actionLink}>REMOVE</Text>
              </Pressable>
            </View>
          </View>
        ) : choice === 'upload' ? (
          <Pressable
            style={[styles.pickCard, fieldShell]}
            onPress={() => void runPick()}
            disabled={picking}
            accessibilityRole="button"
            accessibilityLabel="Choose SOI file">
            <View style={styles.pickRow}>
              {picking ? (
                <ActivityIndicator color="#000" style={{ marginRight: 12 }} />
              ) : (
                <FontAwesome name="folder-open-o" size={20} color="#000000" style={{ marginRight: 12 }} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.pickTitle}>{picking ? 'Opening file picker…' : 'Choose PDF or image'}</Text>
                <Text style={styles.pickSub}>Or tap Continue below to pick a file.</Text>
              </View>
            </View>
          </Pressable>
        ) : (
          <View style={[styles.statusCard, fieldShell]}>
            <View style={styles.statusRow}>
              <View style={styles.docIcon}>
                <FontAwesome name="file-text-o" size={18} color="#000000" />
              </View>
              <View>
                <Text style={styles.statusTitle}>No SOI uploaded yet</Text>
                <Text style={styles.statusSub}>Pick an option above to attach SOI</Text>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.inspectSection, styles.inspectSectionTopRule]}>
          <Text style={styles.inspectSectionTitle}>Inspection availability</Text>
          <Text style={styles.inspectLede}>
            When can buyers inspect? This appears on your live listing so interested parties know how to arrange a
            visit.
          </Text>
          <View style={styles.chipWrap}>
            {(
              [
                ['byAppointment', 'By appointment'],
                ['openHome', 'Open home'],
                ['flexibleHours', 'Flexible hours'],
              ] as const
            ).map(([key, label]) => {
              const on = inspectionAvailabilityTags[key];
              return (
                <Pressable
                  key={key}
                  onPress={() => toggleInspectionTag(key)}
                  style={[styles.inspectChip, on && styles.inspectChipOn]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}>
                  <Text style={[styles.inspectChipLabel, on && styles.inspectChipLabelOn]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.inspectNotesLabel}>Extra detail (optional)</Text>
          <TextInput
            style={[styles.inspectNotesInput, fieldShell]}
            placeholder="e.g. Saturdays 10am—12pm · 24h notice appreciated"
            placeholderTextColor="rgba(0,0,0,0.35)"
            value={inspectionAvailabilityNotes}
            onChangeText={setInspectionAvailabilityNotes}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.ctaWrap}>
        <PrimaryCta label={picking ? 'PLEASE WAIT…' : 'CONTINUE'} onPress={onContinue} disabled={picking} />
      </View>

      <GeneratingSoiModal
        visible={activeFlow?.kind === 'auto'}
        suburbLine={suburbLine}
        onCancel={cancelFlow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingTop: 12, paddingHorizontal: PL_PAD, paddingBottom: 16 },
  pageTitle: { fontSize: 24, fontFamily: 'Satoshi-Medium', color: PL_TITLE, marginBottom: 8 },
  lede: { fontSize: 13, color: PL_MUTED, lineHeight: 19.5, marginBottom: 16 },
  requiredBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 20,
  },
  requiredText: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: '#565656', letterSpacing: 0.5 },

  ctaWrap: { paddingBottom: 6, marginTop: -8 },

  choiceCard: { borderRadius: 9, padding: 20, marginBottom: 16 },
  choiceCardSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  choiceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  choiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceIconOn: { backgroundColor: PL_CARD },
  choiceIconMuted: { backgroundColor: '#cbcbcb' },
  choiceCopy: { flex: 1 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8 },
  choiceTitle: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: PL_BODY },
  recommendedPill: {
    backgroundColor: slateNavy,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recommendedText: { color: '#fff', fontSize: 9, fontFamily: 'Satoshi-Medium', letterSpacing: 0.45 },
  choiceBody: { fontSize: 13, color: PL_MUTED, lineHeight: 18.2 },

  pickCard: { borderRadius: 5, padding: 19, marginBottom: 0 },
  pickRow: { flexDirection: 'row', alignItems: 'center' },
  pickTitle: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: '#000000' },
  pickSub: { fontSize: 11, color: 'rgba(0,0,0,0.55)', marginTop: 4 },

  statusCard: { borderRadius: 5, padding: 19 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  attachedCard: { borderRadius: 5, padding: 19, marginBottom: 0 },
  attachedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  attachedCopy: { flex: 1, minWidth: 0 },
  attachedName: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: '#000000', marginBottom: 4 },
  attachedMeta: { fontSize: 11, color: 'rgba(0,0,0,0.55)', lineHeight: 15.4, marginBottom: 10 },
  attachedPill: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: PL_CARD,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  attachedPillText: { color: '#fff', fontSize: 9, fontFamily: 'Satoshi-Medium', letterSpacing: 0.45 },
  attachedActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 14,
    gap: 20,
  },
  actionLink: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: PL_BODY,
    letterSpacing: 0.4,
    textDecorationLine: 'underline',
  },
  docIcon: {
    width: 48,
    height: 48,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  statusTitle: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: '#000000' },
  statusSub: { fontSize: 11, color: 'rgba(0,0,0,0.55)', marginTop: 2 },

  inspectSection: { paddingTop: 4 },
  inspectSectionTopRule: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#c6c6c8',
    marginTop: 20,
    paddingTop: 22,
  },
  inspectSectionTitle: {
    fontSize: 17,
    fontFamily: 'Satoshi-Medium',
    color: PL_BODY,
    marginBottom: 8,
  },
  inspectLede: { fontSize: 13, color: PL_MUTED, lineHeight: 19.5, marginBottom: 16 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  inspectChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    backgroundColor: '#fff',
  },
  inspectChipOn: {
    borderColor: PL_BODY,
    backgroundColor: '#f7f7f8',
  },
  inspectChipLabel: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: PL_BODY },
  inspectChipLabelOn: { fontFamily: 'Satoshi-Medium' },
  inspectNotesLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#565656',
    letterSpacing: 0.35,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inspectNotesInput: {
    minHeight: 88,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: PL_BODY,
    lineHeight: 20,
    marginBottom: 0,
  },
});
