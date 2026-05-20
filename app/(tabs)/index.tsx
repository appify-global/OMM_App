import { Text } from "@/components/OMMText";
import { TextInput } from "@/components/OMMTextInput";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useGlobalSearchParams, useRouter, type Href } from "expo-router";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/AppButton";
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from "@/lib/field-outline";
import {
  DEMO_PRIMARY_LISTING_TITLE,
  DEMO_SEARCH_SUBURB,
} from "@/lib/melbourne-demo-locations";
import {
  PROPERTY_IMG_1,
  PROPERTY_IMG_2,
  propertyImageAtIndex,
} from "@/lib/propertyImages";
import {
  FALLBACK_AGENT_HOME_METRICS,
  LEGAL_COPY_PIPELINE_COMMISSION_DISCLAIMER,
  LEGAL_COPY_PIPELINE_COMMISSION_LABEL,
  PIPELINE_KPI_LEGALLY_APPROVED,
  type AgentHomeMetricsPayload,
  fetchAgentHomeMetrics,
  formatPipelineCommissionRangeDisplay,
} from "@/lib/agent-home-metrics";
import { getAgentQuickLinksForHome } from "@/lib/agent-quick-links";
import { VIEW_LIVE_LISTING_ID } from "@/lib/saved-listings";
import { useSavedListings } from "@/lib/saved-listings-context";

import { fieldShell } from "./add/_shared";
import { accent, frost, ink, slateNavy } from '@/constants/theme';

function SectionHeader({
  title,
  onSeeAll,
  style,
}: {
  title: string;
  onSeeAll?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      ) : (
        <Text style={styles.seeAll}>See all</Text>
      )}
    </View>
  );
}

/** Ignite-style single notifications entry row */
function NotificationsRow({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={styles.notificationsCard}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      onPress={onPress}
    >
      <View style={styles.notificationsIconBubble}>
        <FontAwesome name="bell-o" size={18} color="#111111" />
      </View>
      <Text style={styles.notificationsLabel}>Notifications</Text>
      <FontAwesome name="chevron-right" size={13} color="rgba(17,17,17,0.35)" />
    </Pressable>
  );
}

function HeroCTA({
  kicker,
  title,
  subtitle,
  onPress,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.hero} accessibilityRole="button" onPress={onPress}>
      <View style={styles.heroTextCol}>
        <Text style={styles.heroKicker}>{kicker}</Text>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSub}>{subtitle}</Text>
      </View>
      <View style={styles.heroFab}>
        <FontAwesome name="plus" size={22} color="#000000" />
      </View>
    </Pressable>
  );
}

function EnquiryCard({
  name,
  time,
  address,
  tag,
}: {
  name: string;
  time: string;
  address: string;
  tag: string;
}) {
  return (
    <View style={styles.enquiryCard}>
      <View style={styles.enqTopRow}>
        <Text style={styles.enqName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.enqTime}>{time}</Text>
      </View>
      <Text style={styles.enqAddr}>{address}</Text>
      <View style={styles.enqPill}>
        <Text style={styles.enqPillText}>{tag}</Text>
      </View>
    </View>
  );
}

/** Ignite-inspired buyer enquiries promo + outlined CTA */
function BuyerEnquiriesCallout({ onViewAll }: { onViewAll: () => void }) {
  return (
    <View style={styles.buyerEnqCard}>
      <View style={styles.buyerEnqIconWrap}>
        <FontAwesome name="fire" size={18} color="#e85d04" />
      </View>
      <Text style={styles.buyerEnqHeadline}>
        You’re up to date with all of your buyer enquiries!
      </Text>
      <Text style={styles.buyerEnqSub}>
        Stay on top of every enquiry — see them in one place anytime.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View all buyer enquiries"
        onPress={onViewAll}
        style={({ pressed }) => [
          styles.buyerEnqGhostBtn,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={styles.buyerEnqGhostBtnText}>View all enquiries</Text>
      </Pressable>
    </View>
  );
}

/** Compact Ignite / REA thumbnail row */
function ListingThumbRow({
  imageSource,
  titleLine,
  subtitleLine,
  onPress,
}: {
  imageSource: ImageSourcePropType;
  titleLine: string;
  subtitleLine: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={styles.thumbRow}
      accessibilityRole="button"
      accessibilityLabel={`Listing ${titleLine}`}
      onPress={onPress}
    >
      <Image
        source={imageSource}
        style={styles.thumbRowImg}
        resizeMode="cover"
      />
      <View style={styles.thumbRowBody}>
        <Text style={styles.thumbRowTitle} numberOfLines={1}>
          {titleLine}
        </Text>
        <Text style={styles.thumbRowSub} numberOfLines={1}>
          {subtitleLine}
        </Text>
      </View>
    </Pressable>
  );
}

/** Horizontal promo — mirrors Latest enquiries; [see all → Figma 1053:1981](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-1981) */
function AuthorityExpiringCarouselCard({
  address,
  daysLeft,
  subtitleLine,
  soiPill,
}: {
  address: string;
  daysLeft: string;
  subtitleLine: string;
  soiPill: string;
}) {
  return (
    <View style={styles.authCarouselCard}>
      <View style={styles.authCarouselTop}>
        <Text style={styles.authCarouselAddr} numberOfLines={2}>
          {address}
        </Text>
        <View style={styles.authCarouselDays}>
          <Text style={styles.authCarouselDaysText}>{daysLeft}</Text>
        </View>
      </View>
      <Text style={styles.authCarouselSub} numberOfLines={1}>
        {subtitleLine}
      </Text>
      <View style={styles.authCarouselPill}>
        <Text style={styles.authCarouselPillText}>{soiPill}</Text>
      </View>
    </View>
  );
}

/** Selling: stats footer. Buying: [Figma 1053:1680](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-1680) — 168px image, pills, spec chips row. */
function LargeListingCard(
  props:
    | {
        variant?: "selling";
        imageSource?: ImageSourcePropType;
        title: string;
        price: string;
        specLine: string;
        badgeLeft: string;
        badgeRight: string;
        footerLabels: [string, string, string];
      }
    | {
        variant: "buying";
        imageSource?: ImageSourcePropType;
        title: string;
        price: string;
        badgeLeft: string;
        badgeRight: string;
        specParts: [string, string, string];
      },
) {
  const isBuying = props.variant === "buying";
  const heroSource =
    props.imageSource ?? (isBuying ? PROPERTY_IMG_2 : PROPERTY_IMG_1);
  return (
    <View
      style={[styles.largeCardOuter, isBuying && styles.largeCardOuterBuying]}
    >
      <View style={[styles.largeCard, isBuying && styles.largeCardBuying]}>
        <View
          style={[styles.largeImgWrap, isBuying && styles.largeImgWrapBuying]}
        >
          <Image
            source={heroSource}
            style={styles.largeImg}
            resizeMode="cover"
          />
          <View style={[styles.badgeLeft, isBuying && styles.badgeLeftBuying]}>
            <Text style={styles.badgeLeftText}>{props.badgeLeft}</Text>
          </View>
          <View
            style={[styles.badgeRight, isBuying && styles.badgeRightBuying]}
          >
            <Text
              style={[
                styles.badgeRightText,
                isBuying && styles.badgeRightTextBuying,
              ]}
            >
              {props.badgeRight}
            </Text>
          </View>
        </View>
        <View style={styles.largeBody}>
          <Text style={[styles.propTitle, isBuying && styles.propTitleBuying]}>
            {props.title}
          </Text>
          <Text style={[styles.propPrice, isBuying && styles.propPriceBuying]}>
            {props.price}
          </Text>
          {isBuying ? (
            <View style={styles.specRowBuying}>
              {props.specParts.map((s, i) => (
                <Fragment key={s}>
                  {i > 0 ? <Text style={styles.specSepBuying}> · </Text> : null}
                  <Text style={styles.specChipBuying}>{s}</Text>
                </Fragment>
              ))}
            </View>
          ) : (
            <>
              <Text style={styles.propSpecs}>{props.specLine}</Text>
              <View style={styles.propStatsRow}>
                {props.footerLabels.map((l, i) => (
                  <Text
                    key={l}
                    style={[
                      styles.propStat,
                      i === 0
                        ? styles.propStatFooterStart
                        : i === 1
                          ? styles.propStatFooterMid
                          : styles.propStatFooterEnd,
                    ]}
                  >
                    {l}
                  </Text>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

function SavedSearchCard({
  name,
  criteria,
  badge,
  alertsOn,
  meta,
}: {
  name: string;
  criteria: string;
  badge?: string;
  alertsOn: boolean;
  meta: string;
}) {
  return (
    <View style={styles.savedCard}>
      <View style={styles.savedTop}>
        <Text style={styles.savedName}>{name}</Text>
        {badge ? (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.savedCriteria}>{criteria}</Text>
      <View style={styles.savedRow}>
        <Text style={[styles.savedDot, !alertsOn && styles.savedDotOff]}>
          ● {alertsOn ? "ALERTS ON" : "ALERTS OFF"}
        </Text>
        <Text style={styles.savedMeta}>{meta}</Text>
      </View>
    </View>
  );
}

function AgentReplyCard({
  name,
  agency,
  snippet,
}: {
  name: string;
  agency: string;
  snippet: string;
}) {
  return (
    <View style={styles.replyCard}>
      <Text style={styles.replyName}>{name}</Text>
      <Text style={styles.replyAgency}>{agency}</Text>
      <Text style={styles.replySnippet} numberOfLines={2}>
        “{snippet}”
      </Text>
    </View>
  );
}

function SearchMatchRow({
  name,
  address,
  price,
  specs,
  match,
  imageSource,
}: {
  name: string;
  address: string;
  price: string;
  specs: string;
  match: string;
  imageSource: ImageSourcePropType;
}) {
  return (
    <View style={styles.matchRow}>
      <View style={styles.matchThumbWrap}>
        <Image
          source={imageSource}
          style={styles.matchThumb}
          resizeMode="cover"
        />
        <View style={styles.matchTagOff}>
          <Text style={styles.matchTagText}>OFF-MARKET</Text>
        </View>
        <View style={styles.matchPct}>
          <Text style={styles.matchPctText}>{match}</Text>
        </View>
      </View>
      <View style={styles.matchBody}>
        <Text style={styles.matchName}>{name}</Text>
        <Text style={styles.matchAddr}>{address}</Text>
        <Text style={styles.matchPrice}>{price}</Text>
        <Text style={styles.matchSpecs}>{specs}</Text>
      </View>
    </View>
  );
}

function SellingQuickLinksRow({ router }: { router: ReturnType<typeof useRouter> }) {
  const items = getAgentQuickLinksForHome();
  if (items.length === 0) return null;
  return (
    <View style={styles.quickLinksBlock}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickLinksScrollInner}
      >
        {items.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Quick link ${item.label}`}
            accessibilityHint={
              item.stub ? "Opens a preview or placeholder screen." : undefined
            }
            onPress={() => router.push(item.href as Href)}
            style={({ pressed }) => [
              styles.quickLinkChip,
              pressed && styles.quickLinkChipPressed,
            ]}
          >
            <View style={styles.quickLinkChipIconWrap}>
              <FontAwesome name={item.iconGlyph} size={18} color="#111111" />
            </View>
            <Text style={styles.quickLinkChipLabel}>{item.label}</Text>
            {item.stub ? (
              <View style={styles.quickLinkStubPill}>
                <Text style={styles.quickLinkStubPillText}>stub</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function SellingPerformanceSlice({
  metrics,
  onOpenSoldSeeAll,
}: {
  metrics: AgentHomeMetricsPayload;
  onOpenSoldSeeAll: () => void;
}) {
  const pipelineRange = metrics.pipelineCommissionEstimateAud;
  const pipelineRangeSafe =
    PIPELINE_KPI_LEGALLY_APPROVED &&
    pipelineRange != null &&
    pipelineRange.highAud >= pipelineRange.lowAud
      ? pipelineRange
      : null;

  return (
    <>
      <SectionHeader
        title="Recently sold"
        onSeeAll={onOpenSoldSeeAll}
        style={styles.sectionHeaderSoldStrip}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hScrollSoldStrip}
      >
        {metrics.recentlySold.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Recently sold ${item.addressLine}`}
            onPress={onOpenSoldSeeAll}
          >
            <View style={styles.soldStripCard}>
              <Image
                source={propertyImageAtIndex(item.imageIndex)}
                style={styles.soldStripImg}
                resizeMode="cover"
              />
              <View style={styles.soldStripBody}>
                <Text style={styles.soldStripAddr} numberOfLines={2}>
                  {item.addressLine}
                </Text>
                <Text style={styles.soldStripSub} numberOfLines={1}>
                  {item.suburb}
                </Text>
                <Text style={styles.soldStripPrice} numberOfLines={1}>
                  {item.soldPriceDisplay}
                </Text>
                <Text style={styles.soldStripMeta} numberOfLines={1}>
                  {item.soldAtDisplay}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.kpiStrip}>
        <View style={styles.kpiStripRow}>
          <View
            style={styles.kpiCol}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`Active listings, ${metrics.activeListingsCount}`}
          >
            <Text style={styles.kpiLabel}>Active listings</Text>
            <Text style={styles.kpiValue}>{metrics.activeListingsCount}</Text>
          </View>
          <View
            style={styles.kpiCol}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`Pending listings, ${metrics.pendingListingsCount}`}
          >
            <Text style={styles.kpiLabel}>Pending listings</Text>
            <Text style={styles.kpiValue}>{metrics.pendingListingsCount}</Text>
          </View>
        </View>
        <View style={styles.kpiStripRow}>
          <View
            style={styles.kpiCol}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`Inspections booked, ${metrics.inspectionsBookedCount}`}
          >
            <Text style={styles.kpiLabel}>Inspections booked</Text>
            <Text style={styles.kpiValue}>{metrics.inspectionsBookedCount}</Text>
          </View>
          {pipelineRangeSafe ? (
            <View
              style={styles.kpiCol}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`${LEGAL_COPY_PIPELINE_COMMISSION_LABEL}, ${formatPipelineCommissionRangeDisplay(pipelineRangeSafe)}`}
            >
              <Text style={styles.kpiLabel}>{LEGAL_COPY_PIPELINE_COMMISSION_LABEL}</Text>
              <Text style={styles.kpiValue} numberOfLines={2}>
                {formatPipelineCommissionRangeDisplay(pipelineRangeSafe)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      {pipelineRangeSafe ? (
        <Text style={styles.kpiDisclaimer}>{LEGAL_COPY_PIPELINE_COMMISSION_DISCLAIMER}</Text>
      ) : null}
    </>
  );
}

/** Home — OMM [Figma area](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-1046&t=gEfFuYKIwBHVUzXh-4) */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const search = useGlobalSearchParams<{
    openBuyingSearch?: string;
    homeSegment?: string;
    _ts?: string;
  }>();
  const [mode, setMode] = useState<"selling" | "buying">("selling");
  const [buyingSearchActive, setBuyingSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState(DEMO_SEARCH_SUBURB);
  const buyingSearchRef = useRef<RNTextInput>(null);
  const [recentSearchesPinnedOnly, setRecentSearchesPinnedOnly] =
    useState(false);
  const [saveAlerts, setSaveAlerts] = useState(false);
  const { listings: savedProperties } = useSavedListings();
  const [agentMetrics, setAgentMetrics] = useState<AgentHomeMetricsPayload>(
    FALLBACK_AGENT_HOME_METRICS,
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      const next = await fetchAgentHomeMetrics(async () => null);
      if (alive) setAgentMetrics(next);
    })();
    return () => {
      alive = false;
    };
  }, []);

  /** Return to Home (e.g. listing published) on Selling. Query lives on `/(tabs)?homeSegment=…` — use global params. */
  useEffect(() => {
    if (search.homeSegment !== "selling") return;
    setMode("selling");
    setBuyingSearchActive(false);
  }, [search.homeSegment, search._ts]);

  /** Deep link: `?openBuyingSearch=results` (e.g. from Saved Searches → NEW SEARCH). */
  useEffect(() => {
    if (search.openBuyingSearch !== "results") return;
    setMode("buying");
    setBuyingSearchActive(true);
  }, [search.openBuyingSearch, search._ts]);

  return (
    <View style={[styles.screen, mode === "buying" && styles.screenBuying]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        {...(Platform.OS !== "web" && {
          decelerationRate: "normal",
          scrollEventThrottle: 16,
        })}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 112,
          },
        ]}
      >
        <View style={styles.topRow}>
          <Text style={styles.homeTitle}>Home</Text>
          <View style={styles.headerIcons}>
            <Pressable
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Messages"
              onPress={() => router.push("/messages" as Href)}
            >
              <FontAwesome name="comment-o" size={22} color="#000000" />
            </Pressable>
          </View>
        </View>

        <View style={styles.segment}>
          <Pressable
            onPress={() => {
              setMode("selling");
              setBuyingSearchActive(false);
            }}
            style={[
              styles.segmentItem,
              mode === "selling" && styles.segmentActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                mode === "selling" && styles.segmentTextActive,
              ]}
            >
              SELLING
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("buying")}
            style={[
              styles.segmentItem,
              mode === "buying" && styles.segmentActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                mode === "buying" && styles.segmentTextActive,
              ]}
            >
              BUYING
            </Text>
          </Pressable>
        </View>

        {mode === "selling" ? (
          <>
            <NotificationsRow
              onPress={() => router.push("/notifications" as Href)}
            />
            <View style={{ height: 12 }} />
            <SellingQuickLinksRow router={router} />
            <View style={{ height: 18 }} />
            <SellingPerformanceSlice
              metrics={agentMetrics}
              onOpenSoldSeeAll={() =>
                router.push({ pathname: "/recent-listings", params: { mode: "sold" } } as Href)
              }
            />
            <View style={{ height: 14 }} />
            <HeroCTA
              kicker="NEW LISTING"
              title="Publish a property"
              subtitle="Auto-fill listing details • SOI in 5 steps"
              onPress={() => router.push("/add" as Href)}
            />
            <SectionHeader
              title="Latest enquiries"
              onSeeAll={() => router.push("/messages" as Href)}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              <Pressable
                onPress={() => router.push("/messages" as Href)}
                accessibilityRole="button"
              >
                <EnquiryCard
                  name="John Doe"
                  time="2h ago"
                  address="8 Union St, Brunswick VIC 3056"
                  tag="RE: HAWTHORN CITY CENTER"
                />
              </Pressable>
              <Pressable
                onPress={() => router.push("/messages" as Href)}
                accessibilityRole="button"
              >
                <EnquiryCard
                  name="Anita Wong"
                  time="5h ago"
                  address="44 Walter St, Moorabbin VIC 3189"
                  tag="RE: INNER EAST BRIEF"
                />
              </Pressable>
              <Pressable
                onPress={() => router.push("/messages" as Href)}
                accessibilityRole="button"
              >
                <EnquiryCard
                  name="Dave Tribolet"
                  time="20 days ago"
                  address="2/28 Wimba Avenue, Kew, VIC 3101"
                  tag="REGISTERED BUYER FOLLOW-UP"
                />
              </Pressable>
            </ScrollView>
            <BuyerEnquiriesCallout
              onViewAll={() => router.push("/messages" as Href)}
            />
            <SectionHeader
              title="Authority expiring"
              onSeeAll={() => router.push("/authority-expiring" as Href)}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              <AuthorityExpiringCarouselCard
                address="45 Buckley St, Moonee Ponds VIC 3039"
                daysLeft="6D LEFT"
                subtitleLine="Moonee Ponds Villa"
                soiPill="SOI ATTACHED"
              />
              <AuthorityExpiringCarouselCard
                address="102 Glenhuntly Rd, Elsternwick VIC 3185"
                daysLeft="11D LEFT"
                subtitleLine="Elsternwick Corner Shop"
                soiPill="SOI MISSING — ACTION NEEDED"
              />
              <AuthorityExpiringCarouselCard
                address="17 Ferguson St, Williamstown VIC 3016"
                daysLeft="16D LEFT"
                subtitleLine="Williamstown Period"
                soiPill="SOI ATTACHED"
              />
            </ScrollView>
            <SectionHeader
              title="SOI expiring soon"
              onSeeAll={() => router.push("/authority-expiring" as Href)}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScrollDense}
            >
              <ListingThumbRow
                imageSource={propertyImageAtIndex(2)}
                titleLine="83A Glen Iris Road"
                subtitleLine="Glen Iris VIC"
                onPress={() => router.push("/view-live-listing" as Href)}
              />
              <ListingThumbRow
                imageSource={propertyImageAtIndex(0)}
                titleLine="312 Church Street"
                subtitleLine="Richmond VIC"
                onPress={() =>
                  router.push({ pathname: "/recent-listings", params: { mode: "live" } } as Href)
                }
              />
              <ListingThumbRow
                imageSource={PROPERTY_IMG_1}
                titleLine="18 Marine Parade"
                subtitleLine="Elwood VIC"
                onPress={() =>
                  router.push({ pathname: "/recent-listings", params: { mode: "live" } } as Href)
                }
              />
            </ScrollView>
            <SectionHeader
              title="Your active listings"
              style={styles.sectionHeaderBeforeListingCard}
              onSeeAll={() =>
                router.push({ pathname: "/recent-listings", params: { mode: "live" } } as Href)
              }
            />
            <View style={styles.activeListingStack}>
              <ListingThumbRow
                imageSource={PROPERTY_IMG_1}
                titleLine={DEMO_PRIMARY_LISTING_TITLE}
                subtitleLine="Brighton East VIC • Auth 14d left"
                onPress={() => router.push("/view-live-listing" as Href)}
              />
              <ListingThumbRow
                imageSource={PROPERTY_IMG_2}
                titleLine="Carlton Warehouse Conversion"
                subtitleLine="Carlton VIC • 4 leads · SOI OK"
                onPress={() => router.push("/list" as Href)}
              />
            </View>
          </>
        ) : buyingSearchActive ? (
          <>
            <View style={styles.searchRow}>
              <View style={[styles.searchField, styles.searchFieldResults]}>
                <FontAwesome name="search" size={16} color="#000000" />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Suburb or area"
                  placeholderTextColor="rgba(0, 0, 0, 0.45)"
                />
              </View>
              <AppButton
                variant="filled"
                shrink
                onPress={() => setBuyingSearchActive(true)}
                textStyle={styles.exploreBtnLabel}
                style={styles.exploreBtnWrap}
              >
                EXPLORE
              </AppButton>
            </View>
            <View style={styles.saveBanner}>
              <View style={styles.saveBannerLeft}>
                <FontAwesome
                  name="star-o"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.saveBannerTitle}>
                    Save search & get alerts
                  </Text>
                  <Text style={styles.saveBannerSub}>
                    Notify me the moment a new match appears
                  </Text>
                </View>
              </View>
              <Switch
                value={saveAlerts}
                onValueChange={setSaveAlerts}
                trackColor={{ false: "#444", true: "#6ccf7a" }}
              />
            </View>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>12 off-market matches</Text>
              <Text style={styles.sortLink}>SORT • BEST MATCH</Text>
            </View>
            <SearchMatchRow
              name="Preston California Bungalow"
              address="15 Miller St, Preston VIC 3072"
              price="$2.1M — $2.3M"
              specs="4 bedrooms · 3 bathrooms · 720m²"
              match="92% MATCH"
              imageSource={propertyImageAtIndex(0)}
            />
            <View style={styles.resultDivider} />
            <SearchMatchRow
              name="Sandringham Bay House"
              address="72 Bay Rd, Sandringham VIC 3191"
              price="$1.9M — $2.2M"
              specs="3 bedrooms · 2 bathrooms · 420m²"
              match="88% MATCH"
              imageSource={propertyImageAtIndex(1)}
            />
            <View style={styles.resultDivider} />
            <SearchMatchRow
              name="Collingwood Workshop"
              address="201 Smith St, Collingwood VIC 3066"
              price="$1.6M — $1.85M"
              specs="3 bedrooms · 2 bathrooms · 310m²"
              match="85% MATCH"
              imageSource={propertyImageAtIndex(2)}
            />
          </>
        ) : (
          <>
            <View style={styles.buyingHeroBleed}>
              <ImageBackground
                source={PROPERTY_IMG_1}
                style={styles.buyingHeroBg}
                imageStyle={styles.buyingHeroImgRadius}
              >
                <View style={styles.buyingHeroDim} pointerEvents="none" />
              </ImageBackground>
              <View style={styles.buyingHeroPillOuter}>
                <View style={styles.buyingHeroPill}>
                  <View style={styles.buyingHeroPillIcon}>
                    <FontAwesome name="home" size={14} color="#ffffff" />
                  </View>
                  <TextInput
                    ref={buyingSearchRef}
                    style={[styles.searchInput, styles.buyingHeroPillInput]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Start a search"
                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                    returnKeyType="search"
                    onSubmitEditing={() => setBuyingSearchActive(true)}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Explore listings"
                    hitSlop={8}
                    onPress={() => setBuyingSearchActive(true)}
                    style={({ pressed }) => [
                      styles.buyingHeroMiniGo,
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <FontAwesome name="arrow-right" size={16} color="#ffffff" />
                  </Pressable>
                </View>
              </View>
            </View>
            <View style={styles.recentSearchHeader}>
              <Text style={styles.sectionTitle}>Recent searches</Text>
              <View style={styles.recentSearchToggle}>
                <FontAwesome
                  name="star"
                  size={17}
                  color={
                    recentSearchesPinnedOnly ? "#f59e0b" : "rgba(0,0,0,0.25)"
                  }
                />
                <Switch
                  accessibilityLabel="Show saved searches only"
                  value={recentSearchesPinnedOnly}
                  onValueChange={setRecentSearchesPinnedOnly}
                  trackColor={{
                    false: "rgba(0,0,0,0.12)",
                    true: "rgba(245,158,11,0.55)",
                  }}
                />
              </View>
            </View>
            {!recentSearchesPinnedOnly ? (
              <View style={styles.recentSearchBrowseRow}>
                <View style={styles.recentSearchIconCircle}>
                  <FontAwesome name="search" size={16} color="#111111" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentBrowseTitle}>
                    Hawthorn, VIC 3122
                  </Text>
                  <Text style={styles.recentBrowseSub}>
                    Buy · Off‑market aware
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  style={styles.saveChipBtn}
                >
                  <FontAwesome name="star-o" size={14} color="#111111" />
                  <Text style={styles.saveChipLabel}>Save</Text>
                </Pressable>
              </View>
            ) : null}
            <HeroCTA
              kicker="BUYER BRIEF"
              title="Post a buyer brief"
              subtitle="Share your criteria; agents reply when their stock fits"
              onPress={() => router.push("/post-buyer-brief" as Href)}
            />
            <View style={[styles.sellerNetworkCard, fieldShell]}>
              <Text style={styles.sellerNetworkTitle}>
                6 Active Seller Matches
              </Text>
              <Text style={styles.sellerNetworkBody}>
                Verified sellers in your corridors are listing overlapping
                stock. Swap intel, co-marketing leads, and referral handoffs
                with peers who sell where you sell.
              </Text>
              <Pressable
                style={styles.sellerNetworkCta}
                onPress={() => router.push("/your-matches" as Href)}
                accessibilityRole="button"
              >
                <Text style={styles.sellerNetworkCtaText}>
                  View Seller Matches
                </Text>
              </Pressable>
            </View>
            <SectionHeader
              title="Recent agent replies"
              onSeeAll={() => router.push("/messages" as Href)}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              <Pressable
                onPress={() => router.push("/messages" as Href)}
                accessibilityRole="button"
              >
                <AgentReplyCard
                  name="John Doe"
                  agency="Jellis Craig"
                  snippet="YES, OFF-MARKET IN CAMBERWELL FITS YOUR BRIEF — HAPPY TO CONNECT"
                />
              </Pressable>
              <Pressable
                onPress={() => router.push("/messages" as Href)}
                accessibilityRole="button"
              >
                <AgentReplyCard
                  name="Jane Price"
                  agency="Kay & Burton"
                  snippet="SIMILAR STOCK COMING — CAN PRIORITISE YOUR BRIEF"
                />
              </Pressable>
            </ScrollView>
            <SectionHeader
              title="Saved searches"
              onSeeAll={() => router.push("/saved-searches")}
            />
            <SavedSearchCard
              name="John Doe"
              criteria="4+ bedrooms • House • $1.8M—2.4M"
              badge="8 NEW"
              alertsOn
              meta="Yesterday"
            />
            <View style={{ height: 12 }} />
            <SavedSearchCard
              name="Footscray & Seddon"
              criteria="3+ bedrooms • Townhouse • $2M—3M"
              badge="2 NEW"
              alertsOn={false}
              meta="Paused 2d ago"
            />
            {savedProperties.length > 0 ? (
              <>
                <SectionHeader
                  title="Saved properties"
                  style={styles.sectionHeaderBeforeListingCard}
                  onSeeAll={() => router.push("/saved-properties" as Href)}
                />
                {savedProperties.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      if (item.id === VIEW_LIVE_LISTING_ID) {
                        router.push("/view-live-listing" as Href);
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Open saved listing ${item.title}`}
                  >
                    <LargeListingCard
                      title={item.title}
                      price={item.price}
                      specLine={item.specLine}
                      badgeLeft={item.badgeLeft}
                      badgeRight={item.badgeRight}
                      footerLabels={item.footerLabels}
                      imageSource={propertyImageAtIndex(item.imageIndex)}
                    />
                  </Pressable>
                ))}
              </>
            ) : null}
            <SectionHeader
              title="Recently Listed"
              style={styles.sectionHeaderBeforeListingCard}
              onSeeAll={() =>
                router.push({ pathname: "/recent-listings", params: { mode: "listed" } } as Href)
              }
            />
            <Pressable
              onPress={() => router.push("/view-live-listing" as Href)}
              accessibilityRole="button"
              accessibilityLabel={`Open listing ${DEMO_PRIMARY_LISTING_TITLE}`}
            >
              <LargeListingCard
                variant="buying"
                title={DEMO_PRIMARY_LISTING_TITLE}
                price="$2.0M — $2.2M"
                badgeLeft="OFF-MARKET"
                badgeRight="92% MATCH"
                specParts={["4 bedrooms", "3 bathrooms", "650m²"]}
              />
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: frost },
  /** Buying tab: grouped surface — same frost base as selling for palette cohesion */
  screenBuying: { backgroundColor: frost },
  scrollContent: { paddingHorizontal: 20 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  homeTitle: {
    fontSize: 32,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    letterSpacing: -0.8,
  },
  headerIcons: { flexDirection: "row", alignItems: "center", gap: 18 },
  segment: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 9,
    padding: 4,
    marginBottom: 20,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.50)",
    letterSpacing: 0.4,
  },
  segmentTextActive: { color: "#000000" },
  /** Vertical breathing room above/below quick links strip. */
  quickLinksBlock: {
    paddingTop: 6,
    paddingBottom: 8,
  },
  quickLinksScrollInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 28,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 96,
  },
  quickLinkChip: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 88,
    backgroundColor: "transparent",
    borderRadius: 7,
  },
  quickLinkChipPressed: { opacity: 0.88 },
  quickLinkChipIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 7,
    backgroundColor: "rgba(17,17,17,0.065)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickLinkChipLabel: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
    textAlign: "center",
    letterSpacing: -0.1,
    lineHeight: 17,
  },
  quickLinkStubPill: {
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "rgba(17,17,17,0.07)",
  },
  quickLinkStubPillText: {
    fontSize: 9,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.5)",
    letterSpacing: 0.35,
    textTransform: "uppercase",
  },
  notificationsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationsIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(17,17,17,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationsLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: slateNavy,
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
  },
  heroTextCol: { flex: 1, paddingRight: 12 },
  heroKicker: {
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: "Satoshi-Medium",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 18,
  },
  heroFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  /** Space before any `LargeListingCard` block (Buying + Selling): even header↔card and section↔section rhythm */
  sectionHeaderBeforeListingCard: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.45)",
  },
  hScroll: { gap: 12, paddingBottom: 24 },
  hScrollDense: { gap: 10, paddingBottom: 8 },
  /** Tighter footer before the KPI strip (selling metrics). */
  hScrollSoldStrip: { gap: 10, paddingBottom: 12 },
  sectionHeaderSoldStrip: {
    marginTop: 0,
  },
  soldStripCard: {
    width: 208,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(17,17,17,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  soldStripImg: { width: "100%", height: 88 },
  soldStripBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  soldStripAddr: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
    lineHeight: 19,
  },
  soldStripSub: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.48)",
  },
  soldStripPrice: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
  },
  soldStripMeta: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.42)",
  },
  kpiStrip: {
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(17,17,17,0.08)",
    marginBottom: 0,
  },
  kpiStripRow: {
    flexDirection: "row",
    gap: 16,
  },
  kpiCol: {
    flex: 1,
    minWidth: 0,
  },
  kpiLabel: {
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.46)",
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 20,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
  },
  kpiDisclaimer: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.42)",
    marginBottom: 2,
  },
  sellerNetworkCard: {
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    backgroundColor: "#fff",
  },
  sellerNetworkTitle: {
    fontSize: 17,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    marginBottom: 10,
  },
  sellerNetworkBody: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.55)",
    lineHeight: 21,
    marginBottom: 18,
  },
  sellerNetworkCta: {
    backgroundColor: accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  sellerNetworkCtaText: {
    color: ink,
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
  },
  enquiryCard: {
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  enqTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  enqName: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
  },
  enqTime: {
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.42)",
    marginTop: 2,
  },
  enqAddr: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17, 17, 17, 0.52)",
    lineHeight: 18,
  },
  enqPill: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: "rgba(17,17,17,0.055)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  enqPillText: {
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.62)",
  },
  buyerEnqCard: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  buyerEnqIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(17,17,17,0.065)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  buyerEnqHeadline: {
    fontSize: 17,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 8,
  },
  buyerEnqSub: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.52)",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  buyerEnqGhostBtn: {
    alignSelf: "stretch",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(17,17,17,0.35)",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  buyerEnqGhostBtnText: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
  },
  thumbRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 240,
    padding: 10,
    marginRight: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(17,17,17,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbRowImg: { width: 52, height: 52, borderRadius: 8 },
  thumbRowBody: { flex: 1, marginLeft: 12, minWidth: 0 },
  thumbRowTitle: {
    fontSize: 15,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
  },
  thumbRowSub: {
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.48)",
    marginTop: 2,
  },
  activeListingStack: {
    gap: 10,
    marginBottom: 8,
  },
  dashboardHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  dashboardHintText: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.5)",
  },
  buyingHeroBleed: {
    marginHorizontal: -20,
    marginBottom: 8,
    overflow: "hidden",
  },
  buyingHeroBg: { height: 152, justifyContent: "flex-end" },
  buyingHeroImgRadius: {},
  buyingHeroDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20,26,38,0.22)",
  },
  buyingHeroPillOuter: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 18,
  },
  buyingHeroPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingLeft: 6,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  buyingHeroPillIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  buyingHeroPillInput: {
    flex: 1,
    marginLeft: 0,
    paddingVertical: 6,
    fontSize: 15,
  },
  buyingHeroMiniGo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  recentSearchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
  },
  recentSearchToggle: { flexDirection: "row", alignItems: "center", gap: 8 },
  recentSearchBrowseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(17,17,17,0.08)",
  },
  recentSearchIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(17,17,17,0.07)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recentBrowseTitle: {
    fontSize: 16,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
  },
  recentBrowseSub: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.46)",
    marginTop: 2,
  },
  saveChipBtn: { alignItems: "center", paddingHorizontal: 4, minWidth: 44 },
  saveChipLabel: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.55)",
    letterSpacing: 0.2,
  },
  authCarouselCard: {
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  authCarouselTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  authCarouselAddr: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    lineHeight: 20,
  },
  authCarouselDays: {
    backgroundColor: slateNavy,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  authCarouselDaysText: {
    fontSize: 9,
    fontFamily: "Satoshi-Medium",
    color: "#fff",
    letterSpacing: 0.45,
    textTransform: "uppercase",
  },
  authCarouselSub: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.55)",
    marginTop: 8,
  },
  authCarouselPill: {
    alignSelf: "center",
    marginTop: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: "100%",
  },
  authCarouselPillText: {
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.65)",
    textAlign: "center",
  },
  largeCardOuter: {
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  /** Slightly softer on shorter buying hero — same structure */
  largeCardOuterBuying: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 20,
    elevation: 9,
  },
  largeCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0, 0, 0, 0.09)",
  },
  largeCardBuying: {},
  largeImgWrap: { height: 200, position: "relative" },
  largeImgWrapBuying: { height: 168 },
  largeImg: { width: "100%", height: "100%" },
  badgeLeft: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: slateNavy,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeLeftText: {
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: "#fff",
    letterSpacing: 0.5,
  },
  badgeLeftBuying: { backgroundColor: "#212121" },
  badgeRight: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeRightText: {
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
  },
  badgeRightBuying: { backgroundColor: "#f2f2f2" },
  badgeRightTextBuying: { color: "#000" },
  largeBody: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  propTitle: {
    fontSize: 18,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    lineHeight: 24,
  },
  propTitleBuying: {
    fontSize: 16,
    fontFamily: "Satoshi-Medium",
    color: "#000",
    lineHeight: 21,
  },
  propPrice: {
    fontSize: 16,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    marginTop: 6,
    lineHeight: 22,
  },
  propPriceBuying: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0,0,0,0.55)",
    marginTop: 6,
    lineHeight: 20,
  },
  propSpecs: {
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.45)",
    marginTop: 6,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  specRowBuying: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 6,
  },
  specChipBuying: {
    fontSize: 11,
    fontWeight: "400",
    color: "rgba(0, 0, 0, 0.55)",
    textTransform: "lowercase",
  },
  specSepBuying: {
    fontSize: 11,
    fontWeight: "400",
    color: "rgba(0, 0, 0, 0.45)",
  },
  propStatsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, 0.12)",
  },
  propStat: {
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.55)",
    letterSpacing: 0.3,
    lineHeight: 14,
    flex: 1,
  },
  propStatFooterStart: { textAlign: "left", paddingRight: 6 },
  propStatFooterMid: { textAlign: "center", paddingHorizontal: 4 },
  propStatFooterEnd: { textAlign: "right", paddingLeft: 6 },
  /** Search + EXPLORE — [Figma: flat beige field, black icon + type, 12px radius to match EXPLORE] */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  searchField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede8e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    minHeight: 48,
  },
  searchFieldResults: {
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0, 0, 0, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "400",
    color: "#000000",
    paddingVertical: 8,
  },
  exploreBtnWrap: {},
  exploreBtnLabel: {
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    letterSpacing: 0.6,
  },
  replyCard: {
    width: 240,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  replyName: { fontSize: 16, fontFamily: "Satoshi-Medium", color: "#000000" },
  replyAgency: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.55)",
    marginTop: 4,
  },
  replySnippet: {
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.7)",
    marginTop: 10,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  savedCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
  },
  savedTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  savedName: {
    fontSize: 17,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    flex: 1,
  },
  newBadge: {
    backgroundColor: slateNavy,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBadgeText: { fontSize: 10, fontFamily: "Satoshi-Medium", color: "#fff" },
  savedCriteria: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.55)",
    marginTop: 8,
  },
  savedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  savedDot: { fontSize: 12, fontFamily: "Satoshi-Medium", color: "#000000" },
  savedDotOff: { color: "rgba(0, 0, 0, 0.35)" },
  savedMeta: {
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.45)",
  },
  saveBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: slateNavy,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  saveBannerLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  saveBannerTitle: {
    fontSize: 15,
    fontFamily: "Satoshi-Medium",
    color: "#fff",
  },
  saveBannerSub: {
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
  },
  sortLink: {
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.45)",
    letterSpacing: 0.4,
  },
  resultDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    marginVertical: 14,
  },
  matchRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  matchThumbWrap: {
    width: 100,
    height: 100,
    position: "relative",
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    overflow: "hidden",
  },
  matchThumb: { width: "100%", height: "100%" },
  matchTagOff: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: slateNavy,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  matchTagText: { fontSize: 8, fontFamily: "Satoshi-Medium", color: "#fff" },
  matchPct: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: slateNavy,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  matchPctText: { fontSize: 9, fontFamily: "Satoshi-Medium", color: "#fff" },
  matchBody: { flex: 1, padding: 12, justifyContent: "center" },
  matchName: { fontSize: 15, fontFamily: "Satoshi-Medium", color: "#000000" },
  matchAddr: {
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.55)",
    marginTop: 4,
  },
  matchPrice: {
    fontSize: 16,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    marginTop: 8,
  },
  matchSpecs: {
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.45)",
    marginTop: 6,
  },
});
