import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { brand } from '../theme/brand';
import {
  ACTIVITIES,
  type ActivityCategory,
  type ActivityPerspective,
  type ActivityRow,
} from '../data/activities';

type Props = RootStackScreenProps<'Activities'>;

type FilterKey = 'all' | 'offers' | 'inspections' | 'messages';

type Sheet =
  | { kind: 'none' }
  | { kind: 'agentMessage'; row: ActivityRow }
  | {
      kind: 'replyComposer';
      row: ActivityRow;
      draft: string;
    }
  | { kind: 'inspection'; row: ActivityRow }
  | { kind: 'reschedule'; row: ActivityRow };

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'offers', label: 'Offers' },
  { key: 'inspections', label: 'Inspections' },
  { key: 'messages', label: 'Messages' },
];

const CALENDAR_WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
/** April 2026: 1st is Wednesday (0=Sun) */
const APRIL_2026_START_PAD = 3;
const APRIL_2026_DAYS = 30;

function buildApril2026Weeks(): (number | null)[][] {
  const flat: (number | null)[] = [];
  for (let i = 0; i < APRIL_2026_START_PAD; i++) flat.push(null);
  for (let d = 1; d <= APRIL_2026_DAYS; d++) flat.push(d);
  while (flat.length % 7 !== 0) flat.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < flat.length; i += 7) weeks.push(flat.slice(i, i + 7));
  return weeks;
}

const RESCHEDULE_SLOTS = [
  { id: '1', range: '09:00–09:45', note: '2 groups ahead', selected: false },
  { id: '2', range: '10:30–11:15', note: 'Buyer tour', selected: true },
  { id: '3', range: '13:00–13:45', note: 'Afternoon window', selected: false },
] as const;

function categoryMatchesFilter(category: ActivityCategory, filter: FilterKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'offers') return category === 'offer';
  if (filter === 'inspections') return category === 'inspection';
  return category === 'message';
}

export function ActivitiesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [perspective, setPerspective] = useState<ActivityPerspective>('buyer');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sheet, setSheet] = useState<Sheet>({ kind: 'none' });
  const [toast, setToast] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(26);
  const [slots, setSlots] = useState(
    RESCHEDULE_SLOTS.map((s) => ({ ...s, selected: s.selected })),
  );

  const rows = useMemo(
    () =>
      ACTIVITIES.filter(
        (r) => r.perspective === perspective && categoryMatchesFilter(r.category, filter),
      ),
    [perspective, filter],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  const closeSheet = () => setSheet({ kind: 'none' });

  const openRow = (row: ActivityRow) => {
    if (row.category === 'inspection') {
      setSheet({ kind: 'inspection', row });
      return;
    }
    if (row.agentMessage) {
      setSheet({ kind: 'agentMessage', row });
      return;
    }
    setSheet({ kind: 'inspection', row });
  };

  const openReplyFromRow = (row: ActivityRow) => {
    const draft =
      row.category === 'inspection'
        ? ''
        : "Thanks M. - happy to lift to $2.05m subject to finance 10 days. Can we counter today?";
    setSheet({
      kind: 'replyComposer',
      row,
      draft,
    });
  };

  const sheetOpen = sheet.kind !== 'none';

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {toast ? (
        <View style={[styles.toast, { top: insets.top + 8 }]} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
          <Text style={styles.toastHint}>You can change alerts in Calendar settings.</Text>
        </View>
      ) : null}

      <SafeAreaView style={styles.safeTop} edges={['top']}>
        <Text style={styles.pageTitle}>Activities</Text>

        <View style={styles.segmentWrap}>
          <Pressable
            onPress={() => setPerspective('buyer')}
            style={[styles.segmentItem, perspective === 'buyer' && styles.segmentItemActive]}
          >
            <Text
              style={[styles.segmentText, perspective === 'buyer' && styles.segmentTextActive]}
            >
              BUYER
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setPerspective('seller')}
            style={[styles.segmentItem, perspective === 'seller' && styles.segmentItemActive]}
          >
            <Text
              style={[styles.segmentText, perspective === 'seller' && styles.segmentTextActive]}
            >
              SELLER
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionKicker}>AGENT INTERACTIONS</Text>

        <ScrollView
          contentContainerStyle={styles.listScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {rows.length === 0 ? (
            <Text style={styles.empty}>No activities in this view yet.</Text>
          ) : (
            rows.map((row) => (
              <Pressable
                key={row.id}
                onPress={() => openRow(row)}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <Image source={row.avatar} style={styles.avatar} />
                <View style={styles.rowBody}>
                  <View style={styles.rowTop}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {row.title}
                    </Text>
                    <Text style={styles.rowTime}>{row.timeLabel}</Text>
                  </View>
                  <Text style={styles.rowSub} numberOfLines={2}>
                    {row.subtitle}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.tabSafe}>
        <View style={styles.tabBar}>
          <TabItem
            icon="home-outline"
            active={false}
            onPress={() => navigation.navigate('Home', {})}
          />
          <TabItem icon="bar-chart" active onPress={() => {}} />
          <TabItem icon="add" large onPress={() => {}} />
          <TabItem
            icon="list"
            active={false}
            onPress={() => navigation.navigate('ManageListings')}
          />
          <TabItem icon="person-outline" active={false} onPress={() => {}} />
        </View>
      </SafeAreaView>

      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={closeSheet}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.overlay} onPress={closeSheet}>
            <View style={styles.overlayTint} />
          </Pressable>
          <View style={styles.sheetStack} pointerEvents="box-none">
            {sheet.kind === 'agentMessage' ? (
              <AgentMessageSheet
                row={sheet.row}
                onClose={closeSheet}
                onReply={() => openReplyFromRow(sheet.row)}
              />
            ) : null}
            {sheet.kind === 'replyComposer' ? (
              <ReplyComposerSheet
                row={sheet.row}
                initialDraft={sheet.draft}
                onClose={closeSheet}
                onSend={() => {
                  closeSheet();
                  showToast('Message sent');
                }}
              />
            ) : null}
            {sheet.kind === 'inspection' ? (
              <InspectionSheet
                row={sheet.row}
                onClose={closeSheet}
                onAddToCalendar={() => {
                  closeSheet();
                  showToast('Added to Apple Calendar • Sat 26 Apr • 10:30—11:15');
                }}
                onReply={() => openReplyFromRow(sheet.row)}
                onReschedule={() => setSheet({ kind: 'reschedule', row: sheet.row })}
              />
            ) : null}
            {sheet.kind === 'reschedule' ? (
              <RescheduleSheet
                row={sheet.row}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                slots={slots}
                onSelectSlot={(id) =>
                  setSlots((prev) => prev.map((s) => ({ ...s, selected: s.id === id })))
                }
                onClose={closeSheet}
                onConfirm={() => {
                  closeSheet();
                  showToast('Inspection updated • Sat 26 Apr • 10:30—11:15');
                }}
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TabItem({
  icon,
  active,
  large,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  large?: boolean;
  onPress: () => void;
}) {
  const iconColor = large ? brand.warmWhite : active ? brand.warmWhite : brand.charcoal;
  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <View
        style={[
          styles.tabIconWrap,
          active && !large && styles.tabIconWrapActive,
          large && styles.tabIconWrapLarge,
        ]}
      >
        <Ionicons name={icon} size={large ? 26 : 22} color={iconColor} />
      </View>
    </Pressable>
  );
}

function SheetChrome({
  children,
  tall,
  keyboard,
}: {
  children: React.ReactNode;
  tall?: boolean;
  keyboard?: boolean;
}) {
  const inner = (
    <Pressable onPress={(e) => e.stopPropagation()} style={[styles.sheet, tall && styles.sheetTall]}>
      <View style={styles.sheetHandle} />
      {children}
    </Pressable>
  );
  if (keyboard) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetKeyboardWrap}
      >
        {inner}
      </KeyboardAvoidingView>
    );
  }
  return inner;
}

function AgentMessageSheet({
  row,
  onClose,
  onReply,
}: {
  row: ActivityRow;
  onClose: () => void;
  onReply: () => void;
}) {
  return (
    <SheetChrome>
      <Text style={styles.sheetTitle}>{row.agentName ?? row.title}</Text>
      <Text style={styles.sheetMeta}>{row.agentRole}</Text>
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>{row.agentMessage}</Text>
      </View>
      <Text style={styles.bubbleTime}>{row.messageTimeDetail}</Text>
      <Pressable style={styles.primaryBtn} onPress={onReply}>
        <Text style={styles.primaryBtnLabel}>REPLY</Text>
      </Pressable>
      <Pressable style={styles.textDismiss} onPress={onClose}>
        <Text style={styles.textDismissLabel}>Close</Text>
      </Pressable>
    </SheetChrome>
  );
}

function ReplyComposerSheet({
  row,
  initialDraft,
  onClose,
  onSend,
}: {
  row: ActivityRow;
  initialDraft: string;
  onClose: () => void;
  onSend: () => void;
}) {
  const [text, setText] = useState(initialDraft);
  return (
    <SheetChrome tall keyboard>
      <Text style={styles.sheetTitle}>{row.agentName ?? row.title}</Text>
      <Text style={styles.sheetMeta}>{row.agentRole}</Text>
      {row.agentMessage ? (
        <>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{row.agentMessage}</Text>
          </View>
          <Text style={styles.bubbleTime}>{row.messageTimeDetail}</Text>
        </>
      ) : (
        <Text style={styles.composerContext}>{row.subtitle}</Text>
      )}
      <Text style={styles.inputLabel}>Message</Text>
      <TextInput
        style={styles.composerInput}
        value={text}
        onChangeText={setText}
        placeholder="Write a reply…"
        placeholderTextColor={brand.sage}
        multiline
      />
      <View style={styles.composerFooter}>
        <Text style={styles.attachmentsLabel}>Attachments</Text>
        <Pressable onPress={onSend} hitSlop={8}>
          <Text style={styles.sendLabel}>Send</Text>
        </Pressable>
      </View>
      <Pressable style={styles.textDismiss} onPress={onClose}>
        <Text style={styles.textDismissLabel}>Close</Text>
      </Pressable>
    </SheetChrome>
  );
}

function InspectionSheet({
  row,
  onClose,
  onAddToCalendar,
  onReply,
  onReschedule,
}: {
  row: ActivityRow;
  onClose: () => void;
  onAddToCalendar: () => void;
  onReply: () => void;
  onReschedule: () => void;
}) {
  return (
    <SheetChrome>
      <Text style={styles.sheetTitle}>Inspection scheduled</Text>
      {row.address ? <Text style={styles.sheetMetaDark}>{row.address}</Text> : null}
      <Text style={styles.inspectionBody}>{row.inspectionDetailLine}</Text>
      <Pressable style={styles.outlineBtn} onPress={onAddToCalendar}>
        <Text style={styles.outlineBtnLabel}>ADD TO CALENDAR</Text>
      </Pressable>
      <Pressable style={styles.primaryBtn} onPress={onReply}>
        <Text style={styles.primaryBtnLabel}>REPLY</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reschedule inspection time"
        onPress={onReschedule}
        style={({ pressed }) => [styles.rescheduleTextButton, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.rescheduleTextButtonLabel}>Reschedule Time</Text>
      </Pressable>
      <Pressable style={styles.textDismiss} onPress={onClose}>
        <Text style={styles.textDismissLabel}>Close</Text>
      </Pressable>
    </SheetChrome>
  );
}

function RescheduleSheet({
  row,
  selectedDay,
  onSelectDay,
  slots,
  onSelectSlot,
  onClose,
  onConfirm,
}: {
  row: ActivityRow;
  selectedDay: number;
  onSelectDay: (d: number) => void;
  slots: { id: string; range: string; note: string; selected: boolean }[];
  onSelectSlot: (id: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const calendarWeeks = useMemo(() => buildApril2026Weeks(), []);

  /** Leave room for handle + safe area; body scrolls so slots and actions stay reachable. */
  const rescheduleScrollMaxHeight = Math.min(windowHeight * 0.72, 560);

  return (
    <Pressable
      onPress={(e) => e.stopPropagation()}
      style={[styles.sheet, styles.sheetTall, styles.rescheduleSheetRoot]}
    >
      <View style={styles.sheetHandle} />
      <ScrollView
        style={[styles.rescheduleScroll, { maxHeight: rescheduleScrollMaxHeight }]}
        contentContainerStyle={styles.rescheduleScrollContent}
        showsVerticalScrollIndicator
        bounces
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <Text style={styles.sheetTitle}>Reschedule inspection</Text>
        <Text style={styles.sheetMetaDark}>
          {row.rescheduleSubtitle ?? row.address ?? row.title}
        </Text>
        <View style={styles.calendarCard}>
          <Text style={styles.calendarMonthInCard}>April 2026</Text>
          <View style={styles.calWeekRow}>
            {CALENDAR_WEEKDAYS.map((d, i) => (
              <Text key={`${d}-${i}`} style={styles.calWeekday}>
                {d}
              </Text>
            ))}
          </View>
          <View style={styles.calGrid}>
            {calendarWeeks.map((week, wi) => (
              <View key={`w-${wi}`} style={styles.calWeekOfDays}>
                {week.map((d, di) =>
                  d == null ? (
                    <View key={`e-${wi}-${di}`} style={styles.calCellSpacer} />
                  ) : (
                    <Pressable
                      key={d}
                      onPress={() => onSelectDay(d)}
                      style={[
                        styles.calCellDay,
                        selectedDay === d ? styles.calCellDaySelected : styles.calCellDayIdle,
                      ]}
                    >
                      <Text
                        style={[
                          styles.calDayNum,
                          selectedDay === d && styles.calDayNumSelected,
                        ]}
                      >
                        {d}
                      </Text>
                    </Pressable>
                  ),
                )}
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.slotsKicker}>AVAILABLE SLOTS · SAT 26 APR</Text>
        {slots.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => onSelectSlot(s.id)}
            style={[styles.slotRow, s.selected && styles.slotRowSelected]}
          >
            <Text style={[styles.slotRange, s.selected && styles.slotRangeSelected]}>
              {s.range}
              <Text style={[styles.slotNote, s.selected && styles.slotNoteSelected]}>
                {' · '}
                {s.note}
                {s.selected ? ' · Selected' : ''}
              </Text>
            </Text>
          </Pressable>
        ))}
        <Text style={styles.rescheduleFoot}>
          Arrive 10:20 for check-in · Photo ID required at door
        </Text>
        <View style={styles.rescheduleActions}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.rescheduleCancelBtn,
              pressed && styles.rescheduleBtnPressed,
            ]}
          >
            <Text style={styles.rescheduleCancelBtnLabel}>CANCEL</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            style={({ pressed }) => [
              styles.rescheduleConfirmBtn,
              pressed && styles.rescheduleBtnPressed,
            ]}
          >
            <Text style={styles.rescheduleConfirmBtnLabel}>CONFIRM NEW TIME</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.warmWhite },
  safeTop: { flex: 1, paddingHorizontal: brand.space.sm },
  pageTitle: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.title,
    fontWeight: '600',
    color: brand.charcoal,
    letterSpacing: -0.4,
    marginBottom: brand.space.sm,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: brand.cream,
    borderRadius: brand.radius.md,
    padding: 4,
    marginBottom: brand.space.sm,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: brand.radius.sm,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: brand.white,
    shadowColor: brand.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontFamily: brand.fontSans,
    fontSize: 13,
    fontWeight: brand.type.weightMedium,
    letterSpacing: 0.6,
    color: brand.sage,
  },
  segmentTextActive: {
    color: brand.charcoal,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    marginBottom: brand.space.md,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: brand.radius.pill,
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: brand.white,
    borderColor: 'rgba(26,26,26,0.12)',
  },
  chipActive: {
    backgroundColor: brand.terracotta,
    borderColor: brand.terracotta,
  },
  chipLabel: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  chipLabelActive: {
    color: brand.white,
    fontWeight: '600',
  },
  sectionKicker: {
    fontFamily: brand.fontSans,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '600',
    color: brand.sage,
    marginBottom: 12,
  },
  listScroll: { paddingBottom: 8 },
  empty: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.sage,
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(138,155,142,0.25)',
  },
  rowPressed: { opacity: 0.92 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: brand.cream,
  },
  rowBody: { flex: 1, marginLeft: 14, minWidth: 0 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  rowTitle: {
    flex: 1,
    fontFamily: brand.fontSans,
    fontSize: 16,
    fontWeight: '600',
    color: brand.charcoal,
    paddingRight: 8,
  },
  rowTime: {
    fontFamily: brand.fontSans,
    fontSize: 13,
    color: brand.sage,
  },
  rowSub: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    color: brand.sage,
    marginTop: 6,
    lineHeight: 20,
  },
  tabSafe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    marginHorizontal: brand.space.sm,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: brand.white,
    borderRadius: brand.radius.xl,
    paddingVertical: 10,
    paddingHorizontal: 4,
    shadowColor: brand.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.15)',
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', minWidth: 48 },
  tabIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: { backgroundColor: brand.charcoal },
  tabIconWrapLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: brand.terracotta,
  },
  toast: {
    position: 'absolute',
    left: brand.space.sm,
    right: brand.space.sm,
    zIndex: 50,
    backgroundColor: brand.charcoal,
    borderRadius: brand.radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  toastText: {
    fontFamily: brand.fontSans,
    fontSize: 13,
    fontWeight: '600',
    color: brand.warmWhite,
    textAlign: 'center',
  },
  toastHint: {
    fontFamily: brand.fontSans,
    fontSize: 11,
    color: 'rgba(254,253,251,0.7)',
    textAlign: 'center',
    marginTop: 6,
  },
  modalRoot: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTint: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheetStack: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheetKeyboardWrap: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: brand.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: brand.space.sm,
    paddingBottom: 28,
    paddingTop: 8,
    maxHeight: '78%',
  },
  sheetTall: { maxHeight: '88%' },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: brand.fontSans,
    fontSize: 22,
    fontWeight: '700',
    color: brand.charcoal,
  },
  sheetMeta: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    color: brand.sage,
    marginTop: 6,
    marginBottom: 16,
  },
  sheetMetaDark: {
    fontFamily: brand.fontSans,
    fontSize: 15,
    fontWeight: '500',
    color: '#5c5c5c',
    marginTop: 6,
    marginBottom: 12,
  },
  bubble: {
    backgroundColor: brand.cream,
    borderRadius: brand.radius.md,
    padding: 14,
  },
  bubbleText: {
    fontFamily: brand.fontSans,
    fontSize: 15,
    color: brand.charcoal,
    lineHeight: 22,
  },
  bubbleTime: {
    fontFamily: brand.fontSans,
    fontSize: 12,
    color: brand.sage,
    marginTop: 10,
    marginBottom: 20,
  },
  inspectionBody: {
    fontFamily: brand.fontSans,
    fontSize: 15,
    color: brand.charcoal,
    lineHeight: 22,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: brand.terracotta,
    borderRadius: brand.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryBtnLabel: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: brand.white,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: brand.charcoal,
    borderRadius: brand.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  outlineBtnLabel: {
    fontFamily: brand.fontSans,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: brand.charcoal,
  },
  rescheduleTextButton: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  rescheduleTextButtonLabel: {
    fontFamily: brand.fontSans,
    fontSize: 15,
    fontWeight: '600',
    color: brand.terracotta,
  },
  rescheduleSheetRoot: {
    overflow: 'hidden',
    paddingBottom: 12,
  },
  rescheduleScroll: {
    flexGrow: 0,
  },
  rescheduleScrollContent: {
    paddingBottom: 20,
  },
  textDismiss: { alignSelf: 'center', marginTop: 12, padding: 8 },
  textDismissLabel: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    color: brand.sage,
  },
  inputLabel: {
    fontFamily: brand.fontSans,
    fontSize: 12,
    color: brand.sage,
    marginBottom: 6,
  },
  composerInput: {
    borderWidth: 1,
    borderColor: 'rgba(26,26,26,0.12)',
    borderRadius: brand.radius.md,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: brand.fontSans,
    fontSize: 15,
    color: brand.charcoal,
    padding: 12,
    marginBottom: 12,
  },
  composerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  attachmentsLabel: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    color: brand.sage,
  },
  sendLabel: {
    fontFamily: brand.fontSans,
    fontSize: 16,
    fontWeight: '700',
    color: brand.terracotta,
  },
  composerContext: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    color: brand.sage,
    lineHeight: 20,
    marginBottom: 14,
  },
  calendarCard: {
    borderWidth: 1,
    borderColor: 'rgba(26,26,26,0.14)',
    borderRadius: 12,
    backgroundColor: brand.white,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 18,
  },
  calendarMonthInCard: {
    fontFamily: brand.fontSans,
    fontSize: 16,
    fontWeight: '700',
    color: brand.charcoal,
    marginBottom: 10,
  },
  calWeekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calWeekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: brand.fontSans,
    fontSize: 11,
    color: brand.sage,
    fontWeight: '600',
  },
  calGrid: {
    gap: 6,
  },
  calWeekOfDays: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  calCellSpacer: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 44,
  },
  calCellDay: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calCellDayIdle: {
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(26,26,26,0.14)',
    borderRadius: 8,
  },
  calCellDaySelected: {
    backgroundColor: brand.terracotta,
    borderWidth: 1,
    borderColor: brand.terracotta,
    borderRadius: 999,
  },
  calDayNum: {
    fontFamily: brand.fontSans,
    fontSize: 15,
    fontWeight: '500',
    color: brand.charcoal,
  },
  calDayNumSelected: { color: brand.white, fontWeight: '700' },
  slotsKicker: {
    fontFamily: brand.fontSans,
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: '700',
    color: brand.sage,
    marginBottom: 10,
  },
  slotRow: {
    borderRadius: 12,
    backgroundColor: '#ebe8e4',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  slotRowSelected: {
    backgroundColor: brand.terracotta,
  },
  slotRange: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    fontWeight: '600',
    color: brand.charcoal,
  },
  slotRangeSelected: { color: brand.white },
  slotNote: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    fontWeight: '400',
    color: brand.sage,
  },
  slotNoteSelected: { color: 'rgba(255,255,255,0.9)' },
  rescheduleFoot: {
    fontFamily: brand.fontSans,
    fontSize: 12,
    color: brand.sage,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  rescheduleActions: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    width: '100%',
    gap: 12,
    marginTop: 4,
  },
  rescheduleCancelBtn: {
    alignSelf: 'stretch',
    width: '100%',
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: brand.charcoal,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescheduleCancelBtnLabel: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.85,
    color: brand.charcoal,
  },
  rescheduleConfirmBtn: {
    alignSelf: 'stretch',
    width: '100%',
    backgroundColor: brand.terracotta,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescheduleConfirmBtnLabel: {
    fontFamily: brand.fontSans,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.75,
    color: brand.white,
  },
  rescheduleBtnPressed: {
    opacity: 0.88,
  },
});
