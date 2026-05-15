import { BlurView } from 'expo-blur';
import * as Sharing from 'expo-sharing';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/OMMText';
import { AppButton, APP_BUTTON_STACK_GAP } from '@/components/AppButton';
import { layout } from '@/constants/theme';
import { DEMO_SOI_PROPERTY_LINE } from '@/lib/melbourne-demo-locations';
import {
  formatSoiSize,
  isSoiImageMime,
  isSoiPdfMime,
  loadSoiAttachment,
  type SoiAttachment,
} from '@/lib/soi-attachment';

type Props = {
  visible: boolean;
  onClose: () => void;
  propertyLine?: string;
};

const PREVIEW_WEB_H = 220;

/**
 * Statement of Information — bottom sheet; shows attached SOI preview when available.
 */
export function SoiBottomSheet({
  visible,
  onClose,
  propertyLine = DEMO_SOI_PROPERTY_LINE,
}: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [attachment, setAttachment] = useState<SoiAttachment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    setLoading(true);
    loadSoiAttachment().then((row) => {
      if (alive) {
        setAttachment(row);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [visible]);

  const openFullPreview = () => {
    onClose();
    router.push('/soi-preview' as Href);
  };

  const onDownload = async () => {
    if (!attachment) {
      Alert.alert('No file', 'Upload a Statement of Information from the listing workflow first.');
      return;
    }
    const ok = await Sharing.isAvailableAsync();
    if (!ok) {
      Alert.alert('Sharing', 'Sharing is not available on this device.');
      return;
    }
    try {
      await Sharing.shareAsync(attachment.uri, {
        mimeType: attachment.mimeType,
        dialogTitle: attachment.name,
      });
    } catch {
      Alert.alert('Sharing', 'Could not share this file.');
    }
  };

  const isImage = attachment != null && isSoiImageMime(attachment.mimeType);
  const isPdf = attachment != null && isSoiPdfMime(attachment.mimeType);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.wrap}>
        {Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
        ) : (
          <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.22)' }]}
        />
        <View style={styles.stack}>
          <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>
            <Text style={styles.title}>Statement of Information</Text>
            <Text style={styles.subtitle}>{propertyLine}</Text>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollInner}
              showsVerticalScrollIndicator={false}
              bounces={false}>
              {loading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color="#111111" />
                </View>
              ) : attachment ? (
                <>
                  <View style={styles.infoCard}>
                    <Text style={styles.cardMeta} numberOfLines={1}>
                      {attachment.name} · {formatSoiSize(attachment.sizeBytes)}
                    </Text>
                    <Text style={styles.cardBody}>
                      {isPdf ? 'PDF preview (scroll on full screen for multi-page).' : 'Image preview of your SOI.'}
                    </Text>
                    {isImage ? (
                      <Image
                        source={{ uri: attachment.uri }}
                        style={styles.sheetThumb}
                        resizeMode="cover"
                        accessibilityLabel={`SOI preview, ${attachment.name}`}
                      />
                    ) : isPdf ? (
                      <View style={styles.pdfPreviewBox}>
                        <WebView
                          source={{ uri: attachment.uri }}
                          style={styles.pdfWeb}
                          originWhitelist={['*']}
                          scalesPageToFit
                          scrollEnabled={false}
                        />
                      </View>
                    ) : (
                      <Text style={styles.cardPlaceholder}>Open full screen to view this file.</Text>
                    )}
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.priceLabel}>PRICE GUIDE</Text>
                    <Text style={styles.priceRange}>$2,350,000 — $2,550,000</Text>
                    <Text style={styles.cardDates}>Issued 12 Apr 2026 · Expires 12 Jul 2026</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.infoCard}>
                    <Text style={styles.cardMeta}>SOI · Upload from listing publish flow</Text>
                    <Text style={styles.cardBody}>
                      Indicative selling range and comparable sales as required by Victorian law. Attach a PDF or photo of
                      your SOI when you publish a listing.
                    </Text>
                    <Text style={styles.cardPlaceholder}>[ No file attached yet ]</Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.priceLabel}>PRICE GUIDE</Text>
                    <Text style={styles.priceRange}>$2,350,000 — $2,550,000</Text>
                    <Text style={styles.cardDates}>Issued 12 Apr 2026 · Expires 12 Jul 2026</Text>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.actions}>
              <AppButton variant="filled" onPress={openFullPreview} textStyle={styles.btnPrimary}>
                VIEW FULL DOCUMENT
              </AppButton>
              <View style={{ height: APP_BUTTON_STACK_GAP }} />
              <AppButton variant="outlined" onPress={() => void onDownload()} textStyle={styles.btnSecondary}>
                SHARE OR DOWNLOAD
              </AppButton>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  stack: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: { flex: 1 },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 8,
    maxHeight: '88%',
  },
  handleWrap: { alignItems: 'center', paddingVertical: 8 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  scroll: { maxHeight: 380 },
  scrollInner: { gap: 14, paddingBottom: 8 },
  loadingBox: { minHeight: 120, alignItems: 'center', justifyContent: 'center' },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  cardMeta: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 12,
  },
  cardPlaceholder: {
    fontSize: 13,
    fontStyle: 'italic',
    color: 'rgba(0, 0, 0, 0.45)',
  },
  sheetThumb: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  pdfPreviewBox: {
    height: PREVIEW_WEB_H,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  pdfWeb: {
    flex: 1,
    minHeight: PREVIEW_WEB_H,
    backgroundColor: '#fff',
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.8,
    color: 'rgba(0, 0, 0, 0.55)',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  priceRange: {
    fontSize: 22,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  cardDates: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 20,
  },
  actions: { marginTop: 20, paddingTop: 4 },
  btnPrimary: { fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.5 },
  btnSecondary: { fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.5, color: 'rgba(0,0,0,0.55)' },
});
