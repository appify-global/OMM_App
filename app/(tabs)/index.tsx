import { Text } from "@/components/OMMText";
import { TextInput } from "@/components/OMMTextInput";
import { useAuth } from "@clerk/expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useGlobalSearchParams, useRouter, type Href } from "expo-router";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Image,
  ImageBackground,
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
import {
  FALLBACK_AGENT_HOME_METRICS,
  LEGAL_COPY_PIPELINE_COMMISSION_DISCLAIMER,
  LEGAL_COPY_PIPELINE_COMMISSION_LABEL,
  PIPELINE_KPI_LEGALLY_APPROVED,
  fetchAgentHomeMetrics,
  formatPipelineCommissionRangeDisplay,
  type AgentHomeMetricsPayload,
} from "@/lib/agent-home-metrics";
import {
  publishedToMobileHomeListing,
  publishedToOffMarketMatch,
  filterSavedListingsNotArchivedPublished,
  isPublishedListingArchived,
  recentlySoldStripFromPublishedListings,
  resolvedPublishedListingStatus,
  sellingKpisFromPublishedListings,
} from "@/lib/agent-published-listings";
import { useAgentPublishedListings } from "@/lib/agent-published-listings-context";
import { getAgentQuickLinksForHome } from "@/lib/agent-quick-links";
import {
  buyerSearchTokens,
  isListingVisibleForBuyerSearch,
  listingMatchesBuyerQuery,
  viewLiveListingAddressParamsFromListing,
} from "@/lib/buyer-listed-search";
import {
  buyerSavedMetaForRow,
  mergeBuyerSavedSearches,
  type BuyerSavedSearchMergedRow,
} from "@/lib/buyer-saved-searches-merge";
import { FIELD_OUTLINE_WIDTH } from "@/lib/field-outline";
import {
  DEMO_PRIMARY_LISTING_TITLE,
  DEMO_SEARCH_SUBURB,
} from "@/lib/melbourne-demo-locations";
import {
  deriveAgentMetricsFromHome,
  fetchMobileHome,
  thumbnailIndexFromListingId,
  type MobileHomeListing,
  type MobileHomePayload,
} from "@/lib/mobile-home-api";
import {
  PROPERTY_IMG_1,
  PROPERTY_IMG_2,
  propertyImageAtIndex,
} from "@/lib/propertyImages";
import { useRecentBuyerSearches } from "@/lib/recent-buyer-searches-context";
import { useSavedListings } from "@/lib/saved-listings-context";
import { normalizeSearchKey } from "@/lib/saved-searches";
import { useSavedSearches } from "@/lib/saved-searches-context";

import { fieldShell } from "@/components/list-add/flow-shared";
import { accent, frost, ink, slateNavy } from "@/constants/theme";

/** Buying home saved-search rows — darker stroke reads on frost background (#F8FAFC). */
const SAVED_SEARCH_HOME_BORDER = "rgba(30, 41, 59, 0.2)";

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
  onPress,
}: {
  name: string;
  criteria: string;
  badge?: string;
  alertsOn: boolean;
  meta: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.savedCardHitBox,
        onPress && pressed && { opacity: 0.93 },
      ]}
    >
      <View style={styles.savedCardChrome}>
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
    </Pressable>
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

/** Deterministic `% MATCH` so listed rows mirror the off-market badge without rankings API. */
function buyerSearchMatchPill(listingId: string): string {
  let hash = 0;
  for (let i = 0; i < listingId.length; i += 1) {
    hash = Math.imul(31, hash) + listingId.charCodeAt(i);
  }
  const pct = Math.min(94, Math.max(68, Math.abs(hash % 101)));
  return `${pct}% MATCH`;
}

/** Reference layout: `4 BED • 3 BATH • 720M²`. */
function buyerSearchSpecsCaps(
  beds: number,
  baths: number,
  landSqm: number,
): string {
  const land = Number.isFinite(landSqm) ? Math.round(landSqm) : 0;
  return `${beds} BED • ${baths} BATH • ${land}M²`;
}

function SearchMatchRow({
  name,
  address,
  price,
  specs,
  match,
  imageSource,
  ribbon = "OFF-MARKET",
  onPress,
}: {
  name: string;
  address: string;
  price: string;
  specs: string;
  match: string;
  imageSource: ImageSourcePropType;
  /** Left ribbon pill (OFF-MARKET vs LISTED). */
  ribbon?: string;
  onPress?: () => void;
}) {
  const thumbAndBody = (
    <>
      <View style={styles.matchThumbColumn}>
        <Image
          source={imageSource}
          style={styles.matchThumbImage}
          resizeMode="cover"
        />
        <View style={styles.matchRibbon}>
          <Text style={styles.matchRibbonText} numberOfLines={1}>
            {ribbon}
          </Text>
        </View>
        <View style={styles.matchScorePill}>
          <Text style={styles.matchScorePillText} numberOfLines={1}>
            {match}
          </Text>
        </View>
      </View>
      <View style={styles.matchTextColumn}>
        <Text style={styles.matchTitle} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.matchAddress} numberOfLines={2}>
          {address}
        </Text>
        <Text style={styles.matchPriceLine} numberOfLines={2}>
          {price}
        </Text>
        <Text style={styles.matchSpecsCaps} numberOfLines={2}>
          {specs}
        </Text>
      </View>
    </>
  );

  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open listing ${name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.matchRow, pressed && { opacity: 0.93 }]}
    >
      {thumbAndBody}
    </Pressable>
  ) : (
    <View style={styles.matchRow}>{thumbAndBody}</View>
  );
}

function SellingQuickLinksRow({
  router,
}: {
  router: ReturnType<typeof useRouter>;
}) {
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
  soldStripPlaceholder,
}: {
  metrics: AgentHomeMetricsPayload;
  onOpenSoldSeeAll: () => void;
  /** Shown instead of an empty carousel when the agent has device listings but none marked Sold yet. */
  soldStripPlaceholder?: string;
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
      {metrics.recentlySold.length === 0 && soldStripPlaceholder ? (
        <Text style={styles.soldStripPlaceholder}>{soldStripPlaceholder}</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScrollSoldStrip}
        >
          {metrics.recentlySold.map((item) => {
            const thumb =
              item.coverImageUri?.trim().length
                ? { uri: item.coverImageUri.trim() }
                : propertyImageAtIndex(item.imageIndex);
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Recently sold ${item.addressLine}`}
                onPress={onOpenSoldSeeAll}
              >
                <View style={styles.soldStripCard}>
                  <Image
                    source={thumb}
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
            );
          })}
        </ScrollView>
      )}
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
            <Text style={styles.kpiValue}>
              {metrics.inspectionsBookedCount}
            </Text>
          </View>
          <View
            style={styles.kpiCol}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`Sold listings, ${metrics.soldListingsCount}`}
          >
            <Text style={styles.kpiLabel}>Sold listings</Text>
            <Text style={styles.kpiValue}>{metrics.soldListingsCount}</Text>
          </View>
        </View>
        {pipelineRangeSafe ? (
          <>
            <View
              style={styles.kpiPipelineSection}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`${LEGAL_COPY_PIPELINE_COMMISSION_LABEL}, ${formatPipelineCommissionRangeDisplay(pipelineRangeSafe)}`}
            >
              <Text style={styles.kpiLabel}>
                {LEGAL_COPY_PIPELINE_COMMISSION_LABEL}
              </Text>
              <Text style={styles.kpiValue} numberOfLines={2}>
                {formatPipelineCommissionRangeDisplay(pipelineRangeSafe)}
              </Text>
            </View>
            <Text style={styles.kpiDisclaimer}>
              {LEGAL_COPY_PIPELINE_COMMISSION_DISCLAIMER}
            </Text>
          </>
        ) : null}
      </View>
    </>
  );
}

/** Home — OMM [Figma area](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-1046&t=gEfFuYKIwBHVUzXh-4) */
/** Subtitle shown under thumbnail rows / active stacks for a listing summary. */
function activeListingSubtitle(l: MobileHomeListing): string {
  const statusExtra =
    l.status && !["ACTIVE"].includes(String(l.status).toUpperCase())
      ? ` · ${l.status}`
      : "";
  const auth =
    typeof l.authorityDaysLeft === "number"
      ? ` · Authority ${Math.max(0, l.authorityDaysLeft)}d`
      : "";
  const soi = l.soiAttached ? "" : " · SOI pending";
  return `${l.priceRange}${statusExtra}${auth}${soi}`;
}

function mergeByIdLocalFirst<T extends { id: string }>(
  local: T[],
  remote: T[],
): T[] {
  const seen = new Set(local.map((x) => x.id));
  return [...local, ...remote.filter((r) => !seen.has(r.id))];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const search = useGlobalSearchParams<{
    openBuyingSearch?: string;
    homeSegment?: string;
    buyingQuery?: string;
    _ts?: string;
  }>();
  const [mode, setMode] = useState<"selling" | "buying">("selling");
  const [buyingSearchActive, setBuyingSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const buyingSearchRef = useRef<RNTextInput>(null);
  /** Previous trimmed Buying query length — detects non-empty → empty to exit Explore without bouncing browse-all on open. */
  const prevBuyerSearchTrimLenRef = useRef(0);
  const [recentSearchesPinnedOnly, setRecentSearchesPinnedOnly] =
    useState(false);
  const [saveAlerts, setSaveAlerts] = useState(false);
  const { listings: savedProperties } = useSavedListings();
  const { listings: publishedAgentListings } = useAgentPublishedListings();

  const visibleSavedProperties = useMemo(
    () => filterSavedListingsNotArchivedPublished(savedProperties, publishedAgentListings),
    [savedProperties, publishedAgentListings],
  );
  const buyingSavedFeatured = visibleSavedProperties[0];
  const {
    searches: buyerDeviceSavedSearches,
    upsertSearch: upsertBuyerSavedSearch,
    removeSearch: removeBuyerSavedSearch,
  } = useSavedSearches();
  const { recent: recentBuyerRows, recordBuyerExplore } =
    useRecentBuyerSearches();
  const [agentMetrics, setAgentMetrics] = useState<AgentHomeMetricsPayload>(
    FALLBACK_AGENT_HOME_METRICS,
  );
  const [mobileHome, setMobileHome] = useState<MobileHomePayload | null>(null);

  const mergedPipelineListings = mergeByIdLocalFirst(
    publishedAgentListings
      .filter((p) => !isPublishedListingArchived(p))
      .filter((p) => resolvedPublishedListingStatus(p) !== "sold")
      .map(publishedToMobileHomeListing),
    mobileHome?.selling.pipelineListings ?? [],
  );

  const mergedOffMarketListed = mergeByIdLocalFirst(
    publishedAgentListings
      .filter((p) => !isPublishedListingArchived(p))
      .filter((p) => resolvedPublishedListingStatus(p) === "live")
      .map(publishedToOffMarketMatch),
    mobileHome?.buying.offMarketMatches ?? [],
  );

  const mergedBuyerListedCatalog = useMemo(() => {
    const publishedRows = publishedAgentListings
      .filter((p) => !isPublishedListingArchived(p))
      .filter((p) => resolvedPublishedListingStatus(p) === "live")
      .map(publishedToMobileHomeListing);
    const activeFiltered = (mobileHome?.selling.activeListings ?? []).filter(
      isListingVisibleForBuyerSearch,
    );
    const pipeFiltered = (mobileHome?.selling.pipelineListings ?? []).filter(
      isListingVisibleForBuyerSearch,
    );
    const mergedFromApi = mergeByIdLocalFirst(activeFiltered, pipeFiltered);
    return mergeByIdLocalFirst(publishedRows, mergedFromApi);
  }, [publishedAgentListings, mobileHome]);

  const buyerListedVisibleRows = useMemo(() => {
    const q = searchQuery.trim();
    if (buyerSearchTokens(q).length === 0) {
      return mergedBuyerListedCatalog.slice(0, 48);
    }
    return mergedBuyerListedCatalog.filter((l) =>
      listingMatchesBuyerQuery(l, q),
    );
  }, [mergedBuyerListedCatalog, searchQuery]);

  const trimmedBuyerListedQ = searchQuery.trim();
  const buyerListedSearchHasTokens =
    buyerSearchTokens(trimmedBuyerListedQ).length > 0;

  const buyerListedResultsCountLabel = !buyerListedSearchHasTokens
    ? mergedBuyerListedCatalog.length === 0
      ? "No listings in catalogue yet."
      : buyerListedVisibleRows.length
        ? `Showing ${buyerListedVisibleRows.length} listed ${
            buyerListedVisibleRows.length === 1 ? "property" : "properties"
          }`
        : "No listings in catalogue yet."
    : buyerListedVisibleRows.length
      ? `${buyerListedVisibleRows.length} match${
          buyerListedVisibleRows.length === 1 ? "" : "es"
        } for your search`
      : `No listings match “${
          trimmedBuyerListedQ.length > 36
            ? `${trimmedBuyerListedQ.slice(0, 36)}…`
            : trimmedBuyerListedQ
        }”. Try suburb, street, or price keywords.`;

  const mergedBuyerSavedSearches = mergeBuyerSavedSearches(
    buyerDeviceSavedSearches,
    mobileHome?.buying.savedSearches ?? [],
  );

  const openBuyerSavedRow = (row: BuyerSavedSearchMergedRow) => {
    const q = (row.suburbQuery ?? row.title).trim();
    const enc = encodeURIComponent(q);
    router.replace(
      `/(tabs)?openBuyingSearch=results&buyingQuery=${enc}&_ts=${Date.now()}` as Href,
    );
  };

  const openBuyerListedRow = useCallback(
    (l: MobileHomeListing) => {
      if (l.id.startsWith("omm-")) {
        router.push({
          pathname: "/view-live-listing" as Href,
          params: { listingId: l.id },
        } as Href);
        return;
      }
      const { street, suburb } = viewLiveListingAddressParamsFromListing(l);
      router.push({
        pathname: "/view-live-listing" as Href,
        params: {
          street,
          suburb,
          price: l.priceRange,
          beds: String(l.beds),
          baths: String(l.baths),
          cars: "0",
          imageIndex: String(thumbnailIndexFromListingId(l.id)),
        },
      } as Href);
    },
    [router],
  );

  /** Immediate dismiss when field goes from non-empty → empty (effect backup handles programmatic updates). */
  const handleBuyerSearchChange = (text: string) => {
    const prevTrimLen = searchQuery.trim().length;
    const nextTrimLen = text.trim().length;
    setSearchQuery(text);
    prevBuyerSearchTrimLenRef.current = nextTrimLen;
    if (mode !== "buying" || !buyingSearchActive) return;
    if (nextTrimLen === 0 && prevTrimLen > 0) {
      setBuyingSearchActive(false);
      if (search.openBuyingSearch === "results") {
        router.replace("/(tabs)" as Href);
      }
    }
  };

  const beginBuyingExplore = useCallback(
    (opts?: { query?: string }) => {
      const nextRaw = opts?.query !== undefined ? opts.query : searchQuery;
      const trimmed = nextRaw.trim();
      if (trimmed.length > 0) {
        void recordBuyerExplore(trimmed);
      }
      if (opts?.query !== undefined) {
        setSearchQuery(opts.query);
      }
      setBuyingSearchActive(true);
      prevBuyerSearchTrimLenRef.current = trimmed.length;
    },
    [recordBuyerExplore, searchQuery],
  );

  useEffect(() => {
    if (!isLoaded) return;
    let alive = true;
    const tokenGetter = async () => (await getTokenRef.current()) ?? null;
    void (async () => {
      const [metricsRes, home] = await Promise.all([
        fetchAgentHomeMetrics(tokenGetter),
        fetchMobileHome(tokenGetter),
      ]);
      if (!alive) return;
      setAgentMetrics(deriveAgentMetricsFromHome(home, metricsRes.metrics));
      setMobileHome(home);
    })();
    return () => {
      alive = false;
    };
    /** Clerk’s `getToken` identity churns often; anchor on stable auth/session signals. */
  }, [isLoaded, isSignedIn]);

  /** Selling KPI row: prefer device-published listings when any exist (includes persisted inspection bookings). */
  const sellingPerformanceMetrics = useMemo(() => {
    if (publishedAgentListings.length === 0) {
      return agentMetrics;
    }
    const local = sellingKpisFromPublishedListings(publishedAgentListings);
    const recentlySold = recentlySoldStripFromPublishedListings(publishedAgentListings);
    return {
      ...agentMetrics,
      activeListingsCount: local.activeListingsCount,
      pendingListingsCount: local.pendingListingsCount,
      soldListingsCount: local.soldListingsCount,
      pipelineCommissionEstimateAud: local.pipelineCommissionEstimateAud,
      inspectionsBookedCount: local.inspectionsBookedCount,
      recentlySold,
    };
  }, [publishedAgentListings, agentMetrics]);

  /** Return to Home (e.g. listing published) on Selling. Query lives on `/(tabs)?homeSegment=…` — use global params. */
  useEffect(() => {
    if (search.homeSegment !== "selling") return;
    setMode("selling");
    setBuyingSearchActive(false);
  }, [search.homeSegment, search._ts]);

  /** Deep link: results + optional `buyingQuery` (e.g. Saved Searches). */
  useEffect(() => {
    if (search.openBuyingSearch !== "results") return;
    setMode("buying");
    const raw =
      typeof search.buyingQuery === "string" ? search.buyingQuery.trim() : "";
    if (raw) {
      let decoded = raw;
      try {
        decoded = decodeURIComponent(raw);
      } catch {
        decoded = raw;
      }
      setSearchQuery(decoded);
      const trimmed = decoded.trim();
      if (trimmed.length > 0) {
        void recordBuyerExplore(trimmed);
      }
      prevBuyerSearchTrimLenRef.current = trimmed.length;
    }
    setBuyingSearchActive(true);
  }, [
    recordBuyerExplore,
    search.openBuyingSearch,
    search.buyingQuery,
    search._ts,
  ]);

  /** Clearing Explore search (non-empty → empty trimmed text) exits results → Buying hero. */
  useEffect(() => {
    if (mode !== "buying") {
      prevBuyerSearchTrimLenRef.current = searchQuery.trim().length;
      return;
    }
    if (!buyingSearchActive) {
      prevBuyerSearchTrimLenRef.current = searchQuery.trim().length;
      return;
    }

    const len = searchQuery.trim().length;
    const prevLen = prevBuyerSearchTrimLenRef.current;

    if (len === 0 && prevLen > 0) {
      setBuyingSearchActive(false);
      if (search.openBuyingSearch === "results") {
        router.replace("/(tabs)" as Href);
      }
    }

    prevBuyerSearchTrimLenRef.current = len;
  }, [mode, buyingSearchActive, searchQuery, search.openBuyingSearch, router]);

  return (
    <View style={[styles.screen, mode === "buying" && styles.screenBuying]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 8,
            /** Buying: extra inset — tab bar is `position:absolute` (~72px + margin). */
            paddingBottom: insets.bottom + (mode === "buying" ? 140 : 112),
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
              metrics={sellingPerformanceMetrics}
              soldStripPlaceholder={
                publishedAgentListings.length > 0 &&
                sellingPerformanceMetrics.recentlySold.length === 0
                  ? "Sold listings from Manage appear here."
                  : undefined
              }
              onOpenSoldSeeAll={() =>
                router.push({
                  pathname: "/recent-listings",
                  params: { mode: "sold" },
                } as Href)
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
              {mobileHome?.selling.authorityExpiringSoon.length ? (
                mobileHome.selling.authorityExpiringSoon.map((item) => (
                  <AuthorityExpiringCarouselCard
                    key={item.id}
                    address={item.address}
                    daysLeft={`${item.daysLeft}D LEFT`}
                    subtitleLine={item.title}
                    soiPill="AUTHORITY EXPIRING"
                  />
                ))
              ) : (
                <>
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
                </>
              )}
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
              {mobileHome?.selling.soiReminderListings.length ? (
                mobileHome.selling.soiReminderListings.map((item) => (
                  <ListingThumbRow
                    key={item.id}
                    imageSource={propertyImageAtIndex(
                      thumbnailIndexFromListingId(item.id),
                    )}
                    titleLine={item.titleLine}
                    subtitleLine={
                      item.needsSoi
                        ? `${item.subtitleLine} · SOI needed`
                        : item.subtitleLine
                    }
                    onPress={() =>
                      router.push({
                        pathname: "/view-live-listing" as Href,
                        params: { listingId: item.id },
                      } as Href)
                    }
                  />
                ))
              ) : (
                <>
                  <ListingThumbRow
                    imageSource={propertyImageAtIndex(2)}
                    titleLine="83A Glen Iris Road"
                    subtitleLine="Glen Iris VIC"
                    onPress={() =>
                      router.push({ pathname: "/view-live-listing" } as Href)
                    }
                  />
                  <ListingThumbRow
                    imageSource={propertyImageAtIndex(0)}
                    titleLine="312 Church Street"
                    subtitleLine="Richmond VIC"
                    onPress={() =>
                      router.push({
                        pathname: "/recent-listings",
                        params: { mode: "live" },
                      } as Href)
                    }
                  />
                  <ListingThumbRow
                    imageSource={PROPERTY_IMG_1}
                    titleLine="18 Marine Parade"
                    subtitleLine="Elwood VIC"
                    onPress={() =>
                      router.push({
                        pathname: "/recent-listings",
                        params: { mode: "live" },
                      } as Href)
                    }
                  />
                </>
              )}
            </ScrollView>
            <SectionHeader
              title="Your listings"
              style={styles.sectionHeaderBeforeListingCard}
              onSeeAll={() =>
                router.push({
                  pathname: "/recent-listings",
                  params: { mode: "live" },
                } as Href)
              }
            />
            <View style={styles.activeListingStack}>
              {mergedPipelineListings.length ? (
                mergedPipelineListings.map((l) => (
                  <ListingThumbRow
                    key={l.id}
                    imageSource={propertyImageAtIndex(
                      thumbnailIndexFromListingId(l.id),
                    )}
                    titleLine={l.title}
                    subtitleLine={activeListingSubtitle(l)}
                    onPress={() =>
                      router.push({
                        pathname: "/view-live-listing" as Href,
                        params: {
                          listingId: l.id,
                          title: l.title,
                          price: l.priceRange,
                          beds: String(l.beds),
                          baths: String(l.baths),
                        },
                      } as Href)
                    }
                  />
                ))
              ) : !mobileHome ? (
                <>
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
                </>
              ) : null}
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
                  onChangeText={handleBuyerSearchChange}
                  placeholder="Suburb or area"
                  placeholderTextColor="rgba(0, 0, 0, 0.45)"
                />
              </View>
              <AppButton
                variant="filled"
                shrink
                onPress={() => beginBuyingExplore()}
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
              <Text style={styles.resultsCount}>
                {buyerListedResultsCountLabel}
              </Text>
              <View style={styles.resultsHeaderActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Save search"
                  hitSlop={8}
                  onPress={() => {
                    void (async () => {
                      const id = await upsertBuyerSavedSearch(searchQuery, {
                        alertsOn: saveAlerts,
                        fallbackTitle: DEMO_SEARCH_SUBURB,
                      });
                      if (id)
                        Alert.alert(
                          "Search saved",
                          "Manage alerts anytime from Saved searches on Home.",
                        );
                    })();
                  }}
                >
                  <Text style={styles.saveSearchLink}>Save search</Text>
                </Pressable>
                <Text style={styles.sortLink}>SORT • NEWEST LISTED</Text>
              </View>
            </View>
            <Text style={styles.buyerListedSearchHint}>
              Search scans title, address, price range, suburb, beds, baths,
              land size, and status from your live catalogue (server
              active/pipeline listings plus anything you publish on this
              device).
            </Text>
            {buyerListedVisibleRows.length > 0 ? (
              buyerListedVisibleRows.map((m) => (
                <Fragment key={`ls-${m.id}`}>
                  <SearchMatchRow
                    ribbon="LISTED"
                    name={m.title}
                    address={m.address}
                    price={m.priceRange}
                    specs={buyerSearchSpecsCaps(m.beds, m.baths, m.landSqm)}
                    match={buyerSearchMatchPill(m.id)}
                    imageSource={propertyImageAtIndex(
                      thumbnailIndexFromListingId(m.id),
                    )}
                    onPress={() => openBuyerListedRow(m)}
                  />
                </Fragment>
              ))
            ) : mergedBuyerListedCatalog.length > 0 &&
              buyerListedSearchHasTokens ? (
              <Text style={styles.buyerListedEmptyHint}>
                Refine suburb, street, or a word from the headline — each word
                in your search must appear somewhere on the listing.
              </Text>
            ) : null}
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
                    onChangeText={handleBuyerSearchChange}
                    placeholder="Start a search"
                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                    returnKeyType="search"
                    onSubmitEditing={() => beginBuyingExplore()}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Explore listings"
                    hitSlop={8}
                    onPress={() => beginBuyingExplore()}
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
            {recentSearchesPinnedOnly ? (
              mergedBuyerSavedSearches.length ? (
                <View style={styles.recentSearchListGap}>
                  {mergedBuyerSavedSearches.slice(0, 14).map((row) => (
                    <Pressable
                      key={`pinned-${row.id}`}
                      accessibilityRole="button"
                      onPress={() => openBuyerSavedRow(row)}
                      style={({ pressed }) => [
                        styles.recentSearchBrowseRow,
                        pressed && { opacity: 0.88 },
                      ]}
                    >
                      <View style={styles.recentSearchIconCircle}>
                        <FontAwesome
                          name="star"
                          size={16}
                          color="#f59e0b"
                          style={styles.recentSearchGlyphCenter}
                        />
                      </View>
                      <View style={styles.recentSearchPinnedBody}>
                        <Text
                          style={styles.recentBrowseTitle}
                          numberOfLines={2}
                        >
                          {row.title}
                        </Text>
                        <View style={styles.recentSearchSubMetaRow}>
                          <View style={styles.recentSearchSubMetaTextWrap}>
                            <Text
                              style={[
                                styles.recentBrowseSub,
                                styles.recentBrowseSubMeta,
                              ]}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {row.criteria}
                            </Text>
                          </View>
                          <FontAwesome
                            name="chevron-right"
                            size={14}
                            color="rgba(0,0,0,0.35)"
                            style={styles.recentSearchChevronInline}
                          />
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptySavedSearchesHint}>
                  No saved searches yet. Save from Explore results or tap Save
                  on a recent search below.
                </Text>
              )
            ) : recentBuyerRows.length ? (
              <View style={styles.recentSearchListGap}>
              {recentBuyerRows.slice(0, 14).map((row) => {
                const qKey = normalizeSearchKey(row.query.trim());
                const deviceSaved = buyerDeviceSavedSearches.find(
                  (r) =>
                    normalizeSearchKey((r.suburbQuery || r.title).trim()) ===
                    qKey,
                );
                const mergedSaved = mergedBuyerSavedSearches.find(
                  (s) =>
                    normalizeSearchKey((s.suburbQuery ?? s.title).trim()) ===
                    qKey,
                );
                const isSaved = mergedSaved != null;
                const canUnsaveOnDevice = deviceSaved != null;

                return (
                  <Fragment key={`recent-${row.id}`}>
                    <View style={styles.recentSearchBrowseRow}>
                      <Pressable
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={() => beginBuyingExplore({ query: row.query })}
                        style={styles.recentSearchRowMainPress}
                      >
                        <View style={styles.recentSearchIconCircle}>
                          <FontAwesome
                            name="search"
                            size={16}
                            color="#111111"
                            style={styles.recentSearchGlyphCenter}
                          />
                        </View>
                        <View style={styles.recentSearchRowTextCol}>
                          <Text
                            style={styles.recentBrowseTitle}
                            numberOfLines={2}
                          >
                            {row.query}
                          </Text>
                          <Text
                            style={styles.recentBrowseSub}
                            numberOfLines={1}
                          >
                            {row.subtitle}
                          </Text>
                        </View>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          isSaved
                            ? `Remove ${row.query} from saved searches`
                            : `Save ${row.query}`
                        }
                        hitSlop={8}
                        style={styles.saveChipBtn}
                        onPress={() => {
                          if (isSaved) {
                            if (canUnsaveOnDevice) {
                              void removeBuyerSavedSearch(deviceSaved.id);
                            } else {
                              Alert.alert(
                                "Saved on your account",
                                "This search was saved elsewhere. Remove it from Saved searches.",
                              );
                            }
                            return;
                          }
                          void (async () => {
                            await upsertBuyerSavedSearch(row.query, {
                              alertsOn: saveAlerts,
                              fallbackTitle: row.query,
                            });
                          })();
                        }}
                      >
                        <FontAwesome
                          name={isSaved ? "star" : "star-o"}
                          size={14}
                          color={isSaved ? "#f59e0b" : "#111111"}
                          style={styles.recentSearchGlyphCenter}
                        />
                        <Text
                          style={
                            isSaved
                              ? styles.saveChipLabelSaved
                              : styles.saveChipLabel
                          }
                        >
                          {isSaved ? "Saved" : "Save"}
                        </Text>
                      </Pressable>
                    </View>
                  </Fragment>
                );
              })}
              </View>
            ) : (
              <Text style={styles.emptySavedSearchesHint}>
                No recent searches yet. Enter a suburb or keyword above and tap
                Explore to run your first scan — it will appear here next time.
              </Text>
            )}
            <View style={styles.buyingRecentAboveBriefGap} />
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
            {mergedBuyerSavedSearches.length ? (
              mergedBuyerSavedSearches.slice(0, 8).map((s) => (
                <View key={s.id}>
                  <SavedSearchCard
                    name={s.title}
                    criteria={s.criteria}
                    badge={
                      s.newCount > 0
                        ? `${Math.min(s.newCount, 99)} NEW`
                        : undefined
                    }
                    alertsOn={s.alertsOn}
                    meta={buyerSavedMetaForRow(s, buyerDeviceSavedSearches)}
                    onPress={() => openBuyerSavedRow(s)}
                  />
                  <View style={{ height: 12 }} />
                </View>
              ))
            ) : (
              <Text style={styles.emptySavedSearchesHint}>
                Save a search from Explore (Buying) results to see it here.
              </Text>
            )}
            {buyingSavedFeatured != null ? (
              <>
                <SectionHeader
                  title="Saved properties"
                  style={styles.sectionHeaderBeforeListingCard}
                  onSeeAll={() => router.push("/saved-properties" as Href)}
                />
                <Pressable
                  key={buyingSavedFeatured.id}
                  onPress={() => {
                    const item = buyingSavedFeatured;
                    if (item.id.startsWith("omm-")) {
                      router.push({
                        pathname: "/view-live-listing" as Href,
                        params: { listingId: item.id },
                      } as Href);
                      return;
                    }
                    router.push({
                      pathname: "/view-live-listing",
                      params: {
                        street: item.street,
                        suburb: item.suburb,
                        price: item.price,
                        beds: String(item.bedrooms),
                        baths: String(item.bathrooms),
                        cars: String(item.carSpaces),
                        imageIndex: String(item.imageIndex),
                      },
                    } as Href);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Open saved listing ${buyingSavedFeatured.title}`}
                >
                  <LargeListingCard
                    title={buyingSavedFeatured.title}
                    price={buyingSavedFeatured.price}
                    specLine={buyingSavedFeatured.specLine}
                    badgeLeft={buyingSavedFeatured.badgeLeft}
                    badgeRight={buyingSavedFeatured.badgeRight}
                    footerLabels={buyingSavedFeatured.footerLabels}
                    imageSource={propertyImageAtIndex(
                      buyingSavedFeatured.imageIndex,
                    )}
                  />
                </Pressable>
              </>
            ) : null}
            <SectionHeader
              title="Recently Listed"
              style={styles.sectionHeaderBeforeListingCard}
              onSeeAll={() =>
                router.push({
                  pathname: "/recent-listings",
                  params: { mode: "listed" },
                } as Href)
              }
            />
            {mergedOffMarketListed.length ? (
              <>
                {mergedOffMarketListed.slice(0, 1).map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() =>
                      router.push({
                        pathname: "/view-live-listing" as Href,
                        params: {
                          listingId: m.id,
                          title: m.title,
                          price: m.priceRange,
                          beds: String(m.beds),
                          baths: String(m.baths),
                        },
                      } as Href)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Open listing ${m.title}`}
                  >
                    <LargeListingCard
                      variant="buying"
                      imageSource={propertyImageAtIndex(
                        thumbnailIndexFromListingId(m.id),
                      )}
                      title={m.title}
                      price={m.priceRange}
                      badgeLeft={m.status}
                      badgeRight={`${Math.min(99, Math.max(0, m.matchPercent))}% MATCH`}
                      specParts={[
                        `${m.beds} bedrooms`,
                        `${m.baths} bathrooms`,
                        `${m.landSqm}m²`,
                      ]}
                    />
                  </Pressable>
                ))}
                {mergedOffMarketListed.length > 1 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.hScroll}
                  >
                    {mergedOffMarketListed.slice(1, 10).map((m) => (
                      <View
                        key={`om-${m.id}`}
                        style={{ marginRight: 12, width: 280 }}
                      >
                        <Pressable
                          onPress={() =>
                            router.push({
                              pathname: "/view-live-listing" as Href,
                              params: {
                                listingId: m.id,
                                title: m.title,
                                price: m.priceRange,
                              },
                            } as Href)
                          }
                        >
                          <ListingThumbRow
                            imageSource={propertyImageAtIndex(
                              thumbnailIndexFromListingId(m.id),
                            )}
                            titleLine={m.title}
                            subtitleLine={`${m.priceRange} · ${m.status}`}
                          />
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                ) : null}
              </>
            ) : (
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
            )}
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
  soldStripPlaceholder: {
    marginHorizontal: 4,
    paddingVertical: 20,
    paddingHorizontal: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.46)",
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
  kpiPipelineSection: {
    paddingTop: 12,
    marginTop: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(17,17,17,0.08)",
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
  /** Space between Recent searches list and Buyer Brief card (avoid visual overlap). */
  buyingRecentAboveBriefGap: {
    height: 32,
  },
  recentSearchToggle: { flexDirection: "row", alignItems: "center", gap: 8 },
  /** Reliable vertical rhythm between Recent search cards (`gap` vs row marginBottom). */
  recentSearchListGap: {
    alignSelf: "stretch",
    gap: 24,
  },
  recentSearchBrowseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignSelf: "stretch",
    flexWrap: "nowrap",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(17,17,17,0.08)",
  },
  /** Leading icon + title column — fills space between circle and trailing controls. */
  recentSearchRowMainPress: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    minWidth: 0,
  },
  recentSearchRowTextCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: "flex-start",
  },
  /** Saved-search rows: title stack + subtitle row with trailing chevron. */
  recentSearchPinnedBody: {
    flex: 1,
    minWidth: 0,
    justifyContent: "flex-start",
    /** Breath above title vs star circle (avoid visually sitting “under” icon). */
    paddingTop: 2,
  },
  recentSearchSubMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    minWidth: 0,
  },
  recentSearchSubMetaTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  recentBrowseSubMeta: {
    marginTop: 0,
  },
  recentSearchChevronInline: {
    flexShrink: 0,
    marginLeft: 4,
    textAlign: "center",
    includeFontPadding: false,
    lineHeight: 14,
  },
  recentSearchIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(17,17,17,0.07)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: 14,
    overflow: "hidden",
  },
  /** FontAwesome renders as text glyphs — stabilizes optical center in circles. */
  recentSearchGlyphCenter: {
    textAlign: "center",
    includeFontPadding: false,
    lineHeight: 18,
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
  saveChipBtn: {
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 4,
    minWidth: 44,
  },
  saveChipLabel: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.55)",
    letterSpacing: 0.2,
  },
  saveChipLabelSaved: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: "#f59e0b",
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
  savedCardHitBox: {
    alignSelf: "stretch",
  },
  savedCardChrome: {
    alignSelf: "stretch",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: SAVED_SEARCH_HOME_BORDER,
    paddingVertical: 16,
    paddingHorizontal: 18,
    /* Light lift so borders differ from frost page BG */
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
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
    flexWrap: "wrap",
    rowGap: 8,
    columnGap: 12,
  },
  resultsHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
    flexShrink: 0,
  },
  saveSearchLink: {
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    color: slateNavy,
    letterSpacing: 0.3,
    textDecorationLine: "underline",
  },
  emptySavedSearchesHint: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.45)",
    lineHeight: 20,
    marginBottom: 4,
  },
  buyerListedSearchHint: {
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.45)",
    lineHeight: 17,
    marginBottom: 16,
    marginTop: -4,
  },
  buyerListedEmptyHint: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.45)",
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 8,
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
  /** Buying search hits — ~40% image column, ~60% text column (design reference). */
  matchRow: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "visible",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.1)",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  matchThumbColumn: {
    flex: 2,
    minHeight: 128,
    position: "relative",
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  matchThumbImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  matchRibbon: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#111111",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    maxWidth: "92%",
  },
  matchRibbonText: {
    fontSize: 8,
    fontFamily: "Satoshi-Medium",
    color: "#ffffff",
    letterSpacing: 0.35,
  },
  matchScorePill: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#111111",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
    maxWidth: "92%",
  },
  matchScorePillText: {
    fontSize: 9,
    fontFamily: "Satoshi-Medium",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  matchTextColumn: {
    flex: 3,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "center",
    minHeight: 128,
  },
  matchTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
  },
  matchAddress: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.52)",
    marginTop: 6,
    lineHeight: 18,
  },
  matchPriceLine: {
    fontSize: 17,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    marginTop: 10,
    lineHeight: 22,
  },
  matchSpecsCaps: {
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.45)",
    marginTop: 8,
    lineHeight: 14,
    letterSpacing: 0.45,
    textTransform: "uppercase" as const,
  },
});
