import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEMO_AGENT_AGENCY, DEMO_PRIMARY_STREET } from '@/lib/melbourne-demo-locations';

/**
 * Write a review — pending carousel (same as Reviews) + dashed form + publish.
 * [Figma 1053:2603](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-2603&t=2eZigRM0BwNtC5wd-4)
 */

const H_PAD = 20;
const BLOCK_GAP = 24;
const LABEL_FIELD_GAP = 8;
const STROKE = 'rgba(0, 0, 0, 0.55)';
const STROKE_W = 1.5;
const DASH = '5 4';
const MUTED = 'rgba(0, 0, 0, 0.55)';
const CARD_R = 8;
const PENDING_CARD_W = 180;
const PENDING_CARD_H = 135;
const PENDING_CHIP_R = 4;
const FIELD_H = 54;
const OVERALL_ROW_H = 64;
const DETAILS_H = 109;
const STAR_OVERALL = 24;
const STAR_OVERALL_GAP = 8;
const STAR_CAT = 16;
const STAR_CAT_GAP = 6;
const LIGHT_STAR = 'rgba(0, 0, 0, 0.35)';

const PENDING = [
  {
    id: '1',
    name: 'Sarah Chen',
    agency: DEMO_AGENT_AGENCY,
    address: DEMO_PRIMARY_STREET,
    badge: 'WRITING' as string | null,
    active: true,
  },
  {
    id: '2',
    name: 'Tom Reid',
    agency: 'Marshall White',
    address: '19 Dickens St, Elwood VIC 3184',
    badge: null,
    active: false,
  },
  {
    id: '3',
    name: 'Priya N.',
    agency: 'Jellis Craig',
    address: '8 Davis St, Malvern',
    badge: null,
    active: false,
  },
] as const;

function DashedFrame({
  width,
  height,
  borderRadius,
}: {
  width: number;
  height: number;
  borderRadius: number;
}) {
  if (width <= 0 || height <= 0) return null;
  const inset = STROKE_W / 2;
  return (
    <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
      <Rect
        x={inset}
        y={inset}
        width={Math.max(0, width - STROKE_W)}
        height={Math.max(0, height - STROKE_W)}
        rx={borderRadius}
        ry={borderRadius}
        fill="none"
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeDasharray={DASH}
      />
    </Svg>
  );
}

function DashedSurface({
  borderRadius,
  children,
  style,
}: {
  borderRadius: number;
  children: ReactNode;
  style?: object;
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  return (
    <View
      style={[{ position: 'relative', backgroundColor: '#fff' }, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ w: Math.ceil(width), h: Math.ceil(height) });
      }}>
      <DashedFrame width={size.w} height={size.h} borderRadius={borderRadius} />
      {children}
    </View>
  );
}

function DashedFieldShell({
  height,
  borderRadius,
  children,
  innerStyle,
}: {
  height: number;
  borderRadius: number;
  children: ReactNode;
  innerStyle?: StyleProp<ViewStyle>;
}) {
  const [w, setW] = useState(0);
  return (
    <View
      style={[styles.dashShell, { minHeight: height }]}
      onLayout={(e) => setW(Math.ceil(e.nativeEvent.layout.width))}>
      <DashedFrame width={w} height={height} borderRadius={borderRadius} />
      <View style={[styles.dashInner, { minHeight: height, height }, innerStyle]}>{children}</View>
    </View>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function TapStars({
  value,
  onChange,
  size,
  gap,
}: {
  value: number;
  onChange: (n: number) => void;
  size: number;
  gap: number;
}) {
  return (
    <View style={[styles.starRow, { gap }]}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable key={i} onPress={() => onChange(i)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${i} stars`}>
          <FontAwesome name={i <= value ? 'star' : 'star-o'} size={size} color={i <= value ? '#6b5344' : LIGHT_STAR} />
        </Pressable>
      ))}
    </View>
  );
}

function CategoryRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={styles.categoryRow}>
      <Text style={styles.categoryLabel}>{label}</Text>
      <TapStars value={value} onChange={onChange} size={STAR_CAT} gap={STAR_CAT_GAP} />
    </View>
  );
}

function PendingCard({
  item,
  isLast,
}: {
  item: (typeof PENDING)[number];
  isLast: boolean;
}) {
  const content = (
    <>
      <View style={styles.pendingTop}>
        <Text style={[styles.pendingName, item.active && styles.pendingNameActive]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.badge ? (
          <View style={[styles.writingChip, item.active && styles.writingChipOnDark]}>
            <Text style={styles.writingChipText}>{item.badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.pendingAgency, item.active && styles.pendingLineLight]} numberOfLines={1}>
        {item.agency}
      </Text>
      <Text style={[styles.pendingAddr, item.active && styles.pendingLineLight]} numberOfLines={2}>
        {item.address}
      </Text>
      <View style={{ flex: 1, minHeight: 4 }} />
      {item.active ? (
        <View style={styles.pendingStatusDark}>
          <Text style={styles.pendingStatusDarkText}>PENDING</Text>
        </View>
      ) : (
        <View style={styles.pendingStatusLight}>
          <Text style={styles.pendingStatusLightText}>PENDING</Text>
        </View>
      )}
    </>
  );

  const tail = !isLast ? styles.pendingGutter : null;

  if (item.active) {
    return (
      <View style={[styles.pendingCardActive, { width: PENDING_CARD_W, minHeight: PENDING_CARD_H }, tail]}>
        {content}
      </View>
    );
  }

  return (
    <DashedSurface borderRadius={CARD_R} style={[{ width: PENDING_CARD_W, minHeight: PENDING_CARD_H }, tail]}>
      <View style={styles.pendingCardInner}>{content}</View>
    </DashedSurface>
  );
}

export default function WriteReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [agent, setAgent] = useState('');
  const [deal, setDeal] = useState('');
  const [overall, setOverall] = useState(0);
  const [comm, setComm] = useState(0);
  const [time, setTime] = useState(0);
  const [prof, setProf] = useState(0);
  const [details, setDetails] = useState('');

  const onPublish = () => {
    if (!agent.trim() || !deal.trim()) {
      Alert.alert('Missing info', 'Add the agent and deal for this review.');
      return;
    }
    if (overall < 1) {
      Alert.alert('Rating required', 'Tap the stars to set your overall rating.');
      return;
    }
    if (!details.trim()) {
      Alert.alert('Details required', 'Please add a few words in Details before publishing.');
      return;
    }
    Alert.alert('Review published', 'Thank you for your feedback.');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <View style={styles.navBar}>
          <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
            <FontAwesome name="chevron-left" size={20} color="#000000" />
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>Write a review</Text>
          </View>
          <View style={styles.navSide} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
          <Text style={styles.intro}>
            Reviews are visible to your OMM contacts and moderated by support. You can only review agents from closed deals.
          </Text>

          <View style={styles.pendingBlock}>
            <View style={styles.pendingHeader}>
              <Text style={styles.pendingKickerLeft}>Pending Reviews</Text>
              <Text style={styles.pendingCount}>3 pending</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pendingCarousel}
              decelerationRate="fast"
              snapToInterval={PENDING_CARD_W + 12}
              snapToAlignment="start">
              {PENDING.map((p, index) => (
                <PendingCard key={p.id} item={p} isLast={index === PENDING.length - 1} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.fieldBlock}>
            <FieldLabel>Agent</FieldLabel>
            <DashedFieldShell height={FIELD_H} borderRadius={4}>
              <TextInput
                value={agent}
                onChangeText={setAgent}
                style={styles.textInput}
                placeholder="Agent · agency"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                autoCorrect={false}
              />
            </DashedFieldShell>
          </View>

          <View style={styles.fieldBlock}>
            <FieldLabel>Deal</FieldLabel>
            <DashedFieldShell height={FIELD_H} borderRadius={4}>
              <TextInput
                value={deal}
                onChangeText={setDeal}
                style={styles.textInput}
                placeholder="Deal reference · address"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                autoCorrect={false}
              />
            </DashedFieldShell>
          </View>

          <View style={styles.fieldBlock}>
            <FieldLabel>Overall Rating</FieldLabel>
            <DashedFieldShell height={OVERALL_ROW_H} borderRadius={4}>
              <View style={styles.overallInner}>
                <TapStars value={overall} onChange={setOverall} size={STAR_OVERALL} gap={STAR_OVERALL_GAP} />
                <Text style={styles.tapToRate}>Tap to rate</Text>
              </View>
            </DashedFieldShell>
          </View>

          <View style={styles.fieldBlock}>
            <FieldLabel>Categories</FieldLabel>
            <View style={styles.categoriesList}>
              <CategoryRow label="Communication" value={comm} onChange={setComm} />
              <CategoryRow label="Timeliness" value={time} onChange={setTime} />
              <CategoryRow label="Professionalism" value={prof} onChange={setProf} />
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <FieldLabel>Details</FieldLabel>
            <DashedFieldShell height={DETAILS_H} borderRadius={4} innerStyle={styles.detailsShellInner}>
              <TextInput
                value={details}
                onChangeText={setDetails}
                style={styles.detailsInput}
                placeholder="What went well, and what could improve? Reference specific steps (e.g. SOI, authority, inspection)."
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                multiline
                textAlignVertical="top"
              />
            </DashedFieldShell>
          </View>

          <View style={styles.fieldBlock}>
            <FieldLabel>Attachments (optional)</FieldLabel>
            <AttachRow />
          </View>

          <Pressable style={({ pressed }) => [styles.publishBtn, pressed && { opacity: 0.92 }]} onPress={onPublish} accessibilityRole="button" accessibilityLabel="Publish review">
            <Text style={styles.publishText}>PUBLISH REVIEW</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function AttachRow() {
  const [w, setW] = useState(0);
  const H = 74;
  return (
    <View style={[styles.dashShell, { minHeight: H }]} onLayout={(e) => setW(Math.ceil(e.nativeEvent.layout.width))}>
      {w > 0 ? <DashedFrame width={w} height={H} borderRadius={8} /> : null}
      <Pressable
        onPress={() => Alert.alert('Attachments', 'File picker would open here.')}
        style={[styles.attachInner, { minHeight: H }]}
        accessibilityRole="button"
        accessibilityLabel="Attach screenshot or file">
        <MaterialCommunityIcons name="paperclip" size={20} color="rgba(0, 0, 0, 0.65)" />
        <View style={styles.attachCopy}>
          <Text style={styles.attachTitle}>Attach screenshot or file</Text>
          <Text style={styles.attachSub}>PNG, JPG, PDF · up to 5 files · 25MB max</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  navSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 27,
  },
  scroll: {
    paddingHorizontal: H_PAD,
    paddingTop: 8,
  },
  intro: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  pendingBlock: {
    gap: 12,
    marginBottom: BLOCK_GAP,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingKickerLeft: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  pendingCount: {
    fontSize: 11,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 16.5,
  },
  pendingCarousel: {
    flexDirection: 'row',
    paddingBottom: 4,
    paddingRight: H_PAD,
  },
  pendingGutter: { marginRight: 12 },
  pendingCardInner: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 14,
    flex: 1,
    minHeight: PENDING_CARD_H,
  },
  pendingCardActive: {
    borderRadius: CARD_R,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  pendingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  pendingName: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 19.5,
    minWidth: 0,
  },
  pendingNameActive: { color: '#fff' },
  writingChip: {
    flexShrink: 0,
    backgroundColor: '#f2f2f2',
    borderRadius: PENDING_CHIP_R,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 22,
    justifyContent: 'center',
  },
  writingChipOnDark: { backgroundColor: '#fff' },
  writingChipText: {
    fontSize: 9,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: 0.225,
    textTransform: 'uppercase',
    lineHeight: 13.5,
  },
  pendingAgency: {
    fontSize: 11,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 16.5,
    marginBottom: 4,
  },
  pendingAddr: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 15,
  },
  pendingLineLight: { color: '#fff' },
  pendingStatusDark: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: PENDING_CHIP_R,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 22,
    justifyContent: 'center',
  },
  pendingStatusDarkText: {
    fontSize: 9,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.225,
    textTransform: 'uppercase',
    lineHeight: 13.5,
  },
  pendingStatusLight: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: PENDING_CHIP_R,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 22,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  pendingStatusLightText: {
    fontSize: 9,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: 0.225,
    textTransform: 'uppercase',
    lineHeight: 13.5,
  },
  fieldBlock: {
    marginBottom: BLOCK_GAP,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
    marginBottom: LABEL_FIELD_GAP,
  },
  dashShell: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#fff',
  },
  dashInner: {
    justifyContent: 'center',
    paddingHorizontal: 10,
    width: '100%',
  },
  detailsShellInner: {
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingBottom: 8,
  },
  textInput: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    lineHeight: 21,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    margin: 0,
  },
  overallInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 4,
  },
  starRow: { flexDirection: 'row', alignItems: 'center' },
  tapToRate: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 18,
  },
  categoriesList: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 19.5,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 19.5,
    flex: 1,
    marginRight: 12,
  },
  detailsInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    lineHeight: 21,
    paddingTop: 8,
    paddingBottom: 8,
    margin: 0,
    minHeight: DETAILS_H - 16,
  },
  attachInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 18,
    width: '100%',
  },
  attachCopy: { flex: 1, minWidth: 0, gap: 2 },
  attachTitle: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 19.5,
  },
  attachSub: {
    fontSize: 11,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 16.5,
  },
  publishBtn: {
    height: 48,
    borderRadius: 4,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: -0.35,
    textTransform: 'uppercase',
  },
});
