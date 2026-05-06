import { AppButton } from '@/components/AppButton';
import { useCallback, useEffect, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Activities — buyer/seller feed, filters, detail sheets.
 * [Figma 1053:5705](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-5705)
 */

const PAD = 32;
const IMG = require('@/assets/images/welcome-bg.jpg');

const COMPOSE_DRAFT_DEFAULT =
  'Thanks M. — happy to lift to $2.05m subject to finance 10 days. Can we counter today?';

type Role = 'buyer' | 'seller';
type FilterKey = 'all' | 'offers' | 'inspections' | 'messages';

type ActivityKind = 'message' | 'inspection';

type ActivityRow = {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle: string;
  time: string;
  sheetTitle: string;
  sheetSubtitle: string;
  sheetBody: string;
  sheetTime?: string;
};

type SheetView =
  | 'message-read'
  | 'message-compose'
  | 'inspection-summary'
  | 'inspection-reschedule';

type ActiveSheet = {
  row: ActivityRow;
  view: SheetView;
};

/** April 2026: Wed = 1st → 3 leading blanks (Sun–Tue). */
const APRIL_2026_LEADING_EMPTY = 3;
const APRIL_2026_DAYS = 30;

const TIME_SLOTS = [
  { id: 'a', label: '09:00–09:45 • 2 groups ahead', sub: false },
  { id: 'b', label: '10:30–11:15 • Buyer tour', sub: true },
  { id: 'c', label: '13:00–13:45 • Afternoon window', sub: false },
] as const;

const ACTIVITIES: ActivityRow[] = [
  {
    id: '1',
    kind: 'message',
    title: 'M. Patel',
    subtitle: 'Offer $2.35m — vendor wants $2.42m walk-away.',
    time: '2m',
    sheetTitle: 'M. Patel',
    sheetSubtitle: 'Listing agent · Hawthorn City Center',
    sheetBody:
      'Thanks for your offer. It is below what the seller will accept for this property. They are open to a counter closer to the list price.',
    sheetTime: '2 minutes ago',
  },
  {
    id: '2',
    kind: 'inspection',
    title: 'Inspection Scheduled',
    subtitle: "You've booked 137, Art Colony, Colling……",
    time: '8h',
    sheetTitle: 'Inspection scheduled',
    sheetSubtitle: '12 Denham St, Hawthorn VIC',
    sheetBody: 'Sat 26 Apr · 10:30—11:15 · Buyer tour · Arrive 10:20 for check-in.',
  },
];

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipOn : styles.chipOff]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}>
      <Text style={[styles.chipLabel, active && styles.chipLabelOn]}>{label}</Text>
    </Pressable>
  );
}

function ActivityRowView({
  row,
  onPress,
}: {
  row: ActivityRow;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      <Image source={IMG} style={styles.avatar} resizeMode="cover" />
      <View style={styles.rowText}>
        <View style={styles.rowTop}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {row.title}
          </Text>
          <Text style={styles.rowTime}>{row.time}</Text>
        </View>
        <Text style={styles.rowSub} numberOfLines={2}>
          {row.subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

function CalendarMonthApril2026({
  selectedDay,
  onSelectDay,
}: {
  selectedDay: number;
  onSelectDay: (d: number) => void;
}) {
  const cells: (number | null)[] = [];
  for (let i = 0; i < APRIL_2026_LEADING_EMPTY; i++) cells.push(null);
  for (let d = 1; d <= APRIL_2026_DAYS; d++) cells.push(d);
  const rows: ((number | null)[] )[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const row = cells.slice(i, i + 7);
    while (row.length < 7) row.push(null);
    rows.push(row);
  }

  const weekLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.calCard}>
      <Text style={styles.calMonthTitle}>April 2026</Text>
      <View style={styles.calWeekRow}>
        {weekLetters.map((w, i) => (
          <View key={`${w}-${i}`} style={styles.calWeekCell}>
            <Text style={styles.calWeekLetter}>{w}</Text>
          </View>
        ))}
      </View>
      <View style={styles.calGrid}>
        {rows.map((rowCells, ri) => (
          <View key={ri} style={styles.calRow}>
            {rowCells.map((d, ci) =>
              d == null ? (
                <View key={`e-${ri}-${ci}`} style={styles.calCell} />
              ) : (
                <Pressable
                  key={d}
                  onPress={() => onSelectDay(d)}
                  style={[styles.calCell, selectedDay === d && styles.calCellSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedDay === d }}
                  accessibilityLabel={`${d} April`}>
                  <Text style={[styles.calCellText, selectedDay === d && styles.calCellTextSelected]}>{d}</Text>
                </Pressable>
              ),
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ActivitiesScreen() {
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<Role>('buyer');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sheet, setSheet] = useState<ActiveSheet | null>(null);
  const [draft, setDraft] = useState(COMPOSE_DRAFT_DEFAULT);
  const [selectedDay, setSelectedDay] = useState(26);
  const [selectedSlotId, setSelectedSlotId] = useState<(typeof TIME_SLOTS)[number]['id']>('b');
  const [toast, setToast] = useState<string | null>(null);

  const padH = Math.max(PAD, insets.left, insets.right);

  const dismissSheet = useCallback(() => {
    setSheet(null);
    setDraft(COMPOSE_DRAFT_DEFAULT);
    setSelectedDay(26);
    setSelectedSlotId('b');
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const openRow = (row: ActivityRow) => {
    setDraft(COMPOSE_DRAFT_DEFAULT);
    setSheet({
      row,
      view: row.kind === 'message' ? 'message-read' : 'inspection-summary',
    });
  };

  const filtered = ACTIVITIES.filter((row) => {
    if (filter === 'all') return true;
    if (filter === 'messages') return row.kind === 'message';
    if (filter === 'inspections') return row.kind === 'inspection';
    if (filter === 'offers') return row.kind === 'message';
    return true;
  });

  const showCompose = sheet?.view === 'message-compose';
  const slotLabel = TIME_SLOTS.find((s) => s.id === selectedSlotId)?.label ?? '';
  const confirmToastLine = `Added to Apple Calendar · Sat 26 Apr · ${slotLabel.split('•')[0]?.trim() ?? '10:30–11:15'}`;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollInner,
          { paddingHorizontal: padH, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Activities</Text>

        <View style={[styles.segment, { marginTop: 20 }]}>
          <Pressable
            onPress={() => setRole('buyer')}
            style={[styles.segmentBtn, role === 'buyer' && styles.segmentBtnOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: role === 'buyer' }}>
            <Text style={[styles.segmentLabel, role === 'buyer' && styles.segmentLabelOn]}>BUYER</Text>
          </Pressable>
          <Pressable
            onPress={() => setRole('seller')}
            style={[styles.segmentBtn, role === 'seller' && styles.segmentBtnOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: role === 'seller' }}>
            <Text style={[styles.segmentLabel, role === 'seller' && styles.segmentLabelOn]}>SELLER</Text>
          </Pressable>
        </View>

        <View style={styles.chipRowHost}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            bounces={false}
            style={styles.chipScroller}
            contentContainerStyle={[styles.chipStrip, { paddingHorizontal: 0 }]}>
            <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
            <Chip label="Offers" active={filter === 'offers'} onPress={() => setFilter('offers')} />
            <Chip
              label="Inspections"
              active={filter === 'inspections'}
              onPress={() => setFilter('inspections')}
            />
            <Chip label="Messages" active={filter === 'messages'} onPress={() => setFilter('messages')} />
          </ScrollView>
        </View>

        <Text style={styles.kicker}>AGENT INTERACTIONS</Text>

        {filtered.map((row, i) => (
          <View key={row.id}>
            <ActivityRowView row={row} onPress={() => openRow(row)} />
            {i < filtered.length - 1 ? <View style={styles.rule} /> : null}
          </View>
        ))}
      </ScrollView>

      {toast ? (
        <>
          <View style={styles.toastScrim} pointerEvents="none" />
          <View style={[styles.toastWrap, { paddingTop: insets.top + 12 }]} pointerEvents="none">
            <View style={styles.toastPill}>
              <Text style={styles.toastPillText}>{toast}</Text>
            </View>
            <Text style={styles.toastHint}>You can change alerts in Calendar settings.</Text>
          </View>
        </>
      ) : null}

      <Modal
        visible={sheet != null}
        animationType="slide"
        transparent
        onRequestClose={dismissSheet}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}>
          <Pressable style={styles.modalScrimFlex} onPress={dismissSheet} accessibilityLabel="Dismiss" />
          <View style={[styles.sheet, { paddingBottom: showCompose ? 12 : insets.bottom + 20 }]}>
            <View style={styles.grabber} />

            {sheet?.view === 'message-read' ? (
              <>
                <Text style={styles.sheetTitle}>{sheet.row.sheetTitle}</Text>
                <Text style={styles.sheetMeta}>{sheet.row.sheetSubtitle}</Text>
                <View style={styles.bubble}>
                  <Text style={styles.bubbleText}>{sheet.row.sheetBody}</Text>
                </View>
                {sheet.row.sheetTime ? <Text style={styles.sheetTime}>{sheet.row.sheetTime}</Text> : null}
                <AppButton
                  variant="filled"
                  onPress={() => setSheet({ row: sheet.row, view: 'message-compose' })}
                  accessibilityLabel="Reply"
                  textStyle={{ letterSpacing: 0.6, fontWeight: '700' }}>
                  REPLY
                </AppButton>
              </>
            ) : null}

            {sheet?.view === 'message-compose' ? (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.composeScroll}>
                <Text style={styles.sheetTitle}>{sheet.row.sheetTitle}</Text>
                <Text style={styles.sheetMeta}>{sheet.row.sheetSubtitle}</Text>
                <View style={styles.bubble}>
                  <Text style={styles.bubbleText}>{sheet.row.sheetBody}</Text>
                </View>
                {sheet.row.sheetTime ? <Text style={styles.sheetTime}>{sheet.row.sheetTime}</Text> : null}
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  style={styles.composeInput}
                  multiline
                  textAlignVertical="top"
                  placeholderTextColor="rgba(60,60,67,0.35)"
                />
                <View style={styles.composeToolbar}>
                  <Pressable accessibilityRole="button" hitSlop={8}>
                    <Text style={styles.composeAttach}>Attachments</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" hitSlop={8}>
                    <Text style={styles.composeSend}>Send</Text>
                  </Pressable>
                </View>
              </ScrollView>
            ) : null}

            {sheet?.view === 'inspection-summary' ? (
              <>
                <Text style={styles.sheetTitle}>{sheet.row.sheetTitle}</Text>
                <Text style={styles.sheetMeta}>{sheet.row.sheetSubtitle}</Text>
                <Text style={styles.inspectionDetail}>{sheet.row.sheetBody}</Text>
                <AppButton
                  variant="outlined"
                  onPress={() => setSheet({ row: sheet.row, view: 'inspection-reschedule' })}
                  textStyle={{ letterSpacing: 0.5, fontWeight: '700' }}>
                  ADD TO CALENDAR
                </AppButton>
                <View style={{ height: 12 }} />
                <AppButton
                  variant="filled"
                  onPress={() => setSheet({ row: sheet.row, view: 'message-compose' })}
                  textStyle={{ letterSpacing: 0.6, fontWeight: '700' }}>
                  REPLY
                </AppButton>
              </>
            ) : null}

            {sheet?.view === 'inspection-reschedule' ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.rescheduleScroll}>
                <Text style={styles.sheetTitle}>Reschedule inspection</Text>
                <Text style={styles.rescheduleSub}>12 Denham St, Hawthorn VIC • Buyer tour</Text>
                <CalendarMonthApril2026 selectedDay={selectedDay} onSelectDay={setSelectedDay} />
                <Text style={styles.slotsKicker}>AVAILABLE SLOTS • SAT {selectedDay} APR</Text>
                {TIME_SLOTS.map((s) => {
                  const on = selectedSlotId === s.id;
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => setSelectedSlotId(s.id)}
                      style={[styles.slotPill, on && styles.slotPillOn]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}>
                      <Text style={[styles.slotPillText, on && styles.slotPillTextOn]}>
                        {s.label}
                        {s.sub ? (on ? ' • Selected' : '') : ''}
                      </Text>
                    </Pressable>
                  );
                })}
                <Text style={styles.slotFootnote}>Arrive 10:20 for check-in • Photo ID required at door</Text>
                <AppButton
                  variant="outlined"
                  onPress={() => sheet && setSheet({ row: sheet.row, view: 'inspection-summary' })}
                  textStyle={{ letterSpacing: 0.5, fontWeight: '700' }}>
                  CANCEL
                </AppButton>
                <View style={{ height: 12 }} />
                <AppButton
                  variant="filled"
                  onPress={() => {
                    setToast(confirmToastLine);
                    dismissSheet();
                  }}
                  textStyle={{ letterSpacing: 0.5, fontWeight: '700' }}>
                  CONFIRM NEW TIME
                </AppButton>
              </ScrollView>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f7f5' },
  scroll: { flex: 1, minHeight: 0 },
  scrollInner: { paddingTop: 24 },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1c1c1e',
    letterSpacing: -0.3,
  },
  segment: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#ebe8e2',
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnOn: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(60,60,67,0.55)',
  },
  segmentLabelOn: {
    fontWeight: '700',
    color: '#1c1c1e',
  },
  chipRowHost: {
    flexGrow: 0,
    flexShrink: 0,
    marginTop: 16,
    marginBottom: 8,
  },
  chipScroller: { flexGrow: 0, flexShrink: 0 },
  chipStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexGrow: 0,
    paddingRight: 8,
  },
  chip: {
    height: 31,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: '#1c1c1e' },
  chipOff: {
    backgroundColor: '#ebe8e2',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.2)',
  },
  chipLabel: { fontSize: 13, fontWeight: '500', color: '#2e2e2e' },
  chipLabelOn: { color: '#fff' },
  kicker: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: 'rgba(60,60,67,0.45)',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, gap: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5e5e5' },
  rowText: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  rowTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1c1c1e' },
  rowTime: { fontSize: 13, fontWeight: '500', color: 'rgba(60,60,67,0.45)' },
  rowSub: { marginTop: 6, fontSize: 14, lineHeight: 20, color: 'rgba(60,60,67,0.55)' },
  rule: {
    marginLeft: 64,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.12)',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalScrimFlex: { flex: 1 },
  sheet: {
    backgroundColor: '#f4f1eb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 10,
    maxHeight: '92%',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(60,60,67,0.25)',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 6,
  },
  sheetMeta: {
    fontSize: 14,
    color: 'rgba(60,60,67,0.55)',
    marginBottom: 16,
  },
  bubble: {
    backgroundColor: '#ebe8e2',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1c1c1e',
  },
  sheetTime: {
    fontSize: 13,
    color: 'rgba(60,60,67,0.45)',
    marginBottom: 20,
  },
  inspectionDetail: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1c1c1e',
    marginBottom: 24,
  },
  composeScroll: { paddingBottom: 24 },
  inputLabel: {
    fontSize: 13,
    color: 'rgba(60,60,67,0.5)',
    marginBottom: 8,
  },
  composeInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.2)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    color: '#1c1c1e',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  composeToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: -4,
    paddingLeft: 16,
    paddingRight: 16,
  },
  composeAttach: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  composeSend: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  rescheduleScroll: { paddingBottom: 28 },
  rescheduleSub: {
    fontSize: 14,
    color: 'rgba(60,60,67,0.55)',
    marginBottom: 18,
  },
  calCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.1)',
    padding: 14,
    marginBottom: 20,
  },
  calMonthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 12,
  },
  calWeekRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
  },
  calWeekCell: {
    flex: 1,
    alignItems: 'center',
  },
  calWeekLetter: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(60,60,67,0.4)',
  },
  calGrid: {
    gap: 4,
  },
  calRow: {
    flexDirection: 'row',
    gap: 4,
  },
  calCell: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  calCellSelected: {
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
  },
  calCellText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  calCellTextSelected: {
    color: '#fff',
  },
  slotsKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: 'rgba(60,60,67,0.45)',
    marginBottom: 10,
  },
  slotPill: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ebe8e2',
    marginBottom: 8,
  },
  slotPillOn: {
    backgroundColor: '#1c1c1e',
  },
  slotPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  slotPillTextOn: {
    color: '#fff',
  },
  slotFootnote: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(60,60,67,0.45)',
    marginTop: 4,
    marginBottom: 20,
  },
  toastScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 40,
  },
  toastWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    zIndex: 50,
  },
  toastPill: {
    backgroundColor: '#1c1c1e',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    maxWidth: '92%',
  },
  toastPillText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  toastHint: {
    marginTop: 10,
    fontSize: 13,
    color: 'rgba(60,60,67,0.55)',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
