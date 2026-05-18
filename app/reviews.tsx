import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { type Href, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { Text } from '@/components/OMMText';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, ink, layout, slateNavy } from '@/constants/theme';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';
import {
  listDealsEligibleToWriteReview,
  type DealAcknowledgementRecord,
} from '@/lib/deal-acknowledgement';

/**
 * My reviews — summary, pending carousel, filters, list, CTA.
 * [Figma 1053:2426](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-2426&t=2eZigRM0BwNtC5wd-4)
 */

/** Vertical gap between major blocks — aligns with design rhythm */
const SECTION_GAP = 24;
/** Review list: gap between bordered cards (Figma gap-[16px]) */
const LIST_CARD_GAP = 16;
const STAR_FILLED = '#6b5344';
const STAR_EMPTY = 'rgba(0, 0, 0, 0.22)';
const MUTED = 'rgba(0, 0, 0, 0.55)';
const CARD_R = 8;
const SUMMARY_H = 108;
const PENDING_CARD_W = 180;
const PENDING_CARD_H = 135;
const PENDING_CHIP_R = 4;

type FilterKey = 'all' | 'buyer' | 'seller';

type PendingReviewCard = {
  id: string;
  propertyRef: string;
  name: string;
  agency: string;
  address: string;
  badge: string | null;
  active: boolean;
};

function mapEligibleDealToPendingCard(
  deal: DealAcknowledgementRecord,
  activePropertyRef: string | null,
): PendingReviewCard {
  return {
    id: deal.propertyRef,
    propertyRef: deal.propertyRef,
    name: deal.counterpartyName,
    agency: deal.counterpartyAgency,
    address: `${deal.suburb} · ${deal.propertyType}`,
    badge: activePropertyRef === deal.propertyRef ? 'WRITING' : null,
    active: activePropertyRef === deal.propertyRef,
  };
}

const REVIEW_ROWS = [
  {
    id: 'r1',
    headline: 'Sarah Chen · Biggin Scott',
    when: '2w ago',
    meta: 'OMM-20418 · 218 Victoria St',
    rating: 5 as const,
    body: 'Smooth SOI handover and commission sign-off in under 2h hours. Would deal with again.',
    filter: 'seller' as FilterKey,
  },
  {
    id: 'r2',
    headline: 'Mike Alvarez · Barry Plant',
    when: '1mo ago',
    meta: 'OMM-20381 · 12 Park Ave',
    rating: 4 as const,
    body: 'Responsive, clear authority dates. A small delay on bank details but resolved.',
    filter: 'buyer' as FilterKey,
  },
  {
    id: 'r3',
    headline: 'Priya N · Buxton',
    when: '2mo ago',
    meta: 'OMM-20350 · 8 Oak Close',
    rating: 5 as const,
    body: 'Great coordination on inspection. Media uploads were on time.',
    filter: 'buyer' as FilterKey,
  },
] as const;

/** Solid hairline card shell — matches review row reference (rounded rect, subtle grey stroke). */
function HairlineCard({
  borderRadius,
  children,
  style,
}: {
  borderRadius: number;
  children: ReactNode;
  style?: object;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius,
          borderWidth: FIELD_OUTLINE_WIDTH,
          borderColor: FIELD_OUTLINE_COLOR,
          borderStyle: 'solid',
        },
        style,
      ]}>
      {children}
    </View>
  );
}

function StarRow({
  rating,
  size = 12,
  gap = 4,
  filledColor = STAR_FILLED,
}: {
  rating: number;
  size?: number;
  gap?: number;
  filledColor?: string;
}) {
  return (
    <View style={[styles.starRow, { gap }]}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FontAwesome
          key={i}
          name={i <= rating ? 'star' : 'star-o'}
          size={size}
          color={i <= rating ? filledColor : STAR_EMPTY}
        />
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [eligibleDeals, setEligibleDeals] = useState<DealAcknowledgementRecord[]>([]);
  const [activePropertyRef, setActivePropertyRef] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      listDealsEligibleToWriteReview().then((deals) => {
        if (!alive) return;
        const nextActive = deals[0]?.propertyRef ?? null;
        setEligibleDeals(deals);
        setActivePropertyRef(nextActive);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const pending = eligibleDeals.map((deal) => mapEligibleDealToPendingCard(deal, activePropertyRef));
  const filtered = REVIEW_ROWS.filter((r) => filter === 'all' || r.filter === filter);
  const canWriteReview = pending.length > 0;

  const openWriteReview = useCallback(
    (propertyRef?: string) => {
      const ref = propertyRef ?? activePropertyRef;
      if (!ref) {
        Alert.alert(
          'Acknowledgement required',
          'Acknowledge the transaction in Messages before you can write a review.',
        );
        return;
      }
      router.push({
        pathname: '/write-review',
        params: { propertyRef: ref },
      } as Href);
    },
    [activePropertyRef, router],
  );

  const onPendingPress = useCallback(
    (item: PendingReviewCard) => {
      setActivePropertyRef(item.propertyRef);
      openWriteReview(item.propertyRef);
    },
    [openWriteReview],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable
          style={styles.navSide}
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Reviews</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <HairlineCard borderRadius={CARD_R} style={styles.summaryShell}>
          <View style={styles.summaryInner}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryScore}>4.8</Text>
              <StarRow rating={5} size={14} gap={4} />
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.summaryMetaFirst}>Based on 24 reviews</Text>
              <Text style={styles.summaryMetaSmall}>Last 12 months</Text>
              <Text style={styles.summaryMetaSmall}>Verified by closed deals</Text>
            </View>
          </View>
        </HairlineCard>

        <View style={{ height: SECTION_GAP }} />

        <View style={styles.pendingBlock}>
          <View style={styles.pendingHeader}>
            <Text style={styles.pendingKickerLeft}>Pending Reviews</Text>
            <Text style={styles.pendingCount}>
              {pending.length > 0 ? `${pending.length} pending` : 'None ready'}
            </Text>
          </View>
          {pending.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pendingCarousel}
              decelerationRate="fast"
              snapToInterval={PENDING_CARD_W + 12}
              snapToAlignment="start">
              {pending.map((p, index) => (
                <PendingCard
                  key={p.id}
                  item={p}
                  isLast={index === pending.length - 1}
                  onPress={() => onPendingPress(p)}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.pendingEmpty}>
              Acknowledge a closed transaction in Messages to unlock reviews.
            </Text>
          )}
        </View>

        <View style={{ height: SECTION_GAP }} />

        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setFilter('all')}
            style={[styles.filterSeg, filter === 'all' ? styles.filterSegActive : styles.filterSegIdle]}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === 'all' }}>
            {({ pressed }) => (
              <Text style={[styles.filterLabel, filter === 'all' ? styles.filterLabelOn : styles.filterLabelOff, pressed && { opacity: 0.7 }]}>All</Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => setFilter('buyer')}
            style={[styles.filterSeg, filter === 'buyer' ? styles.filterSegActive : styles.filterSegIdle]}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === 'buyer' }}>
            {({ pressed }) => (
              <Text style={[styles.filterLabel, filter === 'buyer' ? styles.filterLabelOn : styles.filterLabelOff, pressed && { opacity: 0.7 }]} numberOfLines={1}>
                AS BUYER AGENT
              </Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => setFilter('seller')}
            style={[styles.filterSeg, filter === 'seller' ? styles.filterSegActive : styles.filterSegIdle]}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === 'seller' }}>
            {({ pressed }) => (
              <Text style={[styles.filterLabel, filter === 'seller' ? styles.filterLabelOn : styles.filterLabelOff, pressed && { opacity: 0.7 }]} numberOfLines={1}>
                AS SELLER AGENT
              </Text>
            )}
          </Pressable>
        </View>

        <View style={{ height: SECTION_GAP }} />

        <View style={styles.reviewList}>
          {filtered.map((r) => (
            <HairlineCard key={r.id} borderRadius={CARD_R}>
              <View style={styles.reviewCardInner}>
                <View style={styles.reviewHeaderRow}>
                  <View style={styles.reviewHeaderLeft}>
                    <Text style={styles.reviewHeadline} numberOfLines={1}>
                      {r.headline}
                    </Text>
                    <Text style={styles.reviewMetaFigma}>{r.meta}</Text>
                  </View>
                  <Text style={styles.reviewWhen}>{r.when}</Text>
                </View>
                <StarRow rating={r.rating} size={12} gap={4} />
                <Text style={styles.reviewBody}>{r.body}</Text>
              </View>
            </HairlineCard>
          ))}
        </View>

        <Pressable
          style={[styles.cta, !canWriteReview && styles.ctaDisabled]}
          onPress={() => openWriteReview()}
          disabled={!canWriteReview}
          accessibilityRole="button"
          accessibilityLabel="Write a review"
          accessibilityState={{ disabled: !canWriteReview }}>
          {({ pressed }) => (
            <>
              <Text style={[styles.ctaText, pressed && { opacity: 0.85 }]}>WRITE A REVIEW</Text>
              {pressed && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 }]} />}
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

function PendingCard({
  item,
  isLast,
  onPress,
}: {
  item: PendingReviewCard;
  isLast: boolean;
  onPress?: () => void;
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
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={[styles.pendingCardActive, { width: PENDING_CARD_W, minHeight: PENDING_CARD_H }, tail]}>
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <HairlineCard borderRadius={CARD_R} style={[{ width: PENDING_CARD_W, minHeight: PENDING_CARD_H }, tail]}>
        <View style={styles.pendingCardInner}>{content}</View>
      </HairlineCard>
    </Pressable>
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
  scroll: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 8,
  },
  summaryShell: {
    alignSelf: 'stretch',
    minHeight: SUMMARY_H,
  },
  summaryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: SUMMARY_H,
    paddingLeft: 18,
    paddingRight: 18,
    paddingVertical: 14,
    gap: 16,
  },
  summaryLeft: {
    alignItems: 'flex-start',
    gap: 8,
  },
  summaryScore: {
    fontSize: 48,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 48,
    marginTop: 2,
  },
  starRow: { flexDirection: 'row', alignItems: 'center' },
  summaryRight: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    paddingTop: 2,
  },
  summaryMetaFirst: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 18,
  },
  summaryMetaSmall: {
    fontSize: 11,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 16.5,
  },
  pendingBlock: {
    gap: 12,
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
  pendingEmpty: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 18,
  },
  pendingCarousel: {
    flexDirection: 'row',
    paddingBottom: 4,
    paddingRight: layout.screenGutter,
  },
  pendingGutter: {
    marginRight: 12,
  },
  pendingCardInner: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 14,
    flex: 1,
    minHeight: PENDING_CARD_H,
  },
  pendingCardActive: {
    borderRadius: CARD_R,
    backgroundColor: slateNavy,
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
  pendingNameActive: {
    color: '#fff',
  },
  writingChip: {
    flexShrink: 0,
    backgroundColor: '#f2f2f2',
    borderRadius: PENDING_CHIP_R,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 22,
    justifyContent: 'center',
  },
  writingChipOnDark: {
    backgroundColor: '#fff',
  },
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
  pendingLineLight: {
    color: '#fff',
  },
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  filterSeg: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minHeight: 31,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSegActive: {
    backgroundColor: accent,
  },
  filterSegIdle: {
    backgroundColor: 'transparent',
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.2,
  },
  filterLabelOn: {
    color: ink,
  },
  filterLabelOff: {
    color: 'rgba(0,0,0,0.45)',
  },
  reviewList: {
    gap: LIST_CARD_GAP,
  },
  reviewCardInner: {
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 16,
    gap: 8,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  reviewHeaderLeft: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  reviewHeadline: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 19.5,
  },
  reviewMetaFigma: {
    fontSize: 11,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 16.5,
  },
  reviewWhen: {
    fontSize: 11,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 16.5,
    flexShrink: 0,
    marginTop: 2,
  },
  reviewBody: {
    fontSize: 13,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 19.5,
  },
  cta: {
    height: 52,
    borderRadius: 12,
    backgroundColor: accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SECTION_GAP,
  },
  ctaDisabled: {
    opacity: 0.45,
  },
  ctaText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: ink,
    letterSpacing: -0.35,
    textTransform: 'uppercase',
  },
});
