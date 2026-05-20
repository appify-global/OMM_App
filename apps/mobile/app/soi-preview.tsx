import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { Text } from '@/components/OMMText';
import { layout } from '@/constants/theme';
import {
  formatSoiSize,
  isSoiImageMime,
  isSoiPdfMime,
  loadSoiAttachment,
  type SoiAttachment,
} from '@/lib/soi-attachment';
import * as Sharing from 'expo-sharing';

function shortLabel(mime: string): string {
  if (isSoiPdfMime(mime)) return 'PDF';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'JPEG';
  if (mime.includes('png')) return 'PNG';
  if (mime.includes('webp')) return 'WebP';
  if (mime.includes('heic') || mime.includes('heif')) return 'HEIC';
  return 'Document';
}

export default function SoiPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [attachment, setAttachment] = useState<SoiAttachment | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
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
    }, []),
  );

  const onShare = async () => {
    if (!attachment) return;
    const ok = await Sharing.isAvailableAsync();
    if (!ok) {
      Alert.alert('Sharing', 'Sharing is not available on this device.');
      return;
    }
    try {
      await Sharing.shareAsync(attachment.uri, {
        mimeType: attachment.mimeType,
        dialogTitle: attachment.name,
        UTI: isSoiPdfMime(attachment.mimeType) ? 'com.adobe.pdf' : undefined,
      });
    } catch {
      Alert.alert('Sharing', 'Could not share this file.');
    }
  };

  const isImage = attachment != null && isSoiImageMime(attachment.mimeType);
  const isPdf = attachment != null && isSoiPdfMime(attachment.mimeType);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.headerIcon}>
          <FontAwesome name="chevron-left" size={20} color="#111111" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Statement of Information
        </Text>
        <Pressable
          onPress={onShare}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Share or download"
          style={styles.headerIcon}
          disabled={!attachment}>
          <FontAwesome name="share-alt" size={18} color={attachment ? '#111111' : 'rgba(17,17,17,0.25)'} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#111111" />
        </View>
      ) : !attachment ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No SOI attached</Text>
          <Text style={styles.emptySub}>Upload a Statement of Information from the listing flow.</Text>
        </View>
      ) : (
        <>
          <View style={styles.metaBlock}>
            <Text style={styles.fileName} numberOfLines={2}>
              {attachment.name}
            </Text>
            <Text style={styles.fileMeta}>
              {shortLabel(attachment.mimeType)} · {formatSoiSize(attachment.sizeBytes)}
            </Text>
          </View>
          {isImage ? (
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
              <Image
                source={{ uri: attachment.uri }}
                style={styles.previewImage}
                resizeMode="contain"
                accessibilityLabel={`SOI preview, ${attachment.name}`}
              />
            </ScrollView>
          ) : isPdf ? (
            <View style={styles.pdfWrap}>
              <WebView
                source={{ uri: attachment.uri }}
                style={styles.webview}
                originWhitelist={['*']}
                scalesPageToFit
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.webLoading}>
                    <ActivityIndicator color="#111111" />
                  </View>
                )}
              />
            </View>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.emptySub}>Preview is not available for this file type.</Text>
              <Pressable style={styles.shareBtn} onPress={onShare}>
                <Text style={styles.shareBtnText}>Open or share file</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  headerIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#111111',
    paddingHorizontal: 8,
  },
  metaBlock: {
    paddingHorizontal: layout.screenGutter,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  fileName: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#111111', lineHeight: 20 },
  fileMeta: { marginTop: 6, fontSize: 13, color: 'rgba(0,0,0,0.5)' },
  scroll: { flex: 1 },
  scrollInner: { padding: layout.screenGutter, alignItems: 'center' },
  previewImage: { width: '100%', minHeight: 320, maxWidth: 720 },
  pdfWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.04)' },
  webview: { flex: 1, backgroundColor: '#fff' },
  webLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 17, fontFamily: 'Satoshi-Medium', color: '#111111', marginBottom: 8 },
  emptySub: { fontSize: 14, color: 'rgba(0,0,0,0.5)', textAlign: 'center', lineHeight: 20 },
  shareBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#111111',
    borderRadius: 12,
  },
  shareBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Satoshi-Medium' },
});
