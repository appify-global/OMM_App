import { AppButton } from '@/components/AppButton';
import { Text } from '@/components/OMMText';
import { accent, ink } from '@/constants/theme';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DEFAULT_INSPECTION_AVAILABILITY_TAGS,
  DEFAULT_INSPECTION_SCHEDULE_SLOTS,
  defaultInspectionSlotId,
  inspectionScheduleFootnote,
  inspectionScheduleSellerLine,
  inspectionSlotsForSeller,
  normalizeInspectionSlotId,
  type InspectionAvailabilityTags,
  type InspectionSlotId,
  type InspectionSlotOption,
} from '@/lib/listing-inspection-availability';

/** Demo slots when no seller prefs — Activities demo rows, legacy listings. */
export const INSPECTION_TIME_SLOTS = DEFAULT_INSPECTION_SCHEDULE_SLOTS;

export type InspectionTimeSlot = InspectionSlotOption;
export type { InspectionSlotId };

/** April 2026 grid — Wednesday 1st → 3 leading blanks (Sun–Tue). */
const APRIL_2026_LEADING_EMPTY = 3;
const APRIL_2026_DAYS = 30;

function april2026WeekdayShort(day: number): string {
  const d = new Date(2026, 3, day);
  return d
    .toLocaleDateString('en-AU', { weekday: 'short' })
    .replace(/\.$/, '')
    .toUpperCase();
}

export function inspectionSlotsKicker(selectedDay: number): string {
  return `AVAILABLE SLOTS • ${april2026WeekdayShort(selectedDay)} ${selectedDay} APR`;
}

export function inspectionConfirmToastLine(
  selectedDay: number,
  slotFullLabel: string,
): string {
  const d = new Date(2026, 3, selectedDay);
  const w = d.toLocaleDateString('en-AU', { weekday: 'short' }).replace(/\.$/, '');
  const slotShort = slotFullLabel.split('•')[0]?.trim() ?? slotFullLabel;
  return `Added to Apple Calendar · ${w} ${selectedDay} Apr · ${slotShort}`;
}

export function InspectionCalendarApril2026({
  selectedDay,
  onSelectDay,
}: {
  selectedDay: number;
  onSelectDay: (d: number) => void;
}) {
  const cells: (number | null)[] = [];
  for (let i = 0; i < APRIL_2026_LEADING_EMPTY; i++) cells.push(null);
  for (let d = 1; d <= APRIL_2026_DAYS; d++) cells.push(d);
  const rows: (number | null)[][] = [];
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
            {rowCells.map((dayNum, ci) =>
              dayNum == null ? (
                <View key={`e-${ri}-${ci}`} style={styles.calCell} />
              ) : (
                <Pressable
                  key={dayNum}
                  onPress={() => onSelectDay(dayNum)}
                  style={[styles.calCell, selectedDay === dayNum && styles.calCellSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedDay === dayNum }}
                  accessibilityLabel={`${dayNum} April`}
                >
                  <Text
                    style={[
                      styles.calCellText,
                      selectedDay === dayNum && styles.calCellTextSelected,
                    ]}>
                    {dayNum}
                  </Text>
                </Pressable>
              ),
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export type InspectionScheduleScrollBodyProps = {
  /** Sheet headline */
  title?: string;
  /** Subtitle line (property + tour type) */
  propertyLine: string;
  /** From listing step 3 — filters slots and copy; omit for demo defaults. */
  sellerAvailabilityTags?: InspectionAvailabilityTags | null;
  sellerAvailabilityNotes?: string;
  selectedDay: number;
  onSelectDay: (d: number) => void;
  selectedSlotId: InspectionSlotId;
  onSelectSlotId: (id: InspectionSlotId) => void;
  onCancel: () => void;
  onConfirm: () => void;
  /** Primary confirm action label */
  confirmButtonLabel?: string;
};

function resolveScheduleSlots(
  sellerAvailabilityTags?: InspectionAvailabilityTags | null,
  sellerAvailabilityNotes?: string,
): InspectionSlotOption[] {
  if (sellerAvailabilityTags == null) {
    return [...DEFAULT_INSPECTION_SCHEDULE_SLOTS];
  }
  return inspectionSlotsForSeller(
    sellerAvailabilityTags,
    sellerAvailabilityNotes ?? '',
  );
}

export function InspectionScheduleScrollBody({
  title = 'Schedule inspection',
  propertyLine,
  sellerAvailabilityTags = null,
  sellerAvailabilityNotes = '',
  selectedDay,
  onSelectDay,
  selectedSlotId,
  onSelectSlotId,
  onCancel,
  onConfirm,
  confirmButtonLabel = 'CONFIRM TIME',
}: InspectionScheduleScrollBodyProps) {
  const tags = sellerAvailabilityTags ?? DEFAULT_INSPECTION_AVAILABILITY_TAGS;
  const notes = sellerAvailabilityNotes ?? '';
  const slots = useMemo(
    () => resolveScheduleSlots(sellerAvailabilityTags, notes),
    [sellerAvailabilityTags, notes],
  );
  const sellerLine = useMemo(() => {
    if (sellerAvailabilityTags == null) return null;
    return inspectionScheduleSellerLine(tags, notes);
  }, [sellerAvailabilityTags, tags, notes]);
  const footnote = useMemo(
    () =>
      sellerAvailabilityTags != null
        ? inspectionScheduleFootnote(tags, notes)
        : 'Arrive 10:20 for check-in · Photo ID required at door',
    [sellerAvailabilityTags, tags, notes],
  );
  const activeSlotId = normalizeInspectionSlotId(slots, selectedSlotId);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.rescheduleScroll}>
      <Text style={styles.sheetTitle}>{title}</Text>
      <Text style={styles.rescheduleSub}>{propertyLine}</Text>
      {sellerLine ? <Text style={styles.sellerAvailLine}>{sellerLine}</Text> : null}
      <InspectionCalendarApril2026 selectedDay={selectedDay} onSelectDay={onSelectDay} />
      <Text style={styles.slotsKicker}>{inspectionSlotsKicker(selectedDay)}</Text>
      {slots.map((s) => {
        const on = activeSlotId === s.id;
        return (
          <Pressable
            key={s.id}
            onPress={() => onSelectSlotId(s.id)}
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
      <Text style={styles.slotFootnote}>{footnote}</Text>
      <AppButton
        variant="outlined"
        onPress={onCancel}
        textStyle={{
          letterSpacing: 0.5,
          fontFamily: 'Satoshi-Medium',
        }}>
        CANCEL
      </AppButton>
      <View style={{ height: 12 }} />
      <AppButton
        variant="filled"
        onPress={onConfirm}
        textStyle={{
          letterSpacing: 0.5,
          fontFamily: 'Satoshi-Medium',
        }}>
        {confirmButtonLabel}
      </AppButton>
    </ScrollView>
  );
}

export type InspectionBookingConfirmDetail = {
  toastLine: string;
  aprilDay2026: number;
  slotId: InspectionSlotId;
  slotLabel: string;
};

export type InspectionScheduleModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  propertyLine: string;
  sellerAvailabilityTags?: InspectionAvailabilityTags | null;
  sellerAvailabilityNotes?: string;
  confirmButtonLabel?: string;
  /**
   * Called after user confirms a slot — includes toast line + slot ids for persistence.
   * Modal closes after invoke.
   */
  onConfirmed?: (detail: InspectionBookingConfirmDetail) => void;
};

/** Bottom sheet + calendar — same UX as Activities inspection reschedule. */
export function InspectionScheduleModal({
  visible,
  onClose,
  title,
  propertyLine,
  sellerAvailabilityTags = null,
  sellerAvailabilityNotes = '',
  confirmButtonLabel,
  onConfirmed,
}: InspectionScheduleModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState(26);
  const [selectedSlotId, setSelectedSlotId] = useState<InspectionSlotId>('b');

  const slots = useMemo(
    () => resolveScheduleSlots(sellerAvailabilityTags, sellerAvailabilityNotes),
    [sellerAvailabilityTags, sellerAvailabilityNotes],
  );

  const tags = sellerAvailabilityTags ?? DEFAULT_INSPECTION_AVAILABILITY_TAGS;

  useEffect(() => {
    if (!visible) return;
    setSelectedDay(26);
    setSelectedSlotId(defaultInspectionSlotId(slots, tags));
  }, [visible, slots, tags]);

  const slotLabel = slots.find((s) => s.id === selectedSlotId)?.label ?? '';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={chrome.modalRoot}>
        <Pressable
          style={chrome.modalScrimFlex}
          onPress={onClose}
          accessibilityLabel="Dismiss"
        />
        <View style={[chrome.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={chrome.grabber} />
          <InspectionScheduleScrollBody
            title={title}
            propertyLine={propertyLine}
            sellerAvailabilityTags={sellerAvailabilityTags}
            sellerAvailabilityNotes={sellerAvailabilityNotes}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            selectedSlotId={selectedSlotId}
            onSelectSlotId={setSelectedSlotId}
            onCancel={onClose}
            confirmButtonLabel={confirmButtonLabel}
            onConfirm={() => {
              const line = inspectionConfirmToastLine(selectedDay, slotLabel);
              onConfirmed?.({
                toastLine: line,
                aprilDay2026: selectedDay,
                slotId: selectedSlotId,
                slotLabel,
              });
              onClose();
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const chrome = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalScrimFlex: { flex: 1 },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 10,
    maxHeight: '92%',
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginBottom: 16,
  },
});

const styles = StyleSheet.create({
  sheetTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    marginBottom: 6,
  },
  rescheduleScroll: { paddingBottom: 28 },
  rescheduleSub: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.55)',
    marginBottom: 18,
  },
  sellerAvailLine: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(0, 0, 0, 0.55)',
    marginTop: -10,
    marginBottom: 16,
  },
  calCard: {
    backgroundColor: '#fff',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    padding: 14,
    marginBottom: 20,
  },
  calMonthTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
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
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.4)',
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
    borderRadius: 5,
  },
  calCellSelected: {
    backgroundColor: accent,
    borderRadius: 5,
  },
  calCellText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  calCellTextSelected: {
    color: ink,
  },
  slotsKicker: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.6,
    color: 'rgba(0, 0, 0, 0.45)',
    marginBottom: 10,
  },
  slotPill: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    marginBottom: 8,
  },
  slotPillOn: {
    backgroundColor: accent,
    borderColor: accent,
  },
  slotPillText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  slotPillTextOn: {
    color: ink,
  },
  slotFootnote: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(0, 0, 0, 0.45)',
    marginTop: 4,
    marginBottom: 20,
  },
});
