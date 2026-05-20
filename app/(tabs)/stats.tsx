import { AppButton } from "@/components/AppButton";
import { MessageThreadBubbles } from "@/components/MessageThreadBubbles";
import { Text } from "@/components/OMMText";
import { TextInput } from "@/components/OMMTextInput";
import { ScreenHeader } from "@/components/ScreenHeader";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Activities — buyer/seller feed, filters, detail sheets.
 * [Figma 1053:5705](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-5705)
 */

import { accent, borderHairline, fillWash, frost, ink, inkSubtle, palette, slateNavy } from '@/constants/theme';
import {
    activityMatchesFilter,
    buildActivitiesFeed,
    ensureThreadFromActivityRow,
    type ActivityFeedRow,
} from '@/lib/activities-feed';
import { useOmmMessages } from '@/lib/omm-messages-context';
import { useAgentPublishedListings } from '@/lib/agent-published-listings-context';
import { DEMO_PRIMARY_STREET } from "@/lib/melbourne-demo-locations";
import { AGENT_IMG, PROPERTY_IMG_1 } from "@/lib/propertyImages";
import { useSavedListings } from '@/lib/saved-listings-context';
import { useScreenHorizontalPadding } from "@/lib/useScreenHorizontalPadding";
import { useTabBarOnScroll } from "@/lib/tab-bar-visibility";
import {
  INSPECTION_TIME_SLOTS as TIME_SLOTS,
  InspectionScheduleScrollBody,
  inspectionConfirmToastLine,
  type InspectionSlotId,
} from "@/components/InspectionScheduleSheet";
import {
  DEFAULT_INSPECTION_AVAILABILITY_TAGS,
  defaultInspectionSlotId,
  inspectionSlotsForSeller,
  sellerSchedulePrefsFromListing,
} from "@/lib/listing-inspection-availability";

function firstQueryString(
  v: string | string[] | undefined,
): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

type FilterKey = "all" | "offers" | "inspections" | "messages";

function filterKeyFromQuery(q: string | undefined): FilterKey | null {
  if (q === "all" || q === "offers" || q === "inspections" || q === "messages")
    return q;
  return null;
}

type Role = "buyer" | "seller";

type SheetView =
  | "message-read"
  | "message-compose"
  | "inspection-summary"
  | "inspection-reschedule";

type ActiveSheet = {
  row: ActivityFeedRow;
  view: SheetView;
};

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
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipLabel, active && styles.chipLabelOn]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ActivityRowView({
  row,
  onPress,
}: {
  row: ActivityFeedRow;
  onPress: () => void;
}) {
  const thumb = row.thumbSource ?? (row.kind === "message" ? AGENT_IMG : PROPERTY_IMG_1);
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      <Image
        source={thumb}
        style={styles.avatar}
        resizeMode="cover"
      />
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

export default function ActivitiesScreen() {
  const insets = useSafeAreaInsets();
  const hPad = useScreenHorizontalPadding();
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string | string[] }>();
  const { listings } = useAgentPublishedListings();
  const { listings: savedListingCards } = useSavedListings();
  const { threads: messageThreads, sendMessageWithAutoReply, markRead, getById: getThreadById } =
    useOmmMessages();
  const [role, setRole] = useState<Role>("buyer");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sheet, setSheet] = useState<ActiveSheet | null>(null);
  const [draft, setDraft] = useState("");
  const [selectedDay, setSelectedDay] = useState(26);
  const [selectedSlotId, setSelectedSlotId] = useState<InspectionSlotId>("b");
  const [toast, setToast] = useState<string | null>(null);
  const { onScroll } = useTabBarOnScroll();

  const activities = useMemo(
    () =>
      buildActivitiesFeed({
        perspective: role,
        listings,
        savedListings: savedListingCards,
        messageThreads,
      }),
    [role, listings, savedListingCards, messageThreads],
  );

  const activeThread = useMemo(() => {
    if (!sheet?.row.threadId) return null;
    return getThreadById(sheet.row.threadId) ?? null;
  }, [sheet?.row.threadId, getThreadById]);

  useEffect(() => {
    const next = filterKeyFromQuery(firstQueryString(params.filter));
    if (next) setFilter(next);
  }, [params.filter]);

  const dismissSheet = useCallback(() => {
    setSheet(null);
    setDraft("");
    setSelectedDay(26);
    setSelectedSlotId("b");
  }, []);

  const openListingFromSheet = useCallback(
    (listingId: string) => {
      dismissSheet();
      router.push({
        pathname: "/view-live-listing",
        params: { listingId },
      } as Href);
    },
    [dismissSheet, router],
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const openRow = (row: ActivityFeedRow) => {
    setDraft("");
    setSheet({
      row,
      view: row.kind === "message" ? "message-read" : "inspection-summary",
    });
    if (row.kind === "message" && row.threadId) {
      void markRead(row.threadId);
    }
  };

  const sendComposeMessage = useCallback(async () => {
    const body = draft.trim();
    if (!body || !sheet) return;
    try {
      const threadId =
        sheet.row.threadId ?? (await ensureThreadFromActivityRow(sheet.row));
      await sendMessageWithAutoReply(threadId, body);
      setToast("Message sent");
      setDraft("");
      setSheet({ row: { ...sheet.row, threadId }, view: "message-read" });
    } catch {
      Alert.alert("Could not send", "Please try again in a moment.");
    }
  }, [draft, sheet, sendMessageWithAutoReply]);

  const filtered = activities.filter((row) => activityMatchesFilter(row, filter));

  const inspectionReschedulePrefs = useMemo(() => {
    const listingId = sheet?.row.listingId;
    if (!listingId) return null;
    const L = listings.find((l) => l.id === listingId);
    if (!L) return null;
    return sellerSchedulePrefsFromListing(L);
  }, [sheet?.row.listingId, listings]);

  const inspectionRescheduleSlots = useMemo(() => {
    if (!inspectionReschedulePrefs) return TIME_SLOTS;
    return inspectionSlotsForSeller(
      inspectionReschedulePrefs.tags,
      inspectionReschedulePrefs.notes,
    );
  }, [inspectionReschedulePrefs]);

  const inspectionReschedulePropertyLine = useMemo(() => {
    const id = sheet?.row.listingId;
    if (id) {
      const L = listings.find((l) => l.id === id);
      if (L) return `${L.streetLine}, ${L.suburbLine} • Buyer tour`;
    }
    return `${DEMO_PRIMARY_STREET} • Buyer tour`;
  }, [sheet?.row.listingId, listings]);

  useEffect(() => {
    if (sheet?.view !== "inspection-reschedule") return;
    setSelectedSlotId(
      defaultInspectionSlotId(
        inspectionRescheduleSlots,
        inspectionReschedulePrefs?.tags ?? DEFAULT_INSPECTION_AVAILABILITY_TAGS,
      ),
    );
  }, [sheet?.view, inspectionRescheduleSlots, inspectionReschedulePrefs]);

  const showCompose = sheet?.view === "message-compose";

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.headBlock, hPad]}>
        <ScreenHeader title="Activities" variant="large" />
      </View>

      <ScrollView
        style={styles.scroll}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View style={[styles.stickyHeader, hPad]}>
          <View style={[styles.segment, { marginTop: 0 }]}>
            <Pressable
              onPress={() => setRole("buyer")}
              style={[
                styles.segmentBtn,
                role === "buyer" && styles.segmentBtnOn,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: role === "buyer" }}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  role === "buyer" && styles.segmentLabelOn,
                ]}
              >
                BUYER
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setRole("seller")}
              style={[
                styles.segmentBtn,
                role === "seller" && styles.segmentBtnOn,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: role === "seller" }}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  role === "seller" && styles.segmentLabelOn,
                ]}
              >
                SELLER
              </Text>
            </Pressable>
          </View>

          <View style={styles.chipRowHost}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              bounces={false}
              style={styles.chipScroller}
              contentContainerStyle={styles.chipStrip}
            >
              <Chip
                label="All"
                active={filter === "all"}
                onPress={() => setFilter("all")}
              />
              <Chip
                label="Offers"
                active={filter === "offers"}
                onPress={() => setFilter("offers")}
              />
              <Chip
                label="Inspections"
                active={filter === "inspections"}
                onPress={() => setFilter("inspections")}
              />
              <Chip
                label="Messages"
                active={filter === "messages"}
                onPress={() => setFilter("messages")}
              />
            </ScrollView>
          </View>
        </View>

        <View style={[styles.listBlock, hPad]}>
          <Text style={styles.kicker}>
            {role === "seller"
              ? "LISTING PERFORMANCE SIGNALS"
              : "PIPELINE & THREADS"}
          </Text>

          {filtered.map((row, i) => (
            <View key={row.id}>
              <ActivityRowView row={row} onPress={() => openRow(row)} />
              {i < filtered.length - 1 ? <View style={styles.rule} /> : null}
            </View>
          ))}
        </View>
      </ScrollView>

      {toast ? (
        <>
          <View style={styles.toastScrim} pointerEvents="none" />
          <View
            style={[styles.toastWrap, { paddingTop: insets.top + 12 }]}
            pointerEvents="none"
          >
            <View style={styles.toastPill}>
              <Text style={styles.toastPillText}>{toast}</Text>
            </View>
            <Text style={styles.toastHint}>
              You can change alerts in Calendar settings.
            </Text>
          </View>
        </>
      ) : null}

      <Modal
        visible={sheet != null}
        animationType="slide"
        transparent
        onRequestClose={dismissSheet}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalRoot}
        >
          <Pressable
            style={styles.modalScrimFlex}
            onPress={dismissSheet}
            accessibilityLabel="Dismiss"
          />
          <View
            style={[
              styles.sheet,
              showCompose && styles.sheetCompose,
              { paddingBottom: showCompose ? 0 : insets.bottom + 20 },
            ]}
          >
            <View style={styles.grabber} />

            {sheet?.view === "message-read" ? (
              <>
                <Text style={styles.sheetTitle}>{sheet.row.sheetTitle}</Text>
                <Text style={styles.sheetMeta}>{sheet.row.sheetSubtitle}</Text>
                <MessageThreadBubbles
                  messages={
                    activeThread?.messages ??
                    (sheet.row.sheetBody
                      ? [
                          {
                            id: "legacy-inbound",
                            threadId: sheet.row.threadId ?? "legacy",
                            direction: "inbound" as const,
                            body: sheet.row.sheetBody,
                            sentAtIso: new Date().toISOString(),
                          },
                        ]
                      : [])
                  }
                />
                {sheet.row.listingId ? (
                  <>
                    <AppButton
                      variant="outlined"
                      onPress={() => openListingFromSheet(sheet.row.listingId!)}
                      accessibilityLabel="View listing"
                      textStyle={{
                        letterSpacing: 0.5,
                        fontFamily: "Satoshi-Medium",
                      }}
                    >
                      VIEW LISTING
                    </AppButton>
                    <View style={{ height: 12 }} />
                  </>
                ) : null}
                <AppButton
                  variant="filled"
                  onPress={() =>
                    setSheet({ row: sheet.row, view: "message-compose" })
                  }
                  accessibilityLabel="Reply"
                  textStyle={{
                    letterSpacing: 0.6,
                    fontFamily: "Satoshi-Medium",
                  }}
                >
                  REPLY
                </AppButton>
                {sheet.row.threadId || sheet.row.kind === "message" ? (
                  <>
                    <View style={{ height: 12 }} />
                    <AppButton
                      variant="outlined"
                      onPress={() => {
                        const threadId = sheet.row.threadId;
                        dismissSheet();
                        router.push({
                          pathname: "/contact-seller-chat",
                          params: {
                            ...(threadId ? { threadId } : {}),
                            ...(sheet.row.listingId
                              ? {
                                  listingId: sheet.row.listingId,
                                  propertyRef: sheet.row.listingId,
                                }
                              : {}),
                          },
                        } as Href);
                      }}
                      textStyle={{
                        letterSpacing: 0.5,
                        fontFamily: "Satoshi-Medium",
                      }}
                    >
                      OPEN FULL THREAD
                    </AppButton>
                  </>
                ) : null}
                <View style={{ height: 12 }} />
                <AppButton
                  variant="outlined"
                  onPress={dismissSheet}
                  textStyle={styles.sheetDoneBtn}
                >
                  DONE
                </AppButton>
              </>
            ) : null}

            {sheet?.view === "message-compose" ? (
              <View style={styles.composeRoot}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  style={styles.composeScrollView}
                  contentContainerStyle={styles.composeScroll}
                >
                  <Text style={styles.sheetTitle}>{sheet.row.sheetTitle}</Text>
                  <Text style={styles.sheetMeta}>{sheet.row.sheetSubtitle}</Text>
                  <MessageThreadBubbles messages={activeThread?.messages ?? []} />
                  <Text style={styles.inputLabel}>Your reply</Text>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    style={styles.composeInput}
                    multiline
                    textAlignVertical="top"
                    placeholder="Write your message…"
                    placeholderTextColor="rgba(0, 0, 0, 0.35)"
                  />
                </ScrollView>
                <View
                  style={[
                    styles.composeToolbar,
                    { marginBottom: Math.max(insets.bottom, 8) },
                  ]}>
                  <Pressable
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() =>
                      Alert.alert(
                        "Attachments",
                        "File uploads will be available in a future update.",
                      )
                    }>
                    <Text style={styles.composeAttach}>Attachments</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    hitSlop={8}
                    disabled={!draft.trim().length}
                    onPress={() => void sendComposeMessage()}
                    style={!draft.trim().length ? { opacity: 0.4 } : undefined}>
                    <Text style={styles.composeSend}>Send</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {sheet?.view === "inspection-summary" ? (
              <>
                <Text style={styles.sheetTitle}>{sheet.row.sheetTitle}</Text>
                <Text style={styles.sheetMeta}>{sheet.row.sheetSubtitle}</Text>
                <View style={styles.bubble}>
                  <Text style={styles.bubbleText}>{sheet.row.sheetBody}</Text>
                </View>
                {sheet.row.listingId ? (
                  <>
                    <AppButton
                      variant="outlined"
                      onPress={() => openListingFromSheet(sheet.row.listingId!)}
                      accessibilityLabel="View listing"
                      textStyle={{
                        letterSpacing: 0.5,
                        fontFamily: "Satoshi-Medium",
                      }}
                    >
                      VIEW LISTING
                    </AppButton>
                    <View style={{ height: 12 }} />
                  </>
                ) : null}
                <AppButton
                  variant="outlined"
                  onPress={() =>
                    setSheet({ row: sheet.row, view: "inspection-reschedule" })
                  }
                  textStyle={{
                    letterSpacing: 0.5,
                    fontFamily: "Satoshi-Medium",
                  }}
                >
                  ADD TO CALENDAR
                </AppButton>
                <View style={{ height: 12 }} />
                <AppButton
                  variant="filled"
                  onPress={() =>
                    setSheet({ row: sheet.row, view: "message-compose" })
                  }
                  textStyle={{
                    letterSpacing: 0.6,
                    fontFamily: "Satoshi-Medium",
                  }}
                >
                  REPLY
                </AppButton>
                <View style={{ height: 12 }} />
                <AppButton
                  variant="outlined"
                  onPress={dismissSheet}
                  textStyle={styles.sheetDoneBtn}
                >
                  DONE
                </AppButton>
              </>
            ) : null}

            {sheet?.view === "inspection-reschedule" ? (
              <InspectionScheduleScrollBody
                title="Reschedule inspection"
                propertyLine={inspectionReschedulePropertyLine}
                sellerAvailabilityTags={inspectionReschedulePrefs?.tags ?? null}
                sellerAvailabilityNotes={inspectionReschedulePrefs?.notes ?? ""}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                selectedSlotId={selectedSlotId}
                onSelectSlotId={setSelectedSlotId}
                onCancel={() =>
                  sheet &&
                  setSheet({ row: sheet.row, view: "inspection-summary" })
                }
                confirmButtonLabel="CONFIRM NEW TIME"
                onConfirm={() => {
                  const label =
                    inspectionRescheduleSlots.find((s) => s.id === selectedSlotId)
                      ?.label ?? "";
                  setToast(inspectionConfirmToastLine(selectedDay, label));
                  dismissSheet();
                }}
              />
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: frost },
  headBlock: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  stickyHeader: {
    backgroundColor: palette.white,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderHairline,
  },
  listBlock: {
    paddingTop: 16,
  },
  scroll: { flex: 1, minHeight: 0 },
  segment: {
    flexDirection: "row",
    height: 52,
    borderRadius: 7,
    backgroundColor: fillWash,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnOn: {
    backgroundColor: accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentLabel: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.55)",
  },
  segmentLabelOn: {
    fontFamily: "Satoshi-Medium",
    color: ink,
  },
  chipRowHost: {
    flexGrow: 0,
    flexShrink: 0,
    marginTop: 16,
    marginBottom: 8,
  },
  chipScroller: { flexGrow: 0, flexShrink: 0 },
  chipStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexGrow: 0,
    paddingRight: 4,
  },
  chip: {
    height: 31,
    paddingHorizontal: 14,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOn: { backgroundColor: accent },
  chipOff: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: borderHairline,
  },
  chipLabel: { fontSize: 13, fontFamily: "Satoshi-Medium", color: inkSubtle },
  chipLabelOn: { color: ink },
  kicker: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    letterSpacing: 0.8,
    color: "rgba(0, 0, 0, 0.45)",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e5e5e5",
  },
  rowText: { flex: 1, minWidth: 0 },
  rowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
  },
  rowTime: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.45)",
  },
  rowSub: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(0, 0, 0, 0.55)",
  },
  rule: {
    marginLeft: 64,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalScrimFlex: { flex: 1 },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 10,
    maxHeight: "92%",
  },
  sheetCompose: {
    backgroundColor: "#fefdfb",
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    marginBottom: 16,
  },
  sheetDoneBtn: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    letterSpacing: 0.5,
    color: "#000000",
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    marginBottom: 6,
  },
  sheetMeta: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.55)",
    marginBottom: 16,
  },
  bubble: {
    backgroundColor: fillWash,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#000000",
  },
  sheetTime: {
    fontSize: 13,
    color: "rgba(0, 0, 0, 0.45)",
    marginBottom: 22,
  },
  composeTimeSpacer: {
    height: 6,
    marginBottom: 16,
  },
  composeRoot: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 280,
  },
  composeScrollView: {
    flexGrow: 1,
    flexShrink: 1,
  },
  composeScroll: { paddingBottom: 12 },
  inputLabel: {
    fontSize: 13,
    color: "rgba(0, 0, 0, 0.5)",
    marginBottom: 10,
  },
  composeInput: {
    minHeight: 132,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.18)",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    lineHeight: 23,
    color: "#000000",
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  composeToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0, 0, 0, 0.12)",
  },
  composeAttach: {
    fontSize: 15,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
  },
  composeSend: {
    fontSize: 15,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
  },
  toastScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 40,
  },
  toastWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    zIndex: 50,
  },
  toastPill: {
    backgroundColor: slateNavy,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 9,
    maxWidth: "92%",
  },
  toastPillText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    textAlign: "center",
    lineHeight: 20,
  },
  toastHint: {
    marginTop: 10,
    fontSize: 13,
    color: "rgba(0, 0, 0, 0.55)",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
