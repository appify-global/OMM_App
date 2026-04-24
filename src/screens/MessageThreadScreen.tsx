import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { threadAvatarForName } from '../constants/avatars';
import { images } from '../constants/images';
import { brand } from '../theme/brand';

type Props = RootStackScreenProps<'MessageThread'>;

const MENU_ITEMS = [
  'View agent profile',
  'View reviews',
  'Mute notifications',
  'Raise a dispute',
  'Block agent',
  'Report conversation',
] as const;

export function MessageThreadScreen({ navigation, route }: Props) {
  const { name, address } = route.params;
  const [input, setInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const showAgent = name !== 'New thread';

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeTop} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.headerIcon}
          >
            <Ionicons name="chevron-back" size={26} color={brand.charcoal} />
          </Pressable>
          {showAgent ? (
            <View style={styles.headerCenter}>
              <Image source={threadAvatarForName(name)} style={styles.headerAvatar} />
              <View style={styles.headerTextCol}>
                <Text style={styles.headerName} numberOfLines={1}>
                  {name}
                </Text>
                {address ? (
                  <Text style={styles.headerMeta} numberOfLines={1}>
                    {address}
                  </Text>
                ) : null}
                <Text style={styles.activeNow}>ACTIVE NOW</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.headerTitleSolo}>New message</Text>
          )}
          {showAgent ? (
            <Pressable
              style={styles.headerIcon}
              onPress={() => setMenuOpen(true)}
              accessibilityLabel="Conversation options"
            >
              <Ionicons name="ellipsis-vertical" size={22} color={brand.charcoal} />
            </Pressable>
          ) : (
            <View style={styles.headerIcon} />
          )}
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.chatScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {showAgent ? (
          <>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>TODAY</Text>
            </View>
            <View style={styles.rowIn}>
              <View style={styles.bubbleIn}>
                <Text style={styles.bubbleInText}>
                  Floorplan v2 received — loading into data room now.
                </Text>
                <Text style={styles.msgTime}>10:42 AM</Text>
              </View>
            </View>
            <View style={styles.rowOut}>
              <View style={styles.bubbleOut}>
                <Text style={styles.bubbleOutText}>
                  Legend — thanks, pinging vendor for sign-off.
                </Text>
                <Text style={styles.msgTimeOut}>10:45 AM</Text>
              </View>
            </View>
            <View style={styles.rowIn}>
              <View style={styles.attachment}>
                <View style={styles.attachmentImageWrap}>
                  <Image
                    source={images.propertyHouse1}
                    style={styles.attachmentImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.attachmentBody}>
                  <View style={styles.attachmentInfo}>
                    <Ionicons name="document-text-outline" size={20} color={brand.charcoal} />
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      FLOOR_PLAN_V2.PDF
                    </Text>
                    <Pressable hitSlop={8}>
                      <Ionicons name="download-outline" size={20} color={brand.terracotta} />
                    </Pressable>
                  </View>
                  <Text style={styles.attachmentTime}>10:46 AM</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.emptyHint}>
            Start typing to send your first message in this thread.
          </Text>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.inputBar}>
        <View style={styles.composer}>
          <Pressable style={styles.plusBtn} hitSlop={8}>
            <Ionicons name="add" size={26} color={brand.charcoal} />
          </Pressable>
          <TextInput
            style={styles.composerInput}
            value={input}
            onChangeText={setInput}
            placeholder="Send updated referral PDF when ready."
            placeholderTextColor={brand.sage}
            multiline
          />
          <Pressable
            style={styles.sendBtn}
            onPress={() => setInput('')}
            accessibilityLabel="Send"
          >
            <Ionicons name="send" size={20} color={brand.warmWhite} />
          </Pressable>
        </View>
      </SafeAreaView>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.menuRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} />
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item) => (
              <View key={item}>
                {item === 'Block agent' ? <View style={styles.menuHr} /> : null}
                <Pressable
                  style={styles.menuRow}
                  onPress={() => {
                    if (item === 'View agent profile') {
                      setMenuOpen(false);
                      navigation.navigate('AgentProfile', {});
                      return;
                    }
                    if (item === 'View reviews') {
                      setMenuOpen(false);
                      navigation.navigate('AgentReviews', {});
                      return;
                    }
                    setMenuOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.menuText,
                      (item === 'Block agent' || item === 'Report conversation') &&
                        styles.menuTextDanger,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.warmWhite },
  safeTop: { backgroundColor: brand.warmWhite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: brand.space.xs,
    paddingBottom: brand.space.xs,
  },
  headerIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: brand.cream },
  headerTextCol: { marginLeft: 10, flex: 1 },
  headerName: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  headerMeta: {
    fontFamily: brand.fontSans,
    fontSize: 11,
    color: brand.sage,
    marginTop: 2,
  },
  activeNow: {
    fontFamily: brand.fontSans,
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: brand.type.weightMedium,
    color: '#2d6a4f',
    marginTop: 4,
  },
  headerTitleSolo: {
    flex: 1,
    textAlign: 'center',
    fontFamily: brand.fontSans,
    fontSize: brand.type.body,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  chatScroll: { padding: brand.space.sm, paddingBottom: 24 },
  datePill: { alignSelf: 'center', marginBottom: brand.space.md },
  datePillText: {
    fontFamily: brand.fontSans,
    fontSize: 11,
    color: brand.sage,
    backgroundColor: brand.cream,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: brand.radius.pill,
    overflow: 'hidden',
  },
  rowIn: { alignItems: 'flex-start', marginBottom: brand.space.sm },
  rowOut: { alignItems: 'flex-end', marginBottom: brand.space.sm },
  bubbleIn: {
    maxWidth: '88%',
    backgroundColor: brand.cream,
    borderRadius: brand.radius.md,
    padding: brand.space.sm,
  },
  bubbleInText: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.charcoal,
    lineHeight: 22,
  },
  bubbleOut: {
    maxWidth: '88%',
    backgroundColor: brand.charcoal,
    borderRadius: brand.radius.md,
    padding: brand.space.sm,
  },
  bubbleOutText: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.warmWhite,
    lineHeight: 22,
  },
  msgTime: {
    fontFamily: brand.fontSans,
    fontSize: 10,
    color: brand.sage,
    marginTop: 6,
  },
  msgTimeOut: {
    fontFamily: brand.fontSans,
    fontSize: 10,
    color: 'rgba(254,253,251,0.7)',
    marginTop: 6,
  },
  attachment: {
    width: '88%',
    alignSelf: 'flex-start',
    backgroundColor: brand.cream,
    borderRadius: brand.radius.md,
    overflow: 'hidden',
  },
  attachmentImageWrap: {
    position: 'relative',
    width: '100%',
    height: 100,
    backgroundColor: '#ddd9d3',
    overflow: 'hidden',
  },
  attachmentImage: {
    ...StyleSheet.absoluteFillObject,
  },
  attachmentBody: {
    padding: brand.space.sm,
    paddingTop: 10,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachmentTime: {
    fontFamily: brand.fontSans,
    fontSize: 10,
    color: brand.sage,
    marginTop: 8,
  },
  attachmentName: {
    flex: 1,
    fontFamily: brand.fontSans,
    fontSize: 12,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  emptyHint: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.sage,
    textAlign: 'center',
    marginTop: 40,
  },
  inputBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(138,155,142,0.35)',
    backgroundColor: brand.warmWhite,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: brand.space.sm,
    gap: 8,
  },
  plusBtn: { paddingBottom: 8 },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.charcoal,
    backgroundColor: brand.cream,
    borderRadius: brand.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: brand.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  menuCard: {
    position: 'absolute',
    top: 48,
    right: brand.space.sm,
    backgroundColor: brand.white,
    borderRadius: brand.radius.md,
    minWidth: 220,
    paddingVertical: 6,
    shadowColor: brand.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  menuRow: { paddingVertical: 12, paddingHorizontal: 16 },
  menuHr: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(138,155,142,0.4)',
    marginHorizontal: 12,
  },
  menuText: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.charcoal,
  },
  menuTextDanger: { color: '#8b2942' },
});
