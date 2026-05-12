import { Text } from "@/components/OMMText";
import { TextInput } from "@/components/OMMTextInput";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useGlobalSearchParams, useLocalSearchParams, useRouter, type Href } from "expo-router";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ComponentProps,
} from "react";
import {
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

import { layout } from "@/constants/theme";
import { AppButton } from "@/components/AppButton";
import { CompactListingCard } from "@/components/CompactListingCard";
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
import { VIEW_LIVE_LISTING_ID } from "@/lib/saved-listings";
import { useSavedListings } from "@/lib/saved-listings-context";

import {
    DEMO_AGENT_HOME_METRICS,
    loadAgentHomeMetrics,
    type AgentHomeMetrics,
    type RecentSoldDemoItem,
} from "@/lib/agent-home-metrics";
import { AGENT_QUICK_LINK_FLAGS } from "@/lib/agent-quick-links";
import { useTabBarOnScroll } from "@/lib/tab-bar-visibility";
import { dashedShell } from "./add/_shared";

function AgentHomeKpis({ metrics }: { metrics: AgentHomeMetrics }) {
  return (
    <View
      style={styles.kpiWrap}
      accessibilityHint="Demonstration metrics on this build"
    >
      <View style={styles.kpiRow}>
        <View style={styles.kpiTile}>
          <Text style={styles.kpiLabel}>Pending listings</Text>
          <Text style={styles.kpiValue}>{metrics.pendingListingsCount}</Text>
          <Text style={styles.kpiHint}>Active authority</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={[styles.kpiTile, styles.kpiTileGrow]}>
          <Text style={styles.kpiLabel}>Pipeline fee estimate</Text>
          <Text style={styles.kpiValue}>{metrics.pipelineEstimateDisplay}</Text>
          <Text style={styles.kpiHint}>Indicative · GST excluded</Text>
        </View>
      </View>
    </View>
  );
}

function RecentlySoldCard({ item }: { item: RecentSoldDemoItem }) {
  return (
    <View style={styles.soldStripCard}>
      <Text style={styles.soldStripPrice}>{item.priceDisplay}</Text>
      <Text style={styles.soldStripTitle} numberOfLines={2}>
        {item.headline}
      </Text>
      <Text style={styles.soldStripMeta} numberOfLines={1}>
        {item.meta}
      </Text>
    </View>
  );
}

function QuickLinksRow({ router }: { router: ReturnType<typeof useRouter> }) {
  type FaName = ComponentProps<typeof FontAwesome>["name"];
  type LinkDef = { key: string; label: string; icon: FaName; href: Href };
  const links: LinkDef[] = [];
  if (AGENT_QUICK_LINK_FLAGS.inspections) {
    links.push({
      key: "inspections",
      label: "Inspections",
      icon: "calendar-o",
      href: "/stats?filter=inspections" as Href,
    });
  }
  if (AGENT_QUICK_LINK_FLAGS.enquiries) {
    links.push({
      key: "enquiries",
      label: "Enquiries",
      icon: "comment-o",
      href: "/messages" as Href,
    });
  }
  if (AGENT_QUICK_LINK_FLAGS.drafts) {
    links.push({
      key: "drafts",
      label: "Drafts",
      icon: "file-text-o",
      href: "/list?segment=draft" as Href,
    });
  }

  if (links.length === 0) return null;

  return (
    <View style={styles.quickLinksWrap}>
      <Text style={styles.quickLinksSectionTitle}>Quick links</Text>
      <View style={styles.quickLinksRow}>
        {links.map((link) => (
          <Pressable
            key={link.key}
            accessibilityRole="button"
            accessibilityLabel={`Open ${link.label}`}
            onPress={() => router.push(link.href)}
            style={({ pressed }) => [
              styles.quickLinkTile,
              pressed && { opacity: 0.88 },
            ]}
          >
            <View style={styles.quickLinkIconCircle}>
              <FontAwesome name={link.icon} size={20} color="#111111" />
            </View>
            <Text style={styles.quickLinkLabel}>{link.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

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

/** Map saved-listing `beds` copy e.g. `3 BED  2 BATH  2 CAR` → numeric chips. */
function parseBedsLineToCounts(line: string) {
  const mBed = /(\d+)\s*BED/i.exec(line);
  const mBath = /(\d+)\s*BATH/i.exec(line);
  const mCar = /(\d+)\s*CAR/i.exec(line);
  return {
    beds: mBed ? Number(mBed[1]) : 3,
    baths: mBath ? Number(mBath[1]) : 2,
    cars: mCar ? Number(mCar[1]) : 2,
  };
}

function navigateSellingListingSearch(
  router: ReturnType<typeof useRouter>,
  query: string,
) {
  const q = query.trim();
  router.push((q ? `/list?q=${encodeURIComponent(q)}` : `/list`) as Href);
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
  const homeRouteParams = useLocalSearchParams<{
    homeMode?: string;
  }>();
  const [mode, setMode] = useState<"selling" | "buying">("selling");
  const [buyingSearchActive, setBuyingSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState(DEMO_SEARCH_SUBURB);
  const buyingSearchRef = useRef<RNTextInput>(null);
  const [sellingSearchQuery, setSellingSearchQuery] = useState("");
  const sellingSearchRef = useRef<RNTextInput>(null);
  const [recentSearchesPinnedOnly, setRecentSearchesPinnedOnly] =
    useState(false);
  const [saveAlerts, setSaveAlerts] = useState(false);
  const { listings: savedProperties } = useSavedListings();
  const [agentMetrics, setAgentMetrics] = useState<AgentHomeMetrics>(
    DEMO_AGENT_HOME_METRICS,
  );
  const { onScroll } = useTabBarOnScroll();

  const commitHomeMode = useCallback(
    (next: "selling" | "buying") => {
      setMode(next);
      router.setParams(
        next === "selling"
          ? { homeMode: "selling", homeSegment: "selling" }
          : { homeMode: "buying" },
      );
    },
    [router],
  );

  /** Agent home KPI + sold preview: demo until `GET /agent/home-metrics` is live and Legal signs off on labels. */
  useEffect(() => {
    let alive = true;
    loadAgentHomeMetrics()
      .then((m) => {
        if (alive) setAgentMetrics(m);
      })
      .catch(() => {
        if (alive) setAgentMetrics(DEMO_AGENT_HOME_METRICS);
      });
    return () => {
      alive = false;
    };
  }, []);

  /** Keep deep links and segment control in sync with route query (`?homeMode=`). */
  useEffect(() => {
    const m = homeRouteParams.homeMode;
    if (m === "buying") setMode("buying");
    if (m === "selling") setMode("selling");
  }, [homeRouteParams.homeMode]);

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
      <View
        style={[
          styles.homeHeaderShell,
          mode === "buying" && styles.homeHeaderShellBuying,
          { paddingTop: insets.top + 8 },
        ]}
      >
        <View style={styles.homeHeaderInner}>
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
                setBuyingSearchActive(false);
                commitHomeMode("selling");
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
              onPress={() => commitHomeMode("buying")}
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
              <View
                style={styles.searchRow}
                accessibilityHint="Search your listings and pipeline"
              >
                <View style={styles.searchField}>
                  <FontAwesome name="search" size={16} color="#000000" />
                  <TextInput
                    ref={sellingSearchRef}
                    style={styles.searchInput}
                    value={sellingSearchQuery}
                    onChangeText={setSellingSearchQuery}
                    placeholder="Search listings, suburb or address"
                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                    onSubmitEditing={() =>
                      navigateSellingListingSearch(router, sellingSearchQuery)
                    }
                    accessibilityLabel="Search listings"
                  />
                </View>
                <AppButton
                  variant="filled"
                  shrink
                  onPress={() =>
                    navigateSellingListingSearch(router, sellingSearchQuery)
                  }
                  textStyle={styles.exploreBtnLabel}
                  style={styles.exploreBtnWrap}
                >
                  SEARCH
                </AppButton>
              </View>
            </>
          ) : null}
        </View>
      </View>

      <ScrollView
        style={styles.homeScrollFlex}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 12,
            paddingBottom: insets.bottom + 112,
          },
        ]}
      >
        {mode === "selling" ? (
          <>
            <NotificationsRow
              onPress={() => router.push("/notifications" as Href)}
            />
            <View style={{ height: 14 }} />
            <QuickLinksRow router={router} />
            <View style={{ height: 14 }} />
            <AgentHomeKpis metrics={agentMetrics} />
            <View style={{ height: 6 }} />
            <SectionHeader
              title="Recently sold"
              onSeeAll={() => router.push("/view-performance" as Href)}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.soldStripScroll}
            >
              {agentMetrics.recentlySold.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Recently sold ${item.headline}`}
                  onPress={() => router.push("/view-performance" as Href)}
                >
                  <RecentlySoldCard item={item} />
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.soldStripFoot}>
              Demonstration results — wire to CRM / settlement data when ready.
            </Text>
            <View style={{ height: 16 }} />
            <HeroCTA
              kicker="NEW LISTING"
              title="Publish a property"
              subtitle="Auto-fill from PriceFinder • SOI in 5 steps"
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
              <CompactListingCard
                layout="carousel"
                imageSource={propertyImageAtIndex(2)}
                title="83A Glen Iris Road"
                suburb="Glen Iris VIC"
                price="$2.05M — $2.35M"
                beds={3}
                baths={2}
                cars={1}
                badgeLeft="ACTIVE"
                badgeRight="SOI 14d"
                onPress={() => router.push("/view-live-listing" as Href)}
              />
              <CompactListingCard
                layout="carousel"
                imageSource={propertyImageAtIndex(0)}
                title="312 Church Street"
                suburb="Richmond VIC"
                price="$1.85M — $2.1M"
                beds={4}
                baths={3}
                cars={2}
                badgeLeft="LIVE"
                onPress={() => router.push("/recent-listings" as Href)}
              />
              <CompactListingCard
                layout="carousel"
                imageSource={PROPERTY_IMG_1}
                title="18 Marine Parade"
                suburb="Elwood VIC"
                price="$2.95M — $3.2M"
                beds={5}
                baths={3}
                cars={2}
                badgeRight="UNDER OFFER"
                onPress={() => router.push("/recent-listings" as Href)}
              />
            </ScrollView>
            <SectionHeader
              title="Your active listings"
              style={styles.sectionHeaderBeforeListingCard}
              onSeeAll={() => router.push("/recent-listings" as Href)}
            />
            <View style={styles.activeListingStack}>
              <CompactListingCard
                imageSource={PROPERTY_IMG_1}
                title={DEMO_PRIMARY_LISTING_TITLE}
                suburb="Brighton East VIC"
                price="$2.0M — $2.2M"
                beds={4}
                baths={3}
                cars={2}
                badgeLeft="ACTIVE"
                badgeRight="AUTH 14D"
                onPress={() => router.push("/view-live-listing" as Href)}
              />
              <CompactListingCard
                imageSource={PROPERTY_IMG_2}
                title="Carlton Warehouse Conversion"
                suburb="Carlton VIC"
                price="$1.6M — $1.75M"
                beds={3}
                baths={2}
                cars={1}
                badgeLeft="4 LEADS"
                badgeRight="SOI OK"
                onPress={() => router.push("/list" as Href)}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open listing insights"
                onPress={() => router.push("/list" as Href)}
                style={({ pressed }) => [
                  styles.dashboardHint,
                  pressed && { opacity: 0.92 },
                ]}
              >
                <Text style={styles.dashboardHintText}>
                  Open dashboard for metrics & drafts
                </Text>
                <FontAwesome
                  name="arrow-right"
                  size={12}
                  color="rgba(17,17,17,0.45)"
                />
              </Pressable>
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
              specs="4 BED · 3 BATH · 720M²"
              match="92% MATCH"
              imageSource={propertyImageAtIndex(0)}
            />
            <View style={styles.resultDivider} />
            <SearchMatchRow
              name="Sandringham Bay House"
              address="72 Bay Rd, Sandringham VIC 3191"
              price="$1.9M — $2.2M"
              specs="3 BED · 2 BATH · 420M²"
              match="88% MATCH"
              imageSource={propertyImageAtIndex(1)}
            />
            <View style={styles.resultDivider} />
            <SearchMatchRow
              name="Collingwood Workshop"
              address="201 Smith St, Collingwood VIC 3066"
              price="$1.6M — $1.85M"
              specs="3 BED · 2 BATH · 310M²"
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
                imageStyle={styles.buyingHeroImgFlat}
              >
                <View style={styles.buyingHeroDim} pointerEvents="none" />
                <View style={styles.buyingHeroSearchOverlay}>
                  <View style={styles.buyingHeroSearchBar}>
                    <FontAwesome
                      name="search"
                      size={16}
                      color="#000000"
                      style={styles.buyingHeroSearchIcon}
                    />
                    <TextInput
                      ref={buyingSearchRef}
                      style={[styles.searchInput, styles.buyingHeroSearchInput]}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Suburb or area"
                      placeholderTextColor="rgba(0, 0, 0, 0.45)"
                      returnKeyType="search"
                      onSubmitEditing={() => setBuyingSearchActive(true)}
                    />
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
                </View>
              </ImageBackground>
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
              subtitle="Match listing agents within 24 hours"
              onPress={() => router.push("/post-buyer-brief" as Href)}
            />
            <View style={[styles.sellerNetworkCard, dashedShell]}>
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
              criteria="4+ beds • House • $1.8M—2.4M"
              badge="8 NEW"
              alertsOn
              meta="Yesterday"
            />
            <View style={{ height: 12 }} />
            <SavedSearchCard
              name="Footscray & Seddon"
              criteria="3+ beds • Townhouse • $2M—3M"
              badge="2 NEW"
              alertsOn={false}
              meta="Paused 2d ago"
            />
            {savedProperties.length > 0 ? (
              <>
                <SectionHeader
                  title="Saved properties"
                  style={styles.sectionHeaderBeforeListingCard}
                />
                {savedProperties.map((item) => {
                  const spec = parseBedsLineToCounts(item.beds);
                  return (
                    <CompactListingCard
                      key={item.id}
                      imageSource={propertyImageAtIndex(item.imageIndex)}
                      title={item.title}
                      suburb={
                        item.id === VIEW_LIVE_LISTING_ID
                          ? "Brighton East VIC"
                          : "Melbourne VIC"
                      }
                      price={item.price}
                      beds={spec.beds}
                      baths={spec.baths}
                      cars={spec.cars}
                      badgeLeft={item.badgeLeft}
                      badgeRight={item.badgeRight}
                      onPress={
                        item.id === VIEW_LIVE_LISTING_ID
                          ? () => router.push("/view-live-listing" as Href)
                          : undefined
                      }
                    />
                  );
                })}
              </>
            ) : null}
            <SectionHeader
              title="Recently Listed"
              style={styles.sectionHeaderBeforeListingCard}
              onSeeAll={() => router.push("/recent-listings" as Href)}
            />
            <CompactListingCard
              imageSource={PROPERTY_IMG_2}
              title={DEMO_PRIMARY_LISTING_TITLE}
              suburb="Brighton East VIC"
              price="$2.0M — $2.2M"
              beds={4}
              baths={3}
              cars={2}
              badgeLeft="OFF-MARKET"
              badgeRight="92% MATCH"
              onPress={() => router.push("/view-live-listing" as Href)}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  /** Buying tab: subtle grouped background so listing cards read like App Store tiles */
  screenBuying: { backgroundColor: "#f5f5f7" },
  scrollContent: { paddingHorizontal: layout.screenGutter },
  homeHeaderShell: {
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  homeHeaderShellBuying: {
    backgroundColor: "#f5f5f7",
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  homeHeaderInner: {
    paddingHorizontal: layout.screenGutter,
    paddingBottom: 4,
  },
  homeScrollFlex: { flex: 1 },
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
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 11,
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
  quickLinksWrap: { marginBottom: 2 },
  quickLinksSectionTitle: {
    fontSize: 18,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
    marginBottom: 12,
  },
  quickLinksRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  quickLinkTile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(17,17,17,0.08)",
    minWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickLinkIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(17,17,17,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickLinkLabel: {
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
    textAlign: "center",
  },
  kpiWrap: { marginBottom: 4 },
  kpiRow: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  kpiTile: { flex: 1, justifyContent: "center" },
  kpiTileGrow: { flex: 1.25 },
  kpiDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(17,17,17,0.12)",
    marginHorizontal: 10,
  },
  kpiLabel: {
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.5)",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 24,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
    letterSpacing: -0.5,
  },
  kpiHint: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.42)",
  },
  soldStripScroll: { gap: 10, paddingBottom: 6 },
  soldStripCard: {
    width: 158,
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(17,17,17,0.08)",
    minHeight: 108,
    justifyContent: "flex-end",
  },
  soldStripPrice: {
    fontSize: 18,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  soldStripTitle: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "#111111",
    lineHeight: 18,
    marginBottom: 4,
  },
  soldStripMeta: {
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.45)",
  },
  soldStripFoot: {
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    color: "rgba(17,17,17,0.42)",
    marginTop: 8,
    lineHeight: 16,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
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
  /** Space before compact listing card blocks (Buying + Selling) */
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
  hScrollDense: { gap: 12, paddingBottom: 10, paddingRight: 12 },
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
    backgroundColor: "#000000",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  sellerNetworkCtaText: {
    color: "#fff",
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
    marginHorizontal: -layout.screenGutter,
    marginBottom: 16,
    overflow: "hidden",
    borderRadius: 0,
  },
  buyingHeroBg: { height: 168, justifyContent: "flex-end" },
  /** Full-width rectangle — no capsule / “pill” mask on the photo */
  buyingHeroImgFlat: { borderRadius: 0 },
  buyingHeroDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20,26,38,0.2)",
  },
  buyingHeroSearchOverlay: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  buyingHeroSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    minHeight: 50,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  buyingHeroSearchIcon: { marginRight: 4 },
  buyingHeroSearchInput: {
    flex: 1,
    marginLeft: 0,
    paddingVertical: 6,
    fontSize: 15,
    minWidth: 0,
  },
  recentSearchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 0,
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
    backgroundColor: "#000000",
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
    backgroundColor: "#000000",
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
    backgroundColor: "#000000",
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
    backgroundColor: "#000000",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  matchTagText: { fontSize: 8, fontFamily: "Satoshi-Medium", color: "#fff" },
  matchPct: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "#000000",
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
