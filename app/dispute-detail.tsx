import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Text } from '@/components/OMMText';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, ink, layout, slateNavy } from '@/constants/theme';
import type { DisputeEvidenceFile, DisputeStatus } from '@/lib/disputes-mock';
import { getDisputeDetail } from '@/lib/disputes-mock';

/**
 * Single dispute — read-only detail. Solid-bordered cards.
 */

const BLOCK_GAP = 24;
const LABEL_FIELD_GAP = 8;
const MUTED = 'rgba(0, 0, 0, 0.55)';
const CARD_R = 10;
const THUMB = 60;
const INFO_PAD = 20;
const OUTLINE = 'rgba(0, 0, 0, 0.08)';

function CardShell({ children, contentStyle }: { children: ReactNode; contentStyle?: object }) {
  return <View style={[styles.card, contentStyle]}>{children}</View>;
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
    backgroundColor: slateNavy,
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
      <FontAwesome name="picture-o" size={20} color={MUTED} />
    </View>
  );
}

function DisputeInfoCard({
  propertyAddress,
  category,
  otherParty,
  amountLine,
}: {
  propertyAddress: string;
  category: string;
  otherParty: string;
  amountLine: string;
}) {
  const rows = [
    { label: 'PROPERTY ADDRESS', value: propertyAddress },
    { label: 'CATEGORY', value: category },
    { label: 'OTHER PARTY', value: otherParty },
    { label: 'AMOUNT IN DISPUTE', value: amountLine },
  ] as const;

  return (
    <CardShell contentStyle={styles.infoCardOuter}>
      <View style={styles.infoCardInner}>
        {rows.map((row, i) => (
          <View key={row.label}>
            <View style={styles.infoRowCell}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{row.value}</Text>
            </View>
            {i < rows.length - 1 ? <View style={styles.rowDivider} /> : null}
          </View>
        ))}
      </View>
    </CardShell>
  );
}

export default function DisputeDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const d = useMemo(() => getDisputeDetail(typeof id === 'string' ? id : id?.[0]), [id]);

  if (!d) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.navBar}>
          <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
            <FontAwesome name="chevron-left" size={20} color="#000000" />
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>Dispute</Text>
          </View>
          <View style={styles.navSide} />
        </View>
        <View style={{ paddingHorizontal: layout.screenGutter, paddingTop: 24 }}>
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
      <View style={styles.navBar}>
        <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Dispute {d.id}</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <CardShell contentStyle={styles.heroInner}>
          <View style={styles.heroTop}>
            <StatusBadge status={d.status} />
            <Text style={styles.heroId}>{d.id}</Text>
          </View>
          <Text style={styles.heroHeadline}>{d.statusHeadline}</Text>
          <Text style={styles.heroMeta}>{d.openedAssignedLine}</Text>
        </CardShell>

        <View style={{ height: BLOCK_GAP }} />

        <DisputeInfoCard propertyAddress={d.deal} category={d.category} otherParty={d.otherParty} amountLine={d.amountLine} />

        <View style={{ height: BLOCK_GAP }} />

        <Text style={styles.sectionLabel}>SUMMARY</Text>
        <View style={{ height: LABEL_FIELD_GAP }} />
        <CardShell contentStyle={styles.copyBox}>
          {d.summary ? <Text style={styles.copyText}>{d.summary}</Text> : null}
        </CardShell>

        <View style={{ height: BLOCK_GAP }} />

        <Text style={styles.sectionLabel}>DETAILS</Text>
        <View style={{ height: LABEL_FIELD_GAP }} />
        <CardShell contentStyle={styles.copyBoxLarge}>
          {d.detailsBody ? <Text style={styles.copyText}>{d.detailsBody}</Text> : null}
        </CardShell>

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
        <CardShell contentStyle={styles.activityInner}>
          {d.activity.map((a, i) => (
            <View key={`${a.sub}-${i}`} style={[styles.activityRow, i < d.activity.length - 1 && styles.activityRowGap]}>
              <View style={styles.bullet} />
              <View style={styles.activityTextCol}>
                <Text style={styles.activityTitle}>{a.title}</Text>
                <Text style={styles.activitySub}>{a.sub}</Text>
              </View>
            </View>
          ))}
        </CardShell>

        <View style={{ height: BLOCK_GAP }} />

        <Pressable
          style={styles.cta}
          onPress={() =>
            router.push({
              pathname: '/add-dispute-response',
              params: { id: d.id },
            } as Href)
          }
          accessibilityRole="button">
          {({ pressed }) => (
            <>
              <Text style={styles.ctaText}>ADD RESPONSE</Text>
              {pressed && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 }]} />}
            </>
          )}
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
  scroll: { paddingHorizontal: layout.screenGutter, paddingTop: 8 },
  card: {
    borderRadius: CARD_R,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE,
    backgroundColor: '#fafafa',
  },
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
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: OUTLINE,
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
    backgroundColor: slateNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImgShell: {
    width: THUMB,
    height: THUMB,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE,
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
    height: 52,
    borderRadius: 12,
    backgroundColor: accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ctaText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: ink,
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
