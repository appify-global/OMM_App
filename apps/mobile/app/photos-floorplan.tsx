import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text } from '@/components/OMMText';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, controlRadius, ink, layout, slateNavy } from '@/constants/theme';
/**
 * Photos & floorplan - manage listing media.
 * [Figma 1053:9141](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-9141&t=2eZigRM0BwNtC5wd-4)
 */

import {
  LISTING_MAX_PHOTOS,
  captureListingPhoto,
  pickListingFloorPlan,
  pickListingPhotos,
  type ListingDraftFloorPlan,
  type ListingDraftPhoto,
} from '@/lib/listing-media-pickers';
import { formatSoiSize } from '@/lib/soi-attachment';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';

const GRID_GAP = 10;
const THUMB_RADIUS = 12;
const CARD_OUTLINE = {
  borderWidth: FIELD_OUTLINE_WIDTH,
  borderColor: FIELD_OUTLINE_COLOR,
  backgroundColor: '#fff',
};

export default function PhotosFloorplanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const winW = Dimensions.get('window').width;
  const cell = (winW - layout.screenGutter * 2 - GRID_GAP * 2) / 3;

  const [photos, setPhotos] = useState<ListingDraftPhoto[]>([]);
  const [floorPlan, setFloorPlan] = useState<ListingDraftFloorPlan | null>(null);
  const [busy, setBusy] = useState<'photos' | 'floor' | null>(null);

  const slotsLeft = LISTING_MAX_PHOTOS - photos.length;

  const mergePhotoResult = useCallback((r: Awaited<ReturnType<typeof pickListingPhotos>>) => {
    if (!r.ok) {
      if (r.canceled) return;
      if (r.error) Alert.alert('Photos', r.error);
      return;
    }
    setPhotos((prev) => [...prev, ...r.items].slice(0, LISTING_MAX_PHOTOS));
  }, []);

  const requestAddPhotos = useCallback(
    (librarySelectionLimit: number, slotsRemaining: number) => {
      if (slotsRemaining <= 0) {
        Alert.alert('Photo limit', `You can add up to ${LISTING_MAX_PHOTOS} photos.`);
        return;
      }
      const libraryCap = Math.max(1, Math.min(librarySelectionLimit, slotsRemaining));
      Alert.alert(
        'Add photos',
        'Take pictures with your camera or choose photos you already have.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Take photo',
            onPress: () => {
              void (async () => {
                setBusy('photos');
                try {
                  const r = await captureListingPhoto(slotsRemaining);
                  mergePhotoResult(r);
                } finally {
                  setBusy(null);
                }
              })();
            },
          },
          {
            text: 'Photo library',
            onPress: () => {
              void (async () => {
                setBusy('photos');
                try {
                  const r = await pickListingPhotos(libraryCap);
                  mergePhotoResult(r);
                } finally {
                  setBusy(null);
                }
              })();
            },
          },
        ],
      );
    },
    [mergePhotoResult],
  );

  const pickFloor = useCallback(async () => {
    setBusy('floor');
    try {
      const r = await pickListingFloorPlan();
      if (!r.ok) {
        if (r.canceled) return;
        if (r.error) Alert.alert('Floor plan', r.error);
        return;
      }
      setFloorPlan(r.floor);
    } finally {
      setBusy(null);
    }
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.title}>Photos & floorplan</Text>
        <Text style={styles.subtitle}>Drag to reorder - image 1 is cover on cards & PDF.</Text>

        <View style={styles.grid}>
          {Array.from({ length: LISTING_MAX_PHOTOS }).map((_, i) => {
            const p = photos[i];
            const canAdd = slotsLeft > 0 && busy === null;
            return (
              <View key={p?.id ?? `slot-${i}`} style={{ width: cell, height: cell }}>
                {p ? (
                  <View style={[styles.thumbWrap, { width: '100%', height: '100%' }]}>
                    <Image source={{ uri: p.uri }} style={styles.thumbImg} resizeMode="cover" />
                    {i === 0 ? (
                      <View style={styles.coverBadge}>
                        <Text style={styles.coverBadgeText}>COVER</Text>
                      </View>
                    ) : null}
                    <Pressable
                      style={styles.removeBadge}
                      onPress={() => removePhoto(p.id)}
                      hitSlop={6}
                      accessibilityRole="button"
                      accessibilityLabel="Remove photo">
                      <MaterialCommunityIcons name="close" size={16} color="#ffffff" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    style={[styles.uploadTile, { width: '100%', height: '100%' }, CARD_OUTLINE]}
                    disabled={!canAdd || busy !== null}
                    onPress={() => requestAddPhotos(slotsLeft, slotsLeft)}
                    accessibilityRole="button"
                    accessibilityLabel="Add photo - camera or library">
                    {busy === 'photos' ? (
                      <ActivityIndicator color="rgba(0,0,0,0.45)" />
                    ) : (
                      <MaterialCommunityIcons
                        name="tray-arrow-up"
                        size={28}
                        color={canAdd ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)'}
                      />
                    )}
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.floorLabel}>FLOOR PLAN</Text>

        <Pressable
          style={[styles.floorCard, CARD_OUTLINE, busy === 'floor' && styles.floorBusy]}
          onPress={() => void pickFloor()}
          disabled={busy !== null}
          accessibilityRole="button"
          accessibilityLabel={
            floorPlan ? 'Replace floor plan document' : 'Upload floor plan - PDF or image'
          }>
          <MaterialCommunityIcons name="file-document-outline" size={28} color="#000000" />
          <View style={styles.floorTextCol}>
            {floorPlan ? (
              <>
                <Text style={styles.floorName} numberOfLines={1}>
                  {floorPlan.name}
                </Text>
                <Text style={styles.floorMeta}>
                  {formatSoiSize(floorPlan.sizeBytes)} · Tap to replace
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.floorName} numberOfLines={1}>
                  Upload floor plan
                </Text>
                <Text style={styles.floorMeta}>PDF, PNG or JPG · up to 10MB</Text>
              </>
            )}
          </View>
          {busy === 'floor' ? (
            <ActivityIndicator color="#000" />
          ) : (
            <MaterialCommunityIcons name="tray-arrow-up" size={24} color="#8b7355" />
          )}
        </Pressable>

        {floorPlan ? (
          <Pressable
            onPress={() => setFloorPlan(null)}
            style={styles.clearFloor}
            accessibilityRole="button"
            accessibilityLabel="Remove floor plan">
            <Text style={styles.clearFloorText}>Remove floor plan</Text>
          </Pressable>
        ) : null}

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
  scroll: { paddingHorizontal: layout.screenGutter, paddingTop: 4 },
  title: {
    fontSize: 28,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: -0.6,
    marginBottom: 10,
  },
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
  removeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.52)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: slateNavy,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  coverBadgeText: { fontSize: 9, fontFamily: 'Satoshi-Medium', color: '#fff', letterSpacing: 0.35 },
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
  floorBusy: { opacity: 0.72 },
  floorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: THUMB_RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 12,
  },
  floorTextCol: { flex: 1, minWidth: 0 },
  floorName: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000' },
  floorMeta: { fontSize: 13, fontWeight: '400', color: 'rgba(0, 0, 0, 0.5)', marginTop: 4 },
  clearFloor: { alignSelf: 'flex-start', marginBottom: 20, paddingVertical: 4 },
  clearFloorText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
  },
  saveBtn: {
    backgroundColor: accent,
    height: 52,
    borderRadius: controlRadius.listingCta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: ink,
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.35,
  },
  cancelWrap: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  cancel: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)' },
});
