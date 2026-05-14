import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Text } from '@/components/OMMText';
import { Alert, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { PL_PAD, PL_BORDER, PL_MUTED, PL_TITLE, PrimaryCta, PublishStepHeader, fieldShell, useListingFlowBottomPad } from './_shared';

export default function PublishListingMedia() {
  const router = useRouter();
  const bottomPad = useListingFlowBottomPad();
  const { width } = useWindowDimensions();
  const innerW = width - PL_PAD * 2;
  const gap = 8;
  const cell = (innerW - gap * 2) / 3;

  const saveDraft = useCallback(() => {
    Alert.alert('Draft saved', 'Your listing draft has been saved.');
  }, []);

  return (
    <View style={[styles.root, { paddingBottom: bottomPad }]}>
      <PublishStepHeader step={2} onBack={() => router.back()} onSaveDraft={saveDraft} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Add Media Assets</Text>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>PROPERTY PHOTOS</Text>
            <Pressable onPress={() => Alert.alert('Photos', 'Photo picker would open here.')} hitSlop={8}>
              <Text style={styles.addLink}>
                <Text style={styles.addPlus}>+  </Text>
                ADD PHOTOS (0/10)
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={[styles.photoDrop, fieldShell]}
            onPress={() => Alert.alert('Photos', 'Browse photos.')}>
            <View style={styles.uploadGlyph}>
              <FontAwesome name="cloud-upload" size={22} color="#000000" />
            </View>
            <Text style={styles.dropTitle}>Drag photos here or click to browse</Text>
            <Text style={styles.dropSub}>JPG, PNG up to 10MB • Max 10 photos</Text>
          </Pressable>
          <View style={[styles.grid, { width: innerW }]}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Pressable
                key={i}
                style={[styles.gridCell, fieldShell, { width: cell, height: cell }]}
                onPress={() => Alert.alert('Photos', 'Add photo slot.')}>
                <FontAwesome name="plus" size={20} color={PL_BORDER} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>PROPERTY VIDEO</Text>
            <Pressable onPress={() => Alert.alert('Video', 'Video picker would open.')} hitSlop={8}>
              <Text style={styles.addLink}>
                <Text style={styles.addPlus}>+  </Text>
                ADD VIDEO (0/3)
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={[styles.sideBox, fieldShell]}
            onPress={() => Alert.alert('Video', 'Upload tour video.')}>
            <View style={styles.sideIcon}>
              <FontAwesome name="play" size={18} color="#000000" style={{ marginLeft: 3 }} />
            </View>
            <View style={styles.sideText}>
              <Text style={styles.sideTitle}>Upload property tour video</Text>
              <Text style={styles.sideSub}>MP4, MOV up to 500MB • Max 3 videos</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { marginBottom: 12 }]}>FLOOR PLAN</Text>
          <Pressable
            style={[styles.sideBox, fieldShell]}
            onPress={() => Alert.alert('Floor plan', 'Upload floor plan.')}>
            <View style={styles.sideIcon}>
              <FontAwesome name="file-o" size={18} color="#000000" />
            </View>
            <View style={styles.sideText}>
              <Text style={styles.sideTitle}>Upload floor plan</Text>
              <Text style={styles.sideSub}>PDF, PNG, JPG up to 10MB</Text>
            </View>
          </Pressable>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={{ paddingBottom: 6 }}>
        <PrimaryCta label="CONTINUE" onPress={() => router.push('/add/soi' as Href)} />
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
  addPlus: { fontFamily: 'Satoshi-Medium' },
  photoDrop: {
    borderRadius: 8,
    minHeight: 177,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    marginBottom: 12,
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
  gridCell: { borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
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
  sideText: { flex: 1 },
  sideTitle: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: '#000000' },
  sideSub: { fontSize: 11, color: PL_MUTED, marginTop: 4 },
});
