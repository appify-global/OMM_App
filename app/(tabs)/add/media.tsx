import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text } from '@/components/OMMText';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  LISTING_MAX_PHOTOS,
  LISTING_MAX_VIDEOS,
  captureListingPhoto,
  captureListingVideo,
  pickListingPhotos,
  pickListingVideos,
  pickListingFloorPlan,
} from '@/lib/listing-media-pickers';
import { formatSoiSize } from '@/lib/soi-attachment';

import {
  PL_PAD,
  PL_BORDER,
  PL_MUTED,
  PL_TITLE,
  PrimaryCta,
  PublishStepHeader,
  fieldShell,
  useListingFlowBottomPad,
} from '@/components/list-add/flow-shared';
import { useListingDraft } from '@/components/list-add/listing-draft-context';

export default function PublishListingMedia() {
  const router = useRouter();
  const bottomPad = useListingFlowBottomPad();
  const { draftPhotos, setDraftPhotos, draftVideos, setDraftVideos, draftFloorPlan, setDraftFloorPlan, touchDraftSaved } =
    useListingDraft();
  const { width } = useWindowDimensions();
  const innerW = width - PL_PAD * 2;
  const gap = 8;
  const cell = (innerW - gap * 2) / 3;

  const photos = draftPhotos;
  const videos = draftVideos;
  const floorPlan = draftFloorPlan;
  const [busy, setBusy] = useState<'photos' | 'videos' | 'floor' | null>(null);

  const slotsLeft = LISTING_MAX_PHOTOS - photos.length;
  const videosLeft = LISTING_MAX_VIDEOS - videos.length;

  const saveDraft = useCallback(() => {
    touchDraftSaved();
    Alert.alert('Draft saved', 'Your listing draft has been saved.');
  }, [touchDraftSaved]);

  const mergePhotoResult = useCallback(
    (r: Awaited<ReturnType<typeof pickListingPhotos>>) => {
      if (!r.ok) {
        if (r.canceled) return;
        if (r.error) Alert.alert('Photos', r.error);
        return;
      }
      setDraftPhotos((prev) => [...prev, ...r.items].slice(0, LISTING_MAX_PHOTOS));
    },
    [setDraftPhotos],
  );

  const mergeVideoResult = useCallback(
    (r: Awaited<ReturnType<typeof pickListingVideos>>) => {
      if (!r.ok) {
        if (r.canceled) return;
        if (r.error) Alert.alert('Video', r.error);
        return;
      }
      setDraftVideos((prev) => [...prev, ...r.items].slice(0, LISTING_MAX_VIDEOS));
    },
    [setDraftVideos],
  );

  const requestAddPhotos = useCallback(
    (librarySelectionLimit: number, slotsRemaining: number) => {
      if (slotsRemaining <= 0) {
        Alert.alert('Photo limit', `You can upload up to ${LISTING_MAX_PHOTOS} photos.`);
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

  const requestAddVideos = useCallback(
    (slotsRemaining: number) => {
      if (slotsRemaining <= 0) {
        Alert.alert('Video limit', `You can upload up to ${LISTING_MAX_VIDEOS} tour videos.`);
        return;
      }
      Alert.alert(
        'Add video',
        'Record with your camera or pick a clip from your library.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Record video',
            onPress: () => {
              void (async () => {
                setBusy('videos');
                try {
                  const r = await captureListingVideo(slotsRemaining);
                  mergeVideoResult(r);
                } finally {
                  setBusy(null);
                }
              })();
            },
          },
          {
            text: 'Video library',
            onPress: () => {
              void (async () => {
                setBusy('videos');
                try {
                  const r = await pickListingVideos(slotsRemaining);
                  mergeVideoResult(r);
                } finally {
                  setBusy(null);
                }
              })();
            },
          },
        ],
      );
    },
    [mergeVideoResult],
  );

  const handlePickFloorPlan = useCallback(async () => {
    setBusy('floor');
    try {
      const r = await pickListingFloorPlan();
      if (!r.ok) {
        if (r.canceled) return;
        if (r.error) Alert.alert('Floor plan', r.error);
        return;
      }
      setDraftFloorPlan(r.floor);
    } finally {
      setBusy(null);
    }
  }, [setDraftFloorPlan]);

  const removePhoto = useCallback((id: string) => {
    setDraftPhotos((prev) => prev.filter((p) => p.id !== id));
  }, [setDraftPhotos]);

  const removeVideo = useCallback((id: string) => {
    setDraftVideos((prev) => prev.filter((v) => v.id !== id));
  }, [setDraftVideos]);

  return (
    <View style={[styles.root, { paddingBottom: bottomPad }]}>
      <PublishStepHeader step={2} onBack={() => router.back()} onSaveDraft={saveDraft} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Add Media Assets</Text>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>PROPERTY PHOTOS</Text>
            <Pressable
              onPress={() => requestAddPhotos(slotsLeft, slotsLeft)}
              hitSlop={8}
              disabled={busy !== null || slotsLeft <= 0}
              accessibilityRole="button"
              accessibilityLabel="Add property photos">
              <Text style={[styles.addLink, (busy !== null || slotsLeft <= 0) && styles.addLinkDisabled]}>
                <Text style={styles.addPlus}>+ </Text>
                ADD PHOTOS ({photos.length}/{LISTING_MAX_PHOTOS})
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={[styles.photoDrop, fieldShell, busy === 'photos' && styles.slotBusy]}
            onPress={() => requestAddPhotos(slotsLeft, slotsLeft)}
            disabled={busy !== null || slotsLeft <= 0}
            accessibilityRole="button"
            accessibilityLabel="Add property photos — camera or library">
            {busy === 'photos' ? (
              <ActivityIndicator size="large" color="#000" style={{ marginVertical: 24 }} />
            ) : (
              <>
                <View style={styles.uploadGlyph}>
                  <FontAwesome name="cloud-upload" size={22} color="#000000" />
                </View>
                <Text style={styles.dropTitle}>Tap to take photos or add from library</Text>
                <Text style={styles.dropSub}>JPG, PNG, HEIC up to 10MB • Max 10 photos</Text>
              </>
            )}
          </Pressable>
          <View style={[styles.grid, { width: innerW }]}>
            {Array.from({ length: LISTING_MAX_PHOTOS }).map((_, i) => {
              const p = photos[i];
              const canAddSlot = slotsLeft > 0 && busy === null;
              return (
                <View key={p?.id ?? `slot-${i}`} style={[styles.gridCellOuter, { width: cell, height: cell }]}>
                  {p ? (
                    <>
                      <Image source={{ uri: p.uri }} style={[styles.gridThumb, fieldShell]} resizeMode="cover" />
                      <Pressable
                        style={styles.removeBadge}
                        onPress={() => removePhoto(p.id)}
                        hitSlop={6}
                        accessibilityRole="button"
                        accessibilityLabel="Remove photo">
                        <FontAwesome name="times" size={14} color="#ffffff" />
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      style={[styles.gridCell, fieldShell, (!canAddSlot || busy !== null) && styles.gridCellDisabled]}
                      disabled={!canAddSlot || busy !== null}
                      onPress={() => requestAddPhotos(1, slotsLeft)}
                      accessibilityRole="button"
                      accessibilityLabel={canAddSlot ? 'Add photo' : undefined}>
                      <FontAwesome name="plus" size={20} color={canAddSlot && !busy ? PL_BORDER : PL_MUTED} />
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>PROPERTY VIDEO</Text>
            <Pressable
              onPress={() => requestAddVideos(videosLeft)}
              hitSlop={8}
              disabled={busy !== null || videosLeft <= 0}
              accessibilityRole="button"
              accessibilityLabel="Add property videos">
              <Text style={[styles.addLink, (busy !== null || videosLeft <= 0) && styles.addLinkDisabled]}>
                <Text style={styles.addPlus}>+ </Text>
                ADD VIDEO ({videos.length}/{LISTING_MAX_VIDEOS})
              </Text>
            </Pressable>
          </View>

          {videos.map((v) => (
            <View key={v.id} style={styles.videoRowWrap}>
              <View style={[styles.sideBox, fieldShell, styles.mediaCardGrow]}>
                <View style={styles.sideIcon}>
                  <FontAwesome name="play" size={18} color="#000000" style={{ marginLeft: 3 }} />
                </View>
                <View style={styles.sideText}>
                  <Text style={styles.sideTitle} numberOfLines={2}>
                    {v.name}
                  </Text>
                  <Text style={styles.sideSub}>{formatSoiSize(v.sizeBytes)}</Text>
                </View>
              </View>
              <Pressable
                style={styles.videoStripRemove}
                onPress={() => removeVideo(v.id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Remove video">
                <FontAwesome name="trash-o" size={18} color="rgba(0,0,0,0.45)" />
              </Pressable>
            </View>
          ))}

          {videos.length === 0 ? (
            <Pressable
              style={[styles.sideBox, fieldShell, busy === 'videos' && styles.slotBusy]}
              onPress={() => requestAddVideos(videosLeft)}
              disabled={busy !== null || videosLeft <= 0}
              accessibilityRole="button"
              accessibilityLabel="Add tour video — record or library">
              {busy === 'videos' ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <View style={styles.sideIcon}>
                    <FontAwesome name="play" size={18} color="#000000" style={{ marginLeft: 3 }} />
                  </View>
                  <View style={styles.sideText}>
                    <Text style={styles.sideTitle}>Tour video — record or upload</Text>
                    <Text style={styles.sideSub}>MP4, MOV up to 500MB • Max 3 videos</Text>
                  </View>
                </>
              )}
            </Pressable>
          ) : videosLeft > 0 ? (
            <Pressable
              onPress={() => requestAddVideos(videosLeft)}
              disabled={busy !== null}
              style={styles.addAnotherVideo}
              accessibilityRole="button"
              accessibilityLabel="Add another video">
              {busy === 'videos' ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.addLink}>+ ADD ANOTHER VIDEO</Text>
              )}
            </Pressable>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { marginBottom: 12 }]}>FLOOR PLAN</Text>
          <View style={styles.floorRow}>
            <Pressable
              style={[styles.sideBox, fieldShell, styles.mediaCardGrow, busy === 'floor' && styles.slotBusy]}
              onPress={() => void handlePickFloorPlan()}
              disabled={busy !== null}
              accessibilityRole="button"
              accessibilityLabel={floorPlan ? 'Replace floor plan' : 'Upload floor plan'}>
              {busy === 'floor' ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <View style={styles.sideIcon}>
                    <FontAwesome name="file-o" size={18} color="#000000" />
                  </View>
                  <View style={styles.sideText}>
                    {floorPlan ? (
                      <>
                        <Text style={styles.sideTitle} numberOfLines={2}>
                          {floorPlan.name}
                        </Text>
                        <Text style={styles.sideSub}>
                          {formatSoiSize(floorPlan.sizeBytes)}
                          {' · '}Tap to replace
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.sideTitle}>Upload floor plan</Text>
                        <Text style={styles.sideSub}>PDF, PNG, JPG up to 10MB</Text>
                      </>
                    )}
                  </View>
                </>
              )}
            </Pressable>
            {floorPlan && busy !== 'floor' ? (
              <Pressable
                onPress={() => setDraftFloorPlan(null)}
                hitSlop={8}
                style={styles.floorClearHit}
                accessibilityRole="button"
                accessibilityLabel="Remove floor plan">
                <FontAwesome name="times" size={22} color="rgba(0,0,0,0.5)" />
              </Pressable>
            ) : null}
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={{ paddingBottom: 6 }}>
        <PrimaryCta label="CONTINUE" onPress={() => router.push('/add/soi' as Href)} disabled={busy !== null} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingTop: 12, paddingHorizontal: PL_PAD, paddingBottom: 16 },
  pageTitle: { fontSize: 24, fontFamily: 'Satoshi-Medium', color: PL_TITLE, marginBottom: 28 },
  section: { marginBottom: 24 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLabel: { fontSize: 10, color: '#565656', letterSpacing: 0.25, textTransform: 'uppercase' },
  addLink: { fontSize: 11, fontFamily: 'Satoshi-Medium', color: '#000' },
  addLinkDisabled: { opacity: 0.35 },
  addPlus: { fontFamily: 'Satoshi-Medium' },
  addAnotherVideo: { marginTop: 10, alignSelf: 'flex-start' },
  slotBusy: { opacity: 0.75 },
  photoDrop: {
    borderRadius: 8,
    minHeight: 177,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    marginBottom: 12,
    justifyContent: 'center',
  },
  uploadGlyph: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#cbcbcb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dropTitle: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: '#000000' },
  dropSub: { fontSize: 11, color: PL_MUTED, marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridCellOuter: { position: 'relative' },
  gridCell: { borderRadius: 4, alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%', height: '100%' },
  gridCellDisabled: { opacity: 0.35 },
  gridThumb: {
    borderRadius: 4,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  removeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mediaCardGrow: { flex: 1, minWidth: 0 },
  videoRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  videoStripRemove: { padding: 8 },
  sideBox: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 22,
    paddingHorizontal: 22,
    minHeight: 116,
  },
  sideIcon: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#cbcbcb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideText: { flex: 1, minWidth: 0 },
  sideTitle: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: '#000000' },
  sideSub: { fontSize: 11, color: PL_MUTED, marginTop: 4 },
  floorClearHit: { padding: 8 },
});
