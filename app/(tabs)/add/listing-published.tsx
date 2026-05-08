import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  PL_PAD,
  PL_BODY,
  PL_BORDER,
  PL_CARD,
  PL_CTA,
  PL_MUTED,
  dashedShell,
  useListingFlowBottomPad,
} from './_shared';
import { DEMO_PRIMARY_SUBURB_LINE } from '@/lib/melbourne-demo-locations';

const DEMO = {
  listingId: 'OMM-48291',
  property: DEMO_PRIMARY_SUBURB_LINE,
  price: '$2.0—2.2M',
  referralFee: '25% • $500—550K',
  authority: 'in 30 days',
  soi: 'Auto-gen • Attached',
  pdfTitle: 'Listing PDF',
  pdfLine: 'west-melbourne-terrace.pdf • 6 pages • 2.4 MB',
  pdfShortMeta: 'hawthorn-city-center.pdf • 2.4 MB',
};

type Sheet = null | 'download' | 'share';

function DownloadPdfModal({ visible, onCancel }: { visible: boolean; onCancel: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={dm.scrim}>
        <Pressable style={dm.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={dm.title}>Downloading PDF</Text>
          <Text style={dm.sub}>Saving to your device • takes a few seconds</Text>

          <View style={[dm.card, dashedShell]}>
            <View style={dm.pdfBadge}>
              <Text style={dm.pdfBadgeText}>PDF</Text>
            </View>
            <View style={dm.cardMeta}>
              <Text style={dm.fileName}>hawthorn-city-center.pdf</Text>
              <Text style={dm.fileDims}>6 pages • 2.4 MB</Text>
              <View style={dm.barTrack}>
                <View style={[dm.barFill, { width: '67%' }]} />
              </View>
              <View style={dm.barLabels}>
                <Text style={dm.barLabel}>1.6 MB OF 2.4 MB</Text>
                <Text style={[dm.barLabel, { textAlign: 'right' }]}>ABOUT 2 SECONDS LEFT</Text>
              </View>
            </View>
          </View>

          <Text style={dm.hint}>You can keep using the app while the download continues in the background.</Text>

          <Pressable onPress={onCancel} style={dm.cancelBtn} accessibilityRole="button">
            <Text style={dm.cancelLabel}>CANCEL DOWNLOAD</Text>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}

function ShareChannel({
  letter,
  label,
  onPress,
}: {
  letter: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={sm.chWrap} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={sm.chCircle}>
        <Text style={sm.chLetter}>{letter}</Text>
      </View>
      <Text style={sm.chLabel}>{label}</Text>
    </Pressable>
  );
}

function ShareOrRow({
  icon,
  title,
  sub,
  onPress,
}: {
  icon: ComponentProps<typeof FontAwesome>['name'];
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={sm.orRow} onPress={onPress} accessibilityRole="button">
      <View style={sm.orIcon}>
        <FontAwesome name={icon} size={16} color={PL_BODY} />
      </View>
      <View style={sm.orMid}>
        <Text style={sm.orTitle}>{title}</Text>
        <Text style={sm.orSub}>{sub}</Text>
      </View>
      <FontAwesome name="chevron-right" size={12} color="rgba(0, 0, 0, 0.35)" />
    </Pressable>
  );
}

function SharePdfModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={sm.scrim}>
        <Pressable style={sm.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={[sm.headCard, dashedShell]}>
            <View style={sm.headPdfBadge}>
              <Text style={sm.headPdfText}>PDF</Text>
            </View>
            <View style={sm.headCopy}>
              <Text style={sm.headTitle}>{DEMO.pdfTitle}</Text>
              <Text style={sm.headMeta}>{DEMO.pdfShortMeta}</Text>
            </View>
          </View>

          <Text style={sm.shareVia}>SHARE VIA</Text>
          <View style={sm.channels}>
            <ShareChannel letter="M" label="Messages" onPress={() => Alert.alert('Messages', 'Opens Messages.')} />
            <ShareChannel letter="@" label="Mail" onPress={() => Alert.alert('Mail', 'Opens Mail.')} />
            <ShareChannel letter="W" label="WhatsApp" onPress={() => Alert.alert('WhatsApp', 'Opens WhatsApp.')} />
            <ShareChannel letter="A" label="AirDrop" onPress={() => Alert.alert('AirDrop', 'Opens AirDrop.')} />
            <ShareChannel letter="···" label="More" onPress={() => Alert.alert('More', 'System share sheet.')} />
          </View>

          <Text style={sm.orLabel}>OR</Text>
          <View style={[sm.orList, dashedShell]}>
            <ShareOrRow
              icon="external-link"
              title="Copy Link"
              sub="omm.app/l/hawthorn-city-center"
              onPress={() => Alert.alert('Copied', 'Link copied to clipboard (demo).')}
            />
            <View style={sm.orDivider} />
            <ShareOrRow
              icon="at"
              title="Send via Email"
              sub="Attach the PDF to a new email"
              onPress={() => Alert.alert('Email', 'Composer would open with PDF attached.')}
            />
            <View style={sm.orDivider} />
            <ShareOrRow
              icon="download"
              title="Save to Files"
              sub="Store the PDF on this device"
              onPress={() => Alert.alert('Files', 'Save dialog would open.')}
            />
            <View style={sm.orDivider} />
            <ShareOrRow
              icon="print"
              title="Print"
              sub="AirPrint or save as PDF"
              onPress={() => Alert.alert('Print', 'Print UI would open.')}
            />
          </View>

          <Pressable onPress={onClose} style={sm.cancelBtn} accessibilityRole="button">
            <Text style={sm.cancelLabel}>CANCEL</Text>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}

const dm = StyleSheet.create({
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
  title: { fontSize: 20, fontFamily: 'Satoshi-Medium', color: PL_BODY, marginBottom: 8 },
  sub: { fontSize: 14, color: PL_MUTED, lineHeight: 21, marginBottom: 20 },
  card: {
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
  pdfBadgeText: { color: '#fff', fontSize: 11, fontFamily: 'Satoshi-Medium' },
  cardMeta: { flex: 1, minWidth: 0 },
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
  barLabel: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: PL_MUTED, letterSpacing: 0.3, flex: 1 },
  hint: {
    fontSize: 13,
    color: PL_MUTED,
    textAlign: 'center',
    lineHeight: 19.5,
    marginBottom: 20,
    paddingHorizontal: 4,
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

const sm = StyleSheet.create({
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
    paddingTop: 20,
    paddingBottom: PL_PAD + 8,
    maxHeight: '92%',
  },
  headCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: 12,
    marginBottom: 22,
    alignItems: 'flex-start',
  },
  headPdfBadge: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: PL_CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headPdfText: { color: '#fff', fontSize: 11, fontFamily: 'Satoshi-Medium' },
  headCopy: { flex: 1, minWidth: 0 },
  headTitle: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: PL_BODY, marginBottom: 4 },
  headMeta: { fontSize: 12, color: PL_MUTED, lineHeight: 17 },
  shareVia: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: PL_BORDER,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  channels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  chWrap: { alignItems: 'center', width: 56 },
  chCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8e8ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  chLetter: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: PL_BODY },
  chLabel: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: PL_MUTED, textAlign: 'center' },
  orLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: PL_BORDER,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  orList: { borderRadius: 12, paddingVertical: 4, marginBottom: 20 },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
  },
  orIcon: { width: 36, alignItems: 'center' },
  orMid: { flex: 1, minWidth: 0 },
  orTitle: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: PL_BODY },
  orSub: { fontSize: 12, color: PL_MUTED, marginTop: 3, lineHeight: 16 },
  orDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginLeft: 56,
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

export default function ListingPublishedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPad = useListingFlowBottomPad();
  const [sheet, setSheet] = useState<Sheet>(null);

  const goHome = () =>
    router.replace(`/(tabs)?homeSegment=selling&_ts=${Date.now()}` as Href);

  const goManageListings = () => router.replace('/list' as Href);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: Math.max(insets.top, 16), paddingBottom: bottomPad + 16 },
        ]}>
        <Text style={styles.title}>Listing published</Text>

        <View style={styles.successBadge}>
          <FontAwesome name="check" size={26} color={PL_BODY} />
        </View>

        <Text style={styles.lede}>
          Live on OMM for verified agents. Share the PDF to give vendors or anyone outside the platform a clean view of the
          listing.
        </Text>

        <Text style={styles.listingIdLine}>LISTING ID • {DEMO.listingId}</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.cardKicker}>PROPERTY</Text>
          <Text style={styles.propertyName}>{DEMO.property}</Text>
          <View style={styles.cardRule} />
          <View style={styles.grid}>
            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={styles.gridLabel}>LISTING PRICE</Text>
                <Text style={styles.gridValue}>{DEMO.price}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.gridLabel}>REFERRAL FEE</Text>
                <Text style={styles.gridValue}>{DEMO.referralFee}</Text>
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={styles.gridLabel}>AUTHORITY EXPIRES</Text>
                <Text style={styles.gridValue}>{DEMO.authority}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.gridLabel}>SOI</Text>
                <Text style={styles.gridValue}>{DEMO.soi}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.pdfCard}>
          <View style={styles.pdfRow}>
            <View style={styles.pdfIcon}>
              <FontAwesome name="file-text-o" size={20} color="#fff" />
            </View>
            <View style={styles.pdfCopy}>
              <Text style={styles.pdfTitle}>{DEMO.pdfTitle}</Text>
              <Text style={styles.pdfMeta}>{DEMO.pdfLine}</Text>
            </View>
          </View>
          <View style={styles.pdfActions}>
            <Pressable
              style={styles.shareBtn}
              onPress={() => setSheet('share')}
              accessibilityRole="button">
              <FontAwesome name="share-alt" size={14} color={PL_BODY} />
              <Text style={styles.shareBtnText}>SHARE PDF</Text>
            </Pressable>
            <Pressable
              style={styles.downloadBtn}
              onPress={() => setSheet('download')}
              accessibilityRole="button">
              <FontAwesome name="download" size={14} color="#fff" />
              <Text style={styles.downloadBtnText}>DOWNLOAD</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.primaryWide}
          onPress={() => router.push('/view-live-listing' as Href)}
          accessibilityRole="button">
          <Text style={styles.primaryWideLabel}>VIEW LIVE LISTING</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryWide}
          onPress={goManageListings}
          accessibilityRole="button">
          <Text style={styles.secondaryWideLabel}>MANAGE LISTINGS</Text>
        </Pressable>

        <Pressable onPress={goHome} style={styles.linkWrap} accessibilityRole="button" accessibilityLabel="Back to home">
          <Text style={styles.linkText}>Back to home</Text>
        </Pressable>
      </ScrollView>

      <DownloadPdfModal visible={sheet === 'download'} onCancel={() => setSheet(null)} />
      <SharePdfModal visible={sheet === 'share'} onClose={() => setSheet(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: PL_PAD },
  title: {
    fontSize: 22,
    fontFamily: 'Satoshi-Medium',
    color: PL_BODY,
    textAlign: 'center',
    marginBottom: 24,
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e5e5ea',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  lede: {
    fontSize: 14,
    color: PL_MUTED,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  listingIdLine: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: PL_BORDER,
    letterSpacing: 0.4,
    textAlign: 'center',
    marginBottom: 28,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardKicker: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: PL_BORDER,
    letterSpacing: 0.45,
    marginBottom: 8,
  },
  propertyName: { fontSize: 18, fontFamily: 'Satoshi-Medium', color: PL_BODY, marginBottom: 16 },
  cardRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginBottom: 16,
  },
  grid: { gap: 18 },
  gridRow: { flexDirection: 'row', gap: 16 },
  gridCell: { flex: 1, minWidth: 0 },
  gridLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: PL_BORDER,
    letterSpacing: 0.35,
    marginBottom: 6,
  },
  gridValue: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: PL_BODY, lineHeight: 18 },
  pdfCard: {
    backgroundColor: PL_CARD,
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
  },
  pdfRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 18 },
  pdfIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfCopy: { flex: 1, minWidth: 0 },
  pdfTitle: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#fff', marginBottom: 4 },
  pdfMeta: { fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 17 },
  pdfActions: { flexDirection: 'row', gap: 10 },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    height: 46,
    borderRadius: 12,
  },
  shareBtnText: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: PL_BODY, letterSpacing: 0.3 },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    borderStyle: 'dashed',
  },
  downloadBtnText: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: '#fff', letterSpacing: 0.3 },
  primaryWide: {
    height: 48,
    borderRadius: 14,
    backgroundColor: PL_CTA,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryWideLabel: { color: '#fff', fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.35 },
  secondaryWide: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: PL_BODY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  secondaryWideLabel: { color: PL_BODY, fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.35 },
  linkWrap: { alignSelf: 'center', paddingVertical: 8 },
  linkText: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: PL_MUTED },
});
