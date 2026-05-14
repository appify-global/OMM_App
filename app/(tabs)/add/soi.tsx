import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text } from '@/components/OMMText';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

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
} from './_shared';
import { DEMO_SOI_SUBURB_POSTCODE } from '@/lib/melbourne-demo-locations';

type SoiChoice = 'auto' | 'upload';
type ActiveSoiFlow = null | { kind: 'auto' } | { kind: 'upload' };

const MOCK_SOI_FILE = {
  name: 'SOI-west-melbourne-terrace.pdf',
  pages: '4',
  sizeLabel: '1.2 MB',
  progressDoneLabel: '0.94 MB OF 1.2 MB',
  progressEtaLabel: 'ABOUT 1 SECOND LEFT',
};

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

function UploadingSoiModal({ visible, onCancel }: { visible: boolean; onCancel: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={upStyles.scrim}>
        <Pressable style={upStyles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={upStyles.grabHandle} accessibilityLabel="" />
          <Text style={upStyles.upTitle}>Uploading SOI</Text>
          <Text style={upStyles.upSub}>Verifying signatures and required fields...</Text>

          <View style={[upStyles.fileCard, fieldShell]}>
            <View style={upStyles.pdfBadge}>
              <Text style={upStyles.pdfBadgeText}>PDF</Text>
            </View>
            <View style={upStyles.fileMeta}>
              <Text style={upStyles.fileName}>{MOCK_SOI_FILE.name}</Text>
              <Text style={upStyles.fileDims}>
                {MOCK_SOI_FILE.pages} pages • {MOCK_SOI_FILE.sizeLabel}
              </Text>
              <View style={upStyles.barTrack}>
                <View style={[upStyles.barFill, { width: '80%' }]} />
              </View>
              <View style={upStyles.barLabels}>
                <Text style={upStyles.barLabel}>{MOCK_SOI_FILE.progressDoneLabel}</Text>
                <Text style={upStyles.barLabel}>{MOCK_SOI_FILE.progressEtaLabel}</Text>
              </View>
            </View>
          </View>

          <Text style={upStyles.statusLine}>Your SOI is being scanned and attached to the listing.</Text>

          <Pressable onPress={onCancel} style={upStyles.cancelBtn} accessibilityRole="button">
            <Text style={upStyles.cancelLabel}>CANCEL UPLOAD</Text>
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: PL_PAD,
    paddingTop: 24,
    paddingBottom: PL_PAD + 8,
  },
  genTitle: { fontSize: 20, fontFamily: 'Satoshi-Medium', color: PL_BODY, marginBottom: 10 },
  genLede: { fontSize: 14, color: PL_MUTED, lineHeight: 21, marginBottom: 20 },
  progressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 18,
  },
  genStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  iconDone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PL_CARD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  iconLoading: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PL_BODY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  iconPending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.28)',
    marginTop: 2,
  },
  genStepText: { flex: 1 },
  genStepTitle: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: PL_BODY, marginBottom: 4 },
  genStepSub: { fontSize: 12, color: PL_MUTED, lineHeight: 17 },
  cancelBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: PL_CTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: { color: '#fff', fontSize: 13, fontFamily: 'Satoshi-Medium', letterSpacing: 0.5 },
});

const upStyles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: PL_PAD,
    paddingTop: 12,
    paddingBottom: PL_PAD + 8,
  },
  grabHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginBottom: 16,
  },
  upTitle: { fontSize: 20, fontFamily: 'Satoshi-Medium', color: PL_BODY, marginBottom: 8 },
  upSub: { fontSize: 14, color: PL_MUTED, lineHeight: 21, marginBottom: 20 },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pdfBadge: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: PL_CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfBadgeText: { color: '#fff', fontSize: 11, fontFamily: 'Satoshi-Medium', letterSpacing: 0.3 },
  fileMeta: { flex: 1, minWidth: 0 },
  fileName: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: PL_BODY, marginBottom: 4 },
  fileDims: { fontSize: 12, color: PL_MUTED, marginBottom: 12 },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: { height: '100%', backgroundColor: PL_CARD, borderRadius: 4 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  barLabel: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: PL_MUTED, letterSpacing: 0.35, flex: 1 },
  statusLine: {
    fontSize: 13,
    color: PL_MUTED,
    textAlign: 'center',
    lineHeight: 19.5,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  cancelBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: PL_CTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: { color: '#fff', fontSize: 13, fontFamily: 'Satoshi-Medium', letterSpacing: 0.5 },
});

export default function PublishListingSoi() {
  const router = useRouter();
  const params = useLocalSearchParams<{ suburb?: string }>();
  const bottomPad = useListingFlowBottomPad();
  const [choice, setChoice] = useState<SoiChoice>('auto');
  const [activeFlow, setActiveFlow] = useState<ActiveSoiFlow>(null);
  const [uploadAttached, setUploadAttached] = useState(false);
  const flowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suburbLine =
    typeof params.suburb === 'string' && params.suburb.trim().length > 0
      ? params.suburb.trim()
      : DEMO_SOI_SUBURB_POSTCODE;

  const saveDraft = useCallback(() => {
    Alert.alert('Draft saved', 'Your listing draft has been saved.');
  }, []);

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
  };

  const selectUpload = () => {
    setChoice('upload');
    setActiveFlow(null);
    clearFlowTimer();
  };

  useEffect(() => {
    if (!activeFlow) {
      clearFlowTimer();
      return;
    }

    const kind = activeFlow.kind;
    flowTimerRef.current = setTimeout(() => {
      flowTimerRef.current = null;
      setActiveFlow(null);
      if (kind === 'auto') {
        router.push('/add/referral' as Href);
      } else {
        setUploadAttached(true);
      }
    }, 3000);

    return clearFlowTimer;
  }, [activeFlow, clearFlowTimer, router]);

  const cancelFlow = () => {
    setActiveFlow(null);
    clearFlowTimer();
  };

  const onContinue = () => {
    if (choice === 'auto') {
      setActiveFlow({ kind: 'auto' });
      return;
    }
    if (uploadAttached) {
      router.push('/add/referral' as Href);
      return;
    }
    setActiveFlow({ kind: 'upload' });
  };

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
              <Text style={styles.choiceTitle}>Upload existing SOI (PDF)</Text>
              <Text style={styles.choiceBody}>
                Drop in a signed Statement of Information you've already prepared. Max 5 MB.
              </Text>
            </View>
          </View>
        </Pressable>

        {uploadAttached && choice === 'upload' ? (
          <View style={[styles.attachedCard, fieldShell]}>
            <View style={styles.attachedRow}>
              <View style={styles.docIcon}>
                <FontAwesome name="file-text-o" size={18} color="#000000" />
              </View>
              <View style={styles.attachedCopy}>
                <Text style={styles.attachedName}>{MOCK_SOI_FILE.name}</Text>
                <Text style={styles.attachedMeta}>
                  {MOCK_SOI_FILE.pages} pages • {MOCK_SOI_FILE.sizeLabel} • Uploaded just now
                </Text>
                <View style={styles.attachedPill}>
                  <FontAwesome name="check" size={10} color="#fff" style={{ marginRight: 4 }} />
                  <Text style={styles.attachedPillText}>ATTACHED</Text>
                </View>
              </View>
            </View>
            <View style={styles.attachedActions}>
              <Pressable onPress={() => Alert.alert('SOI', 'Preview would open here.')} hitSlop={8}>
                <Text style={styles.actionLink}>VIEW</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setUploadAttached(false);
                  Alert.alert('Replace', 'Choose a new PDF (demo).');
                }}
                hitSlop={8}>
                <Text style={styles.actionLink}>REPLACE</Text>
              </Pressable>
              <Pressable onPress={() => setUploadAttached(false)} hitSlop={8}>
                <Text style={styles.actionLink}>REMOVE</Text>
              </Pressable>
            </View>
          </View>
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
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.ctaWrap}>
        <PrimaryCta label="CONTINUE" onPress={onContinue} />
      </View>

      <GeneratingSoiModal
        visible={activeFlow?.kind === 'auto'}
        suburbLine={suburbLine}
        onCancel={cancelFlow}
      />
      <UploadingSoiModal visible={activeFlow?.kind === 'upload'} onCancel={cancelFlow} />
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

  choiceCard: { borderRadius: 14, padding: 20, marginBottom: 16 },
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceIconOn: { backgroundColor: PL_CARD },
  choiceIconMuted: { backgroundColor: '#cbcbcb' },
  choiceCopy: { flex: 1 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8 },
  choiceTitle: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: PL_BODY },
  recommendedPill: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recommendedText: { color: '#fff', fontSize: 9, fontFamily: 'Satoshi-Medium', letterSpacing: 0.45 },
  choiceBody: { fontSize: 13, color: PL_MUTED, lineHeight: 18.2 },

  statusCard: { borderRadius: 8, padding: 19 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  attachedCard: { borderRadius: 8, padding: 19, marginBottom: 0 },
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
});
