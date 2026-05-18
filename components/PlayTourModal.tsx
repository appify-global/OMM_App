import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BlurView } from 'expo-blur';
import { Text } from '@/components/OMMText';
import { Modal, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEMO_PRIMARY_LISTING_TITLE } from '@/lib/melbourne-demo-locations';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
};

/**
 * Agent walk-through — **centered card** on blurred listing (not full-screen).
 * [Figma flow 1053:8028](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-8028)
 */
export function PlayTourModal({ visible, onClose, title = DEMO_PRIMARY_LISTING_TITLE }: Props) {
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const cardW = Math.min(winW - 40, 400);
  const maxCardH = Math.min(winH - insets.top - insets.bottom - 48, 560);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        {Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
        ) : (
          <BlurView intensity={65} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.32)' }]}
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss tour"
        />
        <View
          pointerEvents="box-none"
          style={[
            StyleSheet.absoluteFill,
            {
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 12,
              paddingHorizontal: 20,
            },
          ]}>
          <View style={[styles.card, { width: cardW, maxHeight: maxCardH }]} accessibilityViewIsModal>
            <View style={styles.topBar}>
              <View style={styles.titleBlock}>
                <Text style={styles.headTitle}>{title}</Text>
                <Text style={styles.headSub}>WALK-THROUGH · 0:42</Text>
              </View>
              <Pressable
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close tour">
                <FontAwesome name="times" size={18} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.videoArea}>
              <View style={styles.walkBadge}>
                <Text style={styles.walkBadgeText}>AGENT WALK-THROUGH</Text>
              </View>
              <Text style={styles.timer}>0:00 / 0:42</Text>
              <Pressable style={styles.bigPlay} accessibilityRole="button" accessibilityLabel="Play">
                <FontAwesome name="play" size={28} color="#000000" style={{ marginLeft: 4 }} />
              </Pressable>
              <View style={styles.progressTrack}>
                <View style={styles.progressKnob} />
              </View>
            </View>

            <View style={styles.controlsRow}>
              <Pressable style={styles.ctrlCircle} accessibilityRole="button">
                <MaterialCommunityIcons name="rewind-10" size={22} color="#fff" />
              </Pressable>
              <Pressable style={styles.ctrlCircle} accessibilityRole="button">
                <FontAwesome name="play" size={22} color="#fff" />
              </Pressable>
              <Pressable style={styles.ctrlCircle} accessibilityRole="button">
                <MaterialCommunityIcons name="fast-forward-10" size={22} color="#fff" />
              </Pressable>
              <View style={{ flex: 1 }} />
              <Pressable style={styles.ctrlCircleSm} accessibilityRole="button">
                <FontAwesome name="music" size={14} color="#fff" />
              </Pressable>
              <Pressable style={[styles.ctrlCircleSm, { marginLeft: 10 }]} accessibilityRole="button">
                <MaterialCommunityIcons name="fullscreen" size={16} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerMeta}>● RECORDED 14 APR · AGENT</Text>
              <Pressable style={styles.savePill} accessibilityRole="button">
                <FontAwesome name="download" size={12} color="#000000" />
                <Text style={styles.saveText}>SAVE</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: {
    backgroundColor: '#161616',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
      },
      android: { elevation: 16 },
    }),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleBlock: { flex: 1, paddingRight: 12 },
  headTitle: { fontSize: 17, fontFamily: 'Satoshi-Medium', color: '#fff', marginBottom: 6 },
  headSub: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: 'rgba(255,255,255,0.62)', letterSpacing: 0.5 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoArea: {
    height: 220,
    marginHorizontal: 14,
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  walkBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(30,30,30,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  walkBadgeText: { fontSize: 9, fontFamily: 'Satoshi-Medium', color: '#fff', letterSpacing: 0.55 },
  timer: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
  },
  bigPlay: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressKnob: {
    position: 'absolute',
    left: 0,
    top: -4,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  ctrlCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlCircleSm: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 16,
  },
  footerMeta: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.35,
  },
  savePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  saveText: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: '#000000', letterSpacing: 0.4 },
});
