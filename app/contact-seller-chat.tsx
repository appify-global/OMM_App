import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AGENT_IMG, PROPERTY_IMG_1 } from '@/lib/propertyImages';
import { DEMO_PRIMARY_LISTING_TITLE } from '@/lib/melbourne-demo-locations';

const MENU_ITEMS_BEFORE: { key: string; label: string }[] = [
  { key: 'profile', label: 'View agent profile' },
  { key: 'reviews', label: 'View reviews' },
  { key: 'mute', label: 'Mute notifications' },
  { key: 'dispute', label: 'Raise a dispute' },
];

const MENU_ITEMS_AFTER: { key: string; label: string }[] = [
  { key: 'block', label: 'Block agent' },
  { key: 'report', label: 'Report conversation' },
];

/** Header row height (avatar 44 + vertical padding 24). */
const HEADER_CONTENT_H = 68;

/**
 * Contact seller / agent thread.
 * [Figma flow 1053:8028](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-8028)
 */
export default function ContactSellerChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.headerIcon}>
          <FontAwesome name="chevron-left" size={22} color="#000000" />
        </Pressable>
        <Image source={AGENT_IMG} style={styles.headerAvatar} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Anton Zhouk · {DEMO_PRIMARY_LISTING_TITLE}
          </Text>
          <Text style={styles.headerStatus}>ACTIVE NOW</Text>
        </View>
        <Pressable
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="More options"
          style={styles.headerIcon}
          onPress={() => setMenuOpen(true)}>
          <FontAwesome name="ellipsis-v" size={18} color="#000000" />
        </Pressable>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
        <View style={styles.menuRoot}>
          <Pressable
            style={styles.menuScrim}
            onPress={closeMenu}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          />
          <View
            pointerEvents="box-none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                paddingTop: insets.top + HEADER_CONTENT_H + 4,
                alignItems: 'flex-end',
                paddingRight: 10,
              },
            ]}>
            <View style={styles.menuCard} accessibilityViewIsModal>
              {MENU_ITEMS_BEFORE.map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => {
                    closeMenu();
                    if (item.key === 'profile') router.push('/agent-profile' as Href);
                    if (item.key === 'reviews') router.push('/agent-reviews' as Href);
                  }}
                  style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
                  accessibilityRole="button">
                  <Text style={styles.menuRowText}>{item.label}</Text>
                </Pressable>
              ))}
              <View style={styles.menuDivider} />
              {MENU_ITEMS_AFTER.map((item) => (
                <Pressable
                  key={item.key}
                  onPress={closeMenu}
                  style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
                  accessibilityRole="button">
                  <Text style={styles.menuRowText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.thread}
        contentContainerStyle={[styles.threadInner, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.datePillWrap}>
          <Text style={styles.datePill}>TODAY</Text>
        </View>

        <View style={styles.msgInWrap}>
          <View style={styles.bubbleIn}>
            <Text style={styles.msgInText}>
              Floorplan v2 received — loading into data room now.
            </Text>
          </View>
          <Text style={styles.timeIn}>10:42 AM</Text>
        </View>

        <View style={styles.msgOutWrap}>
          <View style={styles.bubbleOut}>
            <Text style={styles.msgOutText}>Legend — thanks, pinging vendor for sign-off.</Text>
          </View>
          <Text style={styles.timeOut}>10:45 AM</Text>
        </View>

        <View style={styles.msgInWrap}>
          <View style={styles.fileBubble}>
            <Image source={PROPERTY_IMG_1} style={styles.filePreview} resizeMode="cover" />
            <View style={styles.fileRow}>
              <Text style={styles.fileName} numberOfLines={1}>
                FLOOR_PLAN_V2.PDF
              </Text>
              <FontAwesome name="download" size={16} color="#000000" />
            </View>
          </View>
          <Text style={styles.timeIn}>10:46 AM</Text>
        </View>
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={styles.plusBtn} accessibilityRole="button" accessibilityLabel="Attach">
          <FontAwesome name="plus" size={18} color="#000000" />
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Send updated referral PDF when ready."
          placeholderTextColor="rgba(0, 0, 0, 0.45)"
          multiline
        />
        <Pressable style={styles.sendBtn} accessibilityRole="button" accessibilityLabel="Send">
          <FontAwesome name="send" size={16} color="#fff" style={{ marginLeft: 2 }} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
    gap: 10,
  },
  headerIcon: { width: 36, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: { width: 44, height: 44, borderRadius: 22 },
  headerText: { flex: 1, minWidth: 0 },
  headerTitle: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000' },
  headerStatus: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#2d8a54',
    letterSpacing: 0.6,
  },
  thread: { flex: 1 },
  threadInner: { paddingHorizontal: 16, paddingTop: 20 },
  datePillWrap: { alignItems: 'center', marginBottom: 24 },
  datePill: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  msgInWrap: { alignSelf: 'stretch', marginBottom: 20 },
  bubbleIn: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  msgInText: { fontSize: 15, lineHeight: 22, color: '#000000' },
  timeIn: { marginTop: 6, fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' },
  msgOutWrap: { alignSelf: 'stretch', marginBottom: 20, alignItems: 'flex-end' },
  bubbleOut: {
    maxWidth: '88%',
    backgroundColor: '#000000',
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  msgOutText: { fontSize: 15, lineHeight: 22, color: '#fff' },
  timeOut: { marginTop: 6, fontSize: 12, color: 'rgba(0, 0, 0, 0.45)', textAlign: 'right' },
  fileBubble: {
    alignSelf: 'flex-start',
    maxWidth: '92%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  filePreview: { width: 240, height: 140, backgroundColor: 'rgba(0,0,0,0.06)' },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  fileName: { flex: 1, fontSize: 13, fontFamily: 'Satoshi-Medium', color: '#000000' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
    gap: 10,
    backgroundColor: '#fff',
  },
  plusBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    fontSize: 15,
    lineHeight: 20,
    color: '#000000',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  menuRoot: { flex: 1 },
  menuScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  menuCard: {
    minWidth: 248,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  menuRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuRowPressed: { backgroundColor: 'rgba(0, 0, 0, 0.06)' },
  menuRowText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#3a3a3c',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginVertical: 4,
    marginHorizontal: 12,
  },
});
