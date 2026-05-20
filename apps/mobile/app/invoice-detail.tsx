import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text } from '@/components/OMMText';
import { Alert, Platform, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/constants/theme';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';
import { buildInvoiceDocumentBody, invoiceExportFilename, saveInvoiceToDocumentDirectory } from '@/lib/invoice-export';
import type { InvoiceDetailModel } from '@/lib/invoices-mock';
import { getInvoiceDetailAtIndex } from '@/lib/invoices-mock';

/**
 * Invoice detail - Figma 1053:3871. Download toast - Figma 1053:3953.
 * https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-3871
 * https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-3953
 */

const CARD_PAD = 16;
/** Vertical gap between major bordered sections */
const SECTION_GAP = 16;
/** Space below nav meta row before first card */
const META_TO_CARD = 20;
/** Space between “Issued …” and line-items card */
const ISSUED_TO_LINES = 10;
/** Space before primary CTA block */
const PRE_ACTION_GAP = 24;
/** Space between primary and secondary buttons */
const ACTION_GAP = 12;
const CARD_R = 8;
const MUTED = 'rgba(0, 0, 0, 0.55)';
const BTN_BG = '#000000';

function HairlineBox({
  minHeight,
  children,
  innerStyle,
  elevated,
}: {
  minHeight: number;
  children: ReactNode;
  innerStyle?: object;
  elevated?: boolean;
}) {
  return (
    <View
      style={[
        styles.hairlineShell,
        { minHeight },
        elevated ? styles.hairlineShellElevated : styles.hairlineShellClipped,
      ]}>
      <View style={[styles.hairlineInner, innerStyle]}>{children}</View>
    </View>
  );
}

function HeaderStatusChip({ status }: { status: InvoiceDetailModel['statusChip'] }) {
  const dark = status === 'PAID' || status === 'SENT';
  return (
    <View style={[styles.headChip, dark ? styles.headChipOn : styles.headChipOff]}>
      <Text style={[styles.headChipText, dark ? styles.headChipTextOn : styles.headChipTextOff]}>{status}</Text>
    </View>
  );
}

function DetailBody({
  d,
  onDownloadPdf,
  onShareInvoice,
  onEmailInvoice,
}: {
  d: InvoiceDetailModel;
  onDownloadPdf: () => void;
  onShareInvoice: () => void;
  onEmailInvoice: () => void;
}) {
  return (
    <>
      <View style={styles.metaRow}>
        <View style={styles.metaLeft}>
          <HeaderStatusChip status={d.statusChip} />
          <Text style={styles.invoiceIdNextChip}>{d.invoiceId}</Text>
        </View>
        <Text style={styles.issuedTop} numberOfLines={2}>
          {d.issuedLabel}
        </Text>
      </View>

      <View style={{ height: META_TO_CARD }} />

      <HairlineBox minHeight={120} elevated innerStyle={styles.totalCardInner}>
        <Text style={[styles.label, styles.labelWithExtraBelow]}>TOTAL</Text>
        <Text style={styles.heroAmount}>{d.totalFormatted}</Text>
        <Text style={styles.gstSub}>{d.gstSubtext}</Text>
      </HairlineBox>

      <View style={{ height: SECTION_GAP }} />

      <HairlineBox minHeight={168} innerStyle={styles.detailsCardInner}>
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>PROPERTY</Text>
          <Text style={styles.bodyVal}>{d.propertyLine}</Text>
        </View>
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>CONTACT</Text>
          <Text style={styles.bodyVal}>{d.contactLine}</Text>
        </View>
        <View style={styles.fieldBlockLast}>
          <Text style={styles.label}>{d.paymentFieldLabel}</Text>
          <Text style={styles.bodyVal}>{d.paidViaLine}</Text>
        </View>
      </HairlineBox>

      <View style={{ height: SECTION_GAP }} />

      <Text style={styles.issuedAboveLines}>{d.issuedLabel}</Text>
      <View style={{ height: ISSUED_TO_LINES }} />

      <HairlineBox minHeight={140} innerStyle={styles.linesCardInner}>
        {d.lineItems.map((line, i) => (
          <View key={`${line.description}-${i}`} style={i < d.lineItems.length - 1 ? styles.lineRowGap : styles.lineRow}>
            <Text style={styles.lineDesc} numberOfLines={2}>
              {line.description}
            </Text>
            <Text style={styles.lineAmt}>{line.amountFormatted}</Text>
          </View>
        ))}
      </HairlineBox>

      <View style={{ height: SECTION_GAP }} />

      <HairlineBox minHeight={44} innerStyle={styles.footerTotalInner}>
        <Text style={styles.footerTotalLabel}>TOTAL</Text>
        <Text style={styles.footerTotalAmt}>{d.footerTotalFormatted}</Text>
      </HairlineBox>

      <View style={{ height: PRE_ACTION_GAP }} />

      <Pressable
        style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.92 }]}
        onPress={onDownloadPdf}
        accessibilityRole="button"
        accessibilityLabel="Download PDF">
        <Text style={styles.primaryBtnText}>DOWNLOAD PDF</Text>
      </Pressable>

      <View style={{ height: ACTION_GAP }} />

      <View style={styles.secondaryRow}>
        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.92 }]}
          onPress={onShareInvoice}
          accessibilityRole="button"
          accessibilityLabel="Share invoice">
          <Text style={styles.secondaryBtnText}>SHARE</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.92 }]}
          onPress={onEmailInvoice}
          accessibilityRole="button"
          accessibilityLabel="Email invoice">
          <Text style={styles.secondaryBtnText}>EMAIL INVOICE</Text>
        </Pressable>
      </View>
    </>
  );
}

const TOAST_AUTO_HIDE_MS = 5200;

function DownloadSavedToast({
  invoiceId,
  visible,
  bottomInset,
  onOpen,
}: {
  invoiceId: string;
  visible: boolean;
  bottomInset: number;
  onOpen: () => void;
}) {
  if (!visible) return null;

  return (
    <View style={[styles.toastWrap, { bottom: bottomInset + 12 }]} pointerEvents="box-none">
      <View style={styles.toast}>
        <View style={styles.toastIconCircle}>
          <FontAwesome name="check" size={13} color="#fff" />
        </View>
        <View style={styles.toastTextCol}>
          <Text style={styles.toastTitle}>Saved to Files</Text>
          <Text style={styles.toastSub} numberOfLines={1}>
            {invoiceId}.pdf · Downloads
          </Text>
        </View>
        <Pressable
          onPress={onOpen}
          hitSlop={10}
          style={({ pressed }) => [styles.toastOpenHit, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Open saved file">
          <Text style={styles.toastOpen}>OPEN</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function InvoiceDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { i } = useLocalSearchParams<{ i?: string }>();
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [savedFileUri, setSavedFileUri] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const detail = useMemo(() => {
    const index = typeof i === 'string' ? Number.parseInt(i, 10) : Number.NaN;
    return getInvoiceDetailAtIndex(index);
  }, [i]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const scheduleToastHide = useCallback(() => {
    if (toastTimerRef.current != null) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), TOAST_AUTO_HIDE_MS);
  }, []);

  const triggerWebDownload = useCallback((d: InvoiceDetailModel) => {
    if (typeof document === 'undefined') return;
    const body = buildInvoiceDocumentBody(d);
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = invoiceExportFilename(d.invoiceId);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSavedFileUri('web');
    setToastVisible(true);
    scheduleToastHide();
  }, [scheduleToastHide]);

  const downloadPdf = useCallback(async () => {
    if (!detail) return;

    if (Platform.OS === 'web') {
      try {
        triggerWebDownload(detail);
      } catch {
        Alert.alert('Download', 'Could not download on this browser.');
      }
      return;
    }

    try {
      const { uri } = await saveInvoiceToDocumentDirectory(detail);
      setSavedFileUri(uri);
      setToastVisible(true);
      scheduleToastHide();
    } catch {
      Alert.alert('Download', 'Could not save the invoice. Check storage permissions and try again.');
    }
  }, [detail, scheduleToastHide, triggerWebDownload]);

  const openSavedExport = useCallback(async () => {
    if (!detail) return;

    if (Platform.OS === 'web') {
      try {
        triggerWebDownload(detail);
      } catch {
        Alert.alert('Open', 'Download the file again from your browser.');
      }
      return;
    }

    const uri = savedFileUri;
    if (uri == null || uri === 'web') {
      try {
        const { uri: newUri } = await saveInvoiceToDocumentDirectory(detail);
        setSavedFileUri(newUri);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(newUri, {
            mimeType: 'text/plain',
            dialogTitle: detail.invoiceId,
          });
        }
      } catch {
        Alert.alert('Open', 'Could not open this file.');
      }
      return;
    }

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'text/plain', dialogTitle: detail.invoiceId });
      } else {
        await Share.share({
          title: `Invoice ${detail.invoiceId}`,
          message: buildInvoiceDocumentBody(detail),
        });
      }
    } catch {
      Alert.alert('Open', 'Could not open the share sheet.');
    }
  }, [detail, savedFileUri, triggerWebDownload]);

  const shareInvoice = useCallback(async () => {
    if (!detail) return;

    if (Platform.OS === 'web') {
      const body = buildInvoiceDocumentBody(detail);
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: `Invoice ${detail.invoiceId}`,
            text: body,
          });
        } catch (err) {
          if ((err as Error)?.name !== 'AbortError') {
            Alert.alert('Share', 'Sharing was cancelled or is not available.');
          }
        }
      } else {
        Alert.alert('Share', 'Your browser does not support the Web Share API.');
      }
      return;
    }

    try {
      let uri = savedFileUri != null && savedFileUri !== 'web' ? savedFileUri : null;
      if (uri == null) {
        const saved = await saveInvoiceToDocumentDirectory(detail);
        uri = saved.uri;
        setSavedFileUri(uri);
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'text/plain',
          dialogTitle: `Invoice ${detail.invoiceId}`,
        });
      } else {
        await Share.share({
          title: `Invoice ${detail.invoiceId}`,
          message: buildInvoiceDocumentBody(detail),
        });
      }
    } catch {
      Alert.alert('Share', 'Could not share this invoice.');
    }
  }, [detail, savedFileUri]);

  const emailInvoice = useCallback(async () => {
    if (!detail) return;
    const subject = `Invoice ${detail.invoiceId}`;
    const body = buildInvoiceDocumentBody(detail);
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      const can = await Linking.canOpenURL(mailto);
      if (can) {
        await Linking.openURL(mailto);
      } else {
        Alert.alert('Email', 'No email app is available.');
      }
    } catch {
      Alert.alert('Email', 'Could not open your email app.');
    }
  }, [detail]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Invoices</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      {!detail ? (
        <View style={styles.missWrap}>
          <Text style={styles.missText}>This invoice could not be found.</Text>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}>
            <DetailBody d={detail} onDownloadPdf={downloadPdf} onShareInvoice={shareInvoice} onEmailInvoice={emailInvoice} />
          </ScrollView>
          <DownloadSavedToast
            invoiceId={detail.invoiceId}
            visible={toastVisible}
            bottomInset={insets.bottom}
            onOpen={openSavedExport}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  navSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 27,
  },
  scroll: { paddingHorizontal: layout.screenGutter, paddingTop: 8 },
  missWrap: { paddingHorizontal: layout.screenGutter, paddingTop: 24 },
  missText: { fontSize: 14, fontWeight: '400', color: '#000000', lineHeight: 21 },
  hairlineShell: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: CARD_R,
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
    borderStyle: 'solid',
  },
  hairlineShellClipped: {
    overflow: 'hidden',
  },
  hairlineShellElevated: {
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  hairlineInner: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    minHeight: 32,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: 10,
  },
  headChip: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 26,
  },
  headChipOn: {
    backgroundColor: BTN_BG,
  },
  headChipOff: {
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.14)',
  },
  headChipText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
  },
  headChipTextOn: { color: '#fff' },
  headChipTextOff: { color: 'rgba(26,26,26,0.75)' },
  invoiceIdNextChip: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: 0.11,
    flexShrink: 1,
  },
  issuedTop: {
    flexShrink: 0,
    maxWidth: '48%',
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 18,
    textAlign: 'right',
  },
  totalCardInner: {
    paddingHorizontal: CARD_PAD,
    paddingTop: 17,
    paddingBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
    marginBottom: 4,
  },
  labelWithExtraBelow: {
    marginBottom: 10,
  },
  heroAmount: {
    fontSize: 32,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: -0.4,
    lineHeight: 38,
    marginBottom: 8,
  },
  gstSub: {
    fontSize: 14,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 21,
  },
  detailsCardInner: {
    paddingHorizontal: CARD_PAD,
    paddingTop: 17,
    paddingBottom: 16,
  },
  fieldBlock: {
    marginBottom: 18,
  },
  fieldBlockLast: {
    marginBottom: 0,
  },
  bodyVal: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 21,
  },
  issuedAboveLines: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 18,
  },
  linesCardInner: {
    paddingHorizontal: CARD_PAD,
    paddingTop: 16,
    paddingBottom: 16,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  lineRowGap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  lineDesc: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 21,
  },
  lineAmt: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 21,
    textAlign: 'right',
  },
  footerTotalInner: {
    paddingHorizontal: CARD_PAD,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerTotalLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  footerTotalAmt: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 21,
  },
  primaryBtn: {
    minHeight: 48,
    backgroundColor: BTN_BG,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primaryBtnText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: -0.14,
    textTransform: 'uppercase',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  toastWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 100,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  toastIconCircle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastTextCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  toastTitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 20,
  },
  toastSub: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(26,26,26,0.75)',
    lineHeight: 14,
    letterSpacing: 0.11,
  },
  toastOpenHit: {
    paddingVertical: 8,
    paddingLeft: 8,
  },
  toastOpen: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: 0.18,
    textTransform: 'uppercase',
  },
});
