import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState, Fragment } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutRectangle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import {
  acknowledgeDealForViewer,
  canViewerAcknowledgeDeal,
  canWriteReviewForDeal,
  dealAcknowledgementStatusLabel,
  DEMO_CHAT_PROPERTY_REF,
  getDealAcknowledgement,
  type DealAcknowledgementRecord,
} from '@/lib/deal-acknowledgement';
import { AGENT_IMG, PROPERTY_IMG_1 } from '@/lib/propertyImages';
import { DEMO_PRIMARY_LISTING_TITLE } from '@/lib/melbourne-demo-locations';
import { accent, ink, slateNavy, Fonts } from '@/constants/theme';

/**
 * Kebab overflow — exact labels + order from Figma KebabMenu 903:1697.
 * [Message — Menu open](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=903-1586)
 */
const CHAT_MENU_ITEMS: { key: string; label: string; afterDivider?: boolean }[] = [
  { key: 'profile', label: 'View agent profile' },
  { key: 'reviews', label: 'View reviews' },
  { key: 'mute', label: 'Mute notifications' },
  { key: 'dispute', label: 'Raise a dispute' },
  { key: 'block', label: 'Block agent', afterDivider: true },
  { key: 'report', label: 'Report conversation', afterDivider: true },
];

/** Kebab menu — scaled up from Figma 903:1697 for readability + touch targets. */
const MENU_CARD_WIDTH = 296;
const MENU_PAD_H = 22;
const MENU_PAD_TOP = 18;
const MENU_PAD_BOTTOM = 20;
const MENU_INNER_WIDTH = MENU_CARD_WIDTH - MENU_PAD_H * 2;
const MENU_RIGHT_INSET = 14;
const MENU_ROW_H = 50;
const MENU_ITEM_GAP = 8;
const MENU_ANCHOR_GAP = 8;
const MENU_FONT_SIZE = 19;
const MENU_LINE_HEIGHT = 26;

/**
 * Contact seller / agent thread.
 * [Figma flow 1053:8028](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-8028)
 */
export default function ContactSellerChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { propertyRef: propertyRefParam } = useLocalSearchParams<{ propertyRef?: string }>();
  const propertyRef =
    typeof propertyRefParam === 'string' && propertyRefParam.trim().length > 0
      ? propertyRefParam.trim()
      : DEMO_CHAT_PROPERTY_REF;

  const menuAnchorRef = useRef<View>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchorRect, setMenuAnchorRect] = useState<LayoutRectangle | null>(null);
  const [deal, setDeal] = useState<DealAcknowledgementRecord | null>(null);
  const [ackBanner, setAckBanner] = useState<string | null>(null);

  const loadDeal = useCallback(() => {
    let alive = true;
    getDealAcknowledgement(propertyRef).then((row) => {
      if (alive) setDeal(row);
    });
    return () => {
      alive = false;
    };
  }, [propertyRef]);

  useFocusEffect(loadDeal);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMenuAnchorRect(null);
  }, []);

  const openMenu = useCallback(() => {
    const node = menuAnchorRef.current;
    const openWithRect = (rect: LayoutRectangle) => {
      setMenuAnchorRect(rect);
      setMenuOpen(true);
    };
    if (!node || typeof node.measureInWindow !== 'function') {
      const win = Dimensions.get('window');
      openWithRect({
        x: win.width - MENU_RIGHT_INSET - 36,
        y: insets.top + 12,
        width: 36,
        height: 44,
      });
      return;
    }
    requestAnimationFrame(() => {
      node.measureInWindow((x, y, width, height) => {
        openWithRect({ x, y, width, height });
      });
    });
  }, [insets.top]);

  const openWriteReview = useCallback(() => {
    router.push({
      pathname: '/write-review',
      params: { propertyRef },
    } as Href);
  }, [propertyRef, router]);

  const onAcknowledge = useCallback(async () => {
    try {
      const next = await acknowledgeDealForViewer(propertyRef);
      setDeal(next);
      if (canWriteReviewForDeal(next)) {
        setAckBanner('Both parties acknowledged this transaction.');
      } else {
        setAckBanner('Your acknowledgement is recorded. We will notify you when reviews are available.');
      }
    } catch {
      Alert.alert('Unable to acknowledge', 'Please try again in a moment.');
    }
  }, [propertyRef]);

  const onMenuAction = useCallback(
    (key: string) => {
      closeMenu();
      switch (key) {
        case 'profile':
          router.push('/agent-profile' as Href);
          break;
        case 'reviews':
          router.push('/agent-reviews' as Href);
          break;
        case 'dispute':
          router.push('/raise-dispute' as Href);
          break;
        case 'mute':
          Alert.alert('Notifications muted', 'You will not receive push alerts for this thread.');
          break;
        case 'block':
          Alert.alert('Agent blocked', 'This agent can no longer message you in OMM.');
          break;
        case 'report':
          Alert.alert('Report submitted', 'Our team will review this conversation.');
          break;
        default:
          break;
      }
    },
    [closeMenu, router],
  );

  const menuTop =
    menuAnchorRect != null ? menuAnchorRect.y + menuAnchorRect.height + MENU_ANCHOR_GAP : 0;
  const menuLeft = Dimensions.get('window').width - MENU_CARD_WIDTH - MENU_RIGHT_INSET;

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
        <View ref={menuAnchorRef} collapsable={false} style={styles.headerIcon}>
          <Pressable
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="More options"
            style={styles.headerKebabPressable}
            onPress={openMenu}>
            <FontAwesome name="ellipsis-v" size={18} color="#000000" />
          </Pressable>
        </View>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
        <View style={styles.menuRoot}>
          <Pressable
            style={styles.menuScrim}
            onPress={closeMenu}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          />
          {menuAnchorRect ? (
            <View
              pointerEvents="box-none"
              style={[styles.menuPopover, { left: menuLeft, top: menuTop }]}>
              <View style={styles.menuCard} accessibilityViewIsModal>
                {CHAT_MENU_ITEMS.map((item, index) => {
                  const prev = CHAT_MENU_ITEMS[index - 1];
                  const showDivider =
                    item.afterDivider === true && (prev == null || !prev.afterDivider);
                  return (
                    <Fragment key={item.key}>
                      {showDivider ? <View style={styles.menuDivider} /> : null}
                      <Pressable
                        onPress={() => onMenuAction(item.key)}
                        style={({ pressed }) => [
                          styles.menuRow,
                          pressed && styles.menuRowPressed,
                        ]}
                        accessibilityRole="button">
                        <Text style={styles.menuRowText} numberOfLines={1}>
                          {item.label}
                        </Text>
                      </Pressable>
                    </Fragment>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

      {deal ? (
        <View style={styles.dealBar}>
          <View style={styles.dealBarTextCol}>
            <Text style={styles.dealBarKicker}>TRANSACTION · {deal.propertyRef}</Text>
            <Text style={styles.dealBarTitle} numberOfLines={1}>
              {deal.suburb} · {deal.propertyType}
            </Text>
            <Text style={styles.dealBarStatus}>{dealAcknowledgementStatusLabel(deal)}</Text>
          </View>
          {canWriteReviewForDeal(deal) ? (
            <AppButton variant="filled" shrink onPress={openWriteReview} textStyle={styles.dealBarBtnLabel}>
              Leave review
            </AppButton>
          ) : canViewerAcknowledgeDeal(deal) ? (
            <AppButton variant="filled" shrink onPress={() => void onAcknowledge()} textStyle={styles.dealBarBtnLabel}>
              Acknowledge
            </AppButton>
          ) : null}
        </View>
      ) : null}

      <ScrollView
        style={styles.thread}
        contentContainerStyle={[styles.threadInner, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.datePillWrap}>
          <Text style={styles.datePill}>TODAY</Text>
        </View>

        {ackBanner ? (
          <View style={styles.systemBanner}>
            <Text style={styles.systemBannerText}>{ackBanner}</Text>
            {deal && canWriteReviewForDeal(deal) ? (
              <AppButton
                variant="filled"
                onPress={openWriteReview}
                style={styles.systemBannerBtn}
                textStyle={styles.systemBannerBtnLabel}>
                Leave review
              </AppButton>
            ) : null}
          </View>
        ) : null}

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
          <FontAwesome name="send" size={16} color={ink} style={{ marginLeft: 2 }} />
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
  headerKebabPressable: {
    width: '100%',
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  dealBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
    backgroundColor: '#f7f7f8',
  },
  dealBarTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  dealBarKicker: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    letterSpacing: 0.35,
  },
  dealBarTitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  dealBarStatus: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    marginTop: 2,
  },
  dealBarBtnLabel: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.2,
    textTransform: 'none',
  },
  systemBanner: {
    alignSelf: 'stretch',
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  systemBannerText: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(0, 0, 0, 0.65)',
    textAlign: 'center',
  },
  systemBannerBtn: {
    marginTop: 12,
    alignSelf: 'stretch',
    height: 44,
  },
  systemBannerBtnLabel: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.2,
    textTransform: 'none',
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
    backgroundColor: slateNavy,
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
    backgroundColor: accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  menuRoot: { flex: 1 },
  menuScrim: {
    ...StyleSheet.absoluteFillObject,
    /** MenuDim — #1a1a1a @ 32% (Figma 903:1696). */
    backgroundColor: 'rgba(26, 26, 26, 0.32)',
  },
  menuPopover: {
    position: 'absolute',
    width: MENU_CARD_WIDTH,
  },
  /** Kebab overflow menu — enlarged for legibility. */
  menuCard: {
    width: MENU_CARD_WIDTH,
    backgroundColor: '#fefdfb',
    borderRadius: 12,
    overflow: 'hidden',
    paddingTop: MENU_PAD_TOP,
    paddingBottom: MENU_PAD_BOTTOM,
    paddingHorizontal: MENU_PAD_H,
    alignItems: 'stretch',
    gap: MENU_ITEM_GAP,
    ...Platform.select({
      web: {
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      },
      default: {},
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
      },
      android: { elevation: 14 },
    }),
  },
  menuRow: {
    width: '100%',
    minWidth: MENU_INNER_WIDTH,
    minHeight: MENU_ROW_H,
    height: MENU_ROW_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    ...Platform.select({
      web: {
        display: 'flex',
        alignSelf: 'stretch',
      },
      default: {},
    }),
  },
  menuRowPressed: { backgroundColor: 'rgba(0, 0, 0, 0.06)' },
  menuRowText: {
    flex: 1,
    width: '100%',
    fontSize: MENU_FONT_SIZE,
    fontFamily: Fonts.regular,
    color: '#1a1a1a',
    lineHeight: MENU_LINE_HEIGHT,
    letterSpacing: -0.15,
  },
  menuDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f5f1ed',
    marginVertical: 4,
  },
});
