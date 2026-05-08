import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Text } from '@/components/OMMText';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { useScreenHorizontalPadding } from '@/lib/useScreenHorizontalPadding';

import type { DisputeEvidenceFile, DisputeStatus } from '@/lib/disputes-mock';
import { getDisputeDetail } from '@/lib/disputes-mock';

/**
 * Single dispute — read-only detail.
 * [Figma 1053:2893](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-2893&t=2eZigRM0BwNtC5wd-4)
 */

const H_PAD = 20;
const BLOCK_GAP = 24;
const LABEL_FIELD_GAP = 8;
const STROKE = 'rgba(0, 0, 0, 0.55)';
const STROKE_W = 1.5;
const DASH = '5 4';
const MUTED = 'rgba(0, 0, 0, 0.55)';
const CARD_R = 8;
const THUMB = 60;
const INFO_PAD = 20;

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

function DashedHorizontalRule({ width }: { width: number }) {
  if (width <= 0) return null;
  const y = STROKE_W;
  return (
    <Svg width={width} height={STROKE_W * 2 + 1} style={styles.dashSepSvg}>
      <Line
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeDasharray={DASH}
      />
    </Svg>
  );
}

function DashedShell({ borderRadius, children, contentStyle }: { borderRadius: number; children: ReactNode; contentStyle?: object }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  return (
    <View
      style={styles.dashWrap}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ w: Math.ceil(width), h: Math.ceil(height) });
      }}>
      <DashedFrame width={size.w} height={size.h} borderRadius={borderRadius} />
      <View style={[styles.dashInnerPad, contentStyle]}>{children}</View>
    </View>
  );
}

function StatusBadge({ status }: { status: DisputeStatus }) {
  if (status === 'under_review') {
    return (
      <View style={badge.underReview}>
        <Text style={badge.textLight}>UNDER REVIEW</Text>
      </View>
    );
  }
  if (status === 'open') {
    return (
      <View style={badge.open}>
        <Text style={badge.textLight}>OPEN</Text>
      </View>
    );
  }
  return (
    <View style={badge.resolved}>
      <Text style={badge.textResolved}>RESOLVED</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  underReview: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  open: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#000000',
  },
  resolved: {
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  textLight: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.225,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  textResolved: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: MUTED,
    letterSpacing: 0.225,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
});

function EvidenceThumb({ file }: { file: DisputeEvidenceFile }) {
  if (file.kind === 'pdf') {
    return (
      <View style={styles.thumbPdf}>
        <FontAwesome name="file-text" size={22} color="#fff" />
      </View>
    );
  }
  return (
    <View style={styles.thumbImgShell}>
      <Svg pointerEvents="none" width={THUMB} height={THUMB} style={StyleSheet.absoluteFill}>
        <Rect
          x={STROKE_W / 2}
          y={STROKE_W / 2}
          width={THUMB - STROKE_W}
          height={THUMB - STROKE_W}
          rx={4}
          ry={4}
          fill="none"
          stroke={STROKE}
          strokeWidth={STROKE_W}
          strokeDasharray={DASH}
        />
      </Svg>
      <FontAwesome name="picture-o" size={20} color={MUTED} />
    </View>
  );
}

function DisputeInfoCard({
  deal,
  category,
  otherParty,
  amountLine,
}: {
  deal: string;
  category: string;
  otherParty: string;
  amountLine: string;
}) {
  const [innerW, setInnerW] = useState(0);
  const rows = [
    { label: 'DEAL', value: deal },
    { label: 'CATEGORY', value: category },
    { label: 'OTHER PARTY', value: otherParty },
    { label: 'AMOUNT IN DISPUTE', value: amountLine },
  ] as const;

  return (
    <DashedShell borderRadius={CARD_R} contentStyle={styles.infoCardOuter}>
      <View
        style={styles.infoCardInner}
        onLayout={(e) => setInnerW(Math.ceil(e.nativeEvent.layout.width))}>
        {rows.map((row, i) => (
          <View key={row.label}>
            <View style={styles.infoRowCell}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{row.value}</Text>
            </View>
            {i < rows.length - 1 ? <DashedHorizontalRule width={innerW} /> : null}
          </View>
        ))}
      </View>
    </DashedShell>
  );
}

export default function DisputeDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hPad = useScreenHorizontalPadding();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const d = useMemo(() => getDisputeDetail(typeof id === 'string' ? id : id?.[0]), [id]);

  if (!d) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={[styles.headBlock, hPad]}>
        <ScreenHeader title="Dispute" onBack={() => router.back()} />
      </View>
        <View style={{ paddingHorizontal: H_PAD, paddingTop: 24 }}>
          <Text style={styles.value}>This dispute could not be found.</Text>
        </View>
      </View>
    );
  }

  const onWithdraw = () => {
    Alert.alert(
      'Withdraw dispute?',
      'You can raise a new dispute later if needed. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Withdraw', style: 'destructive', onPress: () => router.back() },
      ],
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.headBlock, hPad]}>
        <ScreenHeader title={`Dispute ${d.id}`} onBack={() => router.back()} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <DashedShell borderRadius={CARD_R} contentStyle={styles.heroInner}>
          <View style={styles.heroTop}>
            <StatusBadge status={d.status} />
            <Text style={styles.heroId}>{d.id}</Text>
          </View>
          <Text style={styles.heroHeadline}>{d.statusHeadline}</Text>
          <Text style={styles.heroMeta}>{d.openedAssignedLine}</Text>
        </DashedShell>

        <View style={{ height: BLOCK_GAP }} />

        <DisputeInfoCard deal={d.deal} category={d.category} otherParty={d.otherParty} amountLine={d.amountLine} />

        <View style={{ height: BLOCK_GAP }} />

        <Text style={styles.sectionLabel}>SUMMARY</Text>
        <View style={{ height: LABEL_FIELD_GAP }} />
        <DashedShell borderRadius={CARD_R} contentStyle={styles.copyBox}>
          {d.summary ? <Text style={styles.copyText}>{d.summary}</Text> : null}
        </DashedShell>

        <View style={{ height: BLOCK_GAP }} />

        <Text style={styles.sectionLabel}>DETAILS</Text>
        <View style={{ height: LABEL_FIELD_GAP }} />
        <DashedShell borderRadius={CARD_R} contentStyle={styles.copyBoxLarge}>
          {d.detailsBody ? <Text style={styles.copyText}>{d.detailsBody}</Text> : null}
        </DashedShell>

        <View style={{ height: BLOCK_GAP }} />

        <Text style={styles.sectionLabel}>
          EVIDENCE - {d.evidence.length} FILES
        </Text>
        <View style={{ height: LABEL_FIELD_GAP }} />
        <View style={styles.evidenceRow}>
          {d.evidence.map((f) => (
            <View key={f.name} style={styles.evidenceItem}>
              <EvidenceThumb file={f} />
              <Text style={styles.evidenceName} numberOfLines={1}>
                {f.name}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: BLOCK_GAP }} />

        <Text style={styles.sectionLabel}>ACTIVITY</Text>
        <View style={{ height: LABEL_FIELD_GAP }} />
        <DashedShell borderRadius={CARD_R} contentStyle={styles.activityInner}>
          {d.activity.map((a, i) => (
            <View key={`${a.sub}-${i}`} style={[styles.activityRow, i < d.activity.length - 1 && styles.activityRowGap]}>
              <View style={styles.bullet} />
              <View style={styles.activityTextCol}>
                <Text style={styles.activityTitle}>{a.title}</Text>
                <Text style={styles.activitySub}>{a.sub}</Text>
              </View>
            </View>
          ))}
        </DashedShell>

        <View style={{ height: BLOCK_GAP }} />

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}
          onPress={() =>
            router.push({
              pathname: '/add-dispute-response',
              params: { id: d.id },
            } as Href)
          }
          accessibilityRole="button">
          <Text style={styles.ctaText}>ADD RESPONSE</Text>
        </Pressable>

        <Pressable style={styles.withdrawWrap} onPress={onWithdraw} hitSlop={12} accessibilityRole="button">
          <Text style={styles.withdrawText}>WITHDRAW DISPUTE</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  headBlock: { paddingTop: 8, paddingBottom: 4 },
  navSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 27,
  },
  scroll: { paddingHorizontal: H_PAD, paddingTop: 8 },
  dashWrap: { position: 'relative', backgroundColor: '#fff' },
  dashInnerPad: { backgroundColor: 'transparent' },
  heroInner: {
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 16,
    gap: 10,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  heroId: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
  },
  heroHeadline: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 21,
  },
  heroMeta: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 18,
  },
  infoCardOuter: {
    paddingHorizontal: INFO_PAD,
    paddingVertical: INFO_PAD,
  },
  infoCardInner: {
    width: '100%',
  },
  infoRowCell: {
    paddingVertical: 12,
  },
  dashSepSvg: {
    marginVertical: 0,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  label: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 21,
  },
  copyBox: {
    paddingHorizontal: INFO_PAD,
    paddingVertical: 16,
    minHeight: 52,
    justifyContent: 'flex-start',
  },
  copyBoxLarge: {
    paddingHorizontal: INFO_PAD,
    paddingVertical: 16,
    minHeight: 100,
    justifyContent: 'flex-start',
  },
  copyText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 21,
  },
  evidenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  evidenceItem: {
    width: THUMB,
    alignItems: 'center',
    gap: 6,
  },
  thumbPdf: {
    width: THUMB,
    height: THUMB,
    borderRadius: 4,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImgShell: {
    width: THUMB,
    height: THUMB,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#fff',
  },
  evidenceName: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 16,
    textAlign: 'center',
    maxWidth: THUMB + 8,
  },
  activityInner: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityRowGap: {
    marginBottom: 14,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    marginTop: 6,
    marginRight: 10,
  },
  activityTextCol: { flex: 1 },
  activityTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 21,
  },
  activitySub: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 18,
    marginTop: 2,
  },
  cta: {
    height: 48,
    borderRadius: 4,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: -0.35,
    textTransform: 'uppercase',
  },
  withdrawWrap: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  withdrawText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: MUTED,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
