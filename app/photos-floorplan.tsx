import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Text } from '@/components/OMMText';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Photos & floorplan — manage listing media.
 * [Figma 1053:9141](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-9141&t=2eZigRM0BwNtC5wd-4)
 */

import { ScreenHeader } from '@/components/ScreenHeader';
import { useScreenHorizontalPadding } from '@/lib/useScreenHorizontalPadding';
import { PROPERTY_IMG_1 } from '@/lib/propertyImages';

const H_PAD = 20;
const GRID_GAP = 10;
const THUMB_RADIUS = 12;
const DASH = {
  borderWidth: 1.5,
  borderColor: 'rgba(0, 0, 0, 0.45)',
  borderStyle: 'dashed' as const,
  backgroundColor: '#fff',
};

export default function PhotosFloorplanScreen() {
  const insets = useSafeAreaInsets();
  const hPad = useScreenHorizontalPadding();
  const router = useRouter();
  const winW = Dimensions.get('window').width;
  const cell = (winW - H_PAD * 2 - GRID_GAP * 2) / 3;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.headBlock, hPad]}>
        <ScreenHeader title="Photos & floorplan" onBack={() => router.back()} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.subtitle}>Drag to reorder — image 1 is cover on cards & PDF.</Text>

        <View style={styles.grid}>
          {/* Row 1 */}
          <View style={[styles.thumbWrap, { width: cell, height: cell }]}>
            <Image source={PROPERTY_IMG_1} style={styles.thumbImg} resizeMode="cover" />
            <View style={styles.coverBadge}>
              <Text style={styles.coverBadgeText}>COVER</Text>
            </View>
            <View style={styles.uploadingOverlay}>
              <Text style={styles.uploadingText}>UPLOADING…</Text>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>
          </View>
          <Image
            source={PROPERTY_IMG_1}
            style={[styles.thumbImgOut, { width: cell, height: cell }]}
            resizeMode="cover"
          />
          <Image
            source={PROPERTY_IMG_1}
            style={[styles.thumbImgOut, { width: cell, height: cell }]}
            resizeMode="cover"
          />
          {/* Row 2 */}
          <Image
            source={PROPERTY_IMG_1}
            style={[styles.thumbImgOut, { width: cell, height: cell }]}
            resizeMode="cover"
          />
          <Image
            source={PROPERTY_IMG_1}
            style={[styles.thumbImgOut, { width: cell, height: cell }]}
            resizeMode="cover"
          />
          <Pressable
            style={[styles.uploadTile, { width: cell, height: cell }, DASH]}
            accessibilityRole="button"
            accessibilityLabel="Upload photo">
            <MaterialCommunityIcons name="tray-arrow-up" size={28} color="rgba(0, 0, 0, 0.4)" />
          </Pressable>
        </View>

        <Text style={styles.floorLabel}>FLOOR PLAN</Text>
        <View style={[styles.floorCard, DASH]}>
          <MaterialCommunityIcons name="file-document-outline" size={28} color="#000000" />
          <View style={styles.floorTextCol}>
            <Text style={styles.floorName} numberOfLines={1}>
              hawthorn_floorplan_v3.pdf
            </Text>
            <Text style={styles.floorMeta}>1.2MB</Text>
          </View>
          <MaterialCommunityIcons name="tray-arrow-up" size={24} color="#8b7355" />
        </View>

        <Pressable
          style={styles.saveBtn}
          onPress={() => router.back()}
          accessibilityRole="button">
          <Text style={styles.saveBtnText}>SAVE MEDIA</Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          style={styles.cancelWrap}
          accessibilityRole="button"
          accessibilityLabel="Cancel">
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: H_PAD, paddingTop: 4 },
  headBlock: { paddingTop: 8, paddingBottom: 8 },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 20,
    marginBottom: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginBottom: 28,
  },
  thumbWrap: {
    borderRadius: THUMB_RADIUS,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  thumbImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  thumbImgOut: {
    borderRadius: THUMB_RADIUS,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  coverBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  coverBadgeText: { fontSize: 9, fontFamily: 'Satoshi-Medium', color: '#fff', letterSpacing: 0.35 },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  uploadingText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.25,
    marginBottom: 10,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '42%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  uploadTile: {
    borderRadius: THUMB_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.48)',
    letterSpacing: 0.65,
    marginBottom: 10,
  },
  floorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: THUMB_RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 28,
  },
  floorTextCol: { flex: 1, minWidth: 0 },
  floorName: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000' },
  floorMeta: { fontSize: 13, fontWeight: '400', color: 'rgba(0, 0, 0, 0.5)', marginTop: 4 },
  saveBtn: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.35 },
  cancelWrap: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  cancel: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)' },
});
