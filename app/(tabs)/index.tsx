import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { Fragment, useEffect, useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Image, Pressable, ScrollView, StyleSheet, Switch, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type Href, useGlobalSearchParams, useRouter } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { HeaderToggle } from '@/components/HeaderToggle';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useScrollEdgeReveal } from '@/lib/scrollEdge';
import {
  DEMO_PRIMARY_LISTING_TITLE,
  DEMO_PRIMARY_LOCALITY_LINE,
  DEMO_SEARCH_SUBURB,
} from '@/lib/melbourne-demo-locations';
import { HERO_PROPERTY_IMG, PROPERTY_IMG_1, PROPERTY_IMG_2, propertyImageAtIndex } from '@/lib/propertyImages';
import { useTabScreenBottomPad } from '@/lib/useTabScreenBottomPad';
import { useScreenHorizontalPadding } from '@/lib/useScreenHorizontalPadding';
import { enteringCrossfade } from '@/lib/motion';

const dashedPromoShell = {
  borderWidth: 1.5,
  borderColor: 'rgba(0, 0, 0, 0.55)',
  borderStyle: 'dashed' as const,
  backgroundColor: '#fff',
};

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

function AlertRow({
  icon,
  text,
  onPress,
  onDismiss,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  text: string;
  onPress?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <Pressable style={styles.alertCard} accessibilityRole="button" onPress={onPress}>
      <FontAwesome name={icon} size={18} color="#000000" style={styles.alertIcon} />
      <Text style={styles.alertText}>{text}</Text>
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert"
          style={({ pressed }) => [styles.alertDismiss, pressed && { opacity: 0.5 }]}>
          <FontAwesome name="times" size={13} color="rgba(0, 0, 0, 0.45)" />
        </Pressable>
      ) : null}
      <FontAwesome name="chevron-right" size={12} color="rgba(0, 0, 0, 0.4)" style={styles.alertChevron} />
    </Pressable>
  );
}

type Alert = {
  id: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  text: string;
};

function AlertsBanner({
  alerts,
  collapsed,
  onToggleCollapsed,
  onClearAll,
  onDismiss,
}: {
  alerts: Alert[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onClearAll: () => void;
  onDismiss: (id: string) => void;
}) {
  if (alerts.length === 0) return null;
  return (
    <View style={styles.alertsBanner}>
      <View style={styles.alertsBannerHead}>
        <Pressable
          onPress={onToggleCollapsed}
          accessibilityRole="button"
          accessibilityLabel={collapsed ? 'Expand alerts' : 'Collapse alerts'}
          style={({ pressed }) => [styles.alertsHeadHit, pressed && { opacity: 0.5 }]}>
          <Text style={styles.alertsKicker}>
            {alerts.length} ALERT{alerts.length === 1 ? '' : 'S'}
          </Text>
          <FontAwesome
            name={collapsed ? 'chevron-down' : 'chevron-up'}
            size={11}
            color="rgba(0, 0, 0, 0.55)"
            style={styles.alertsHeadChev}
          />
        </Pressable>
        <Pressable
          onPress={onClearAll}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear all alerts"
          style={({ pressed }) => [styles.alertsClear, pressed && { opacity: 0.5 }]}>
          <Text style={styles.alertsClearText}>Clear all</Text>
        </Pressable>
      </View>
      {!collapsed ? (
        <View style={styles.alertsBannerBody}>
          {alerts.map((alert, i) => (
            <View key={alert.id} style={i > 0 ? { marginTop: 10 } : undefined}>
              <AlertRow
                icon={alert.icon}
                text={alert.text}
                onDismiss={() => onDismiss(alert.id)}
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function HeroCTA({
  kicker,
  title,
  subtitle,
  onPress,
  imageSource = HERO_PROPERTY_IMG,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  imageSource?: ImageSourcePropType;
}) {
  return (
    <Pressable style={styles.hero} accessibilityRole="button" onPress={onPress}>
      <Image source={imageSource} style={styles.heroImage} resizeMode="cover" />
      {/* Bottom contrast bed — keeps copy legible regardless of image content. */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.05)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Soft right-edge fade so the FAB sits on a brighter patch of the property. */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.heroBody}>
        <View style={styles.heroTextCol}>
          <Text style={styles.heroKicker}>{kicker}</Text>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSub}>{subtitle}</Text>
        </View>
        <View style={styles.heroFab}>
          <FontAwesome name="plus" size={22} color="#000000" />
        </View>
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
      <Text style={styles.enqName}>{name}</Text>
      <Text style={styles.enqTime}>{time}</Text>
      <Text style={styles.enqAddr}>{address}</Text>
      <View style={styles.enqPill}>
        <Text style={styles.enqPillText}>{tag}</Text>
      </View>
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

/** Selling: stats footer. Buying: [Figma 1053:1680](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-1680) — 168px image, pills, spec chips row. */
function LargeListingCard(
  props:
    | {
        variant?: 'selling';
        imageSource?: ImageSourcePropType;
        title: string;
        localityLine?: string;
        price: string;
        beds: string;
        badgeLeft: string;
        badgeRight: string;
        footerLabels: [string, string, string];
      }
    | {
        variant: 'buying';
        imageSource?: ImageSourcePropType;
        title: string;
        localityLine?: string;
        price: string;
        badgeLeft: string;
        badgeRight: string;
        specParts: [string, string, string];
      },
) {
  const isBuying = props.variant === 'buying';
  const heroSource = props.imageSource ?? (isBuying ? PROPERTY_IMG_2 : PROPERTY_IMG_1);
  return (
    <View style={[styles.largeCard, isBuying && styles.largeCardBuying]}>
      <View style={[styles.largeImgWrap, isBuying && styles.largeImgWrapBuying]}>
        <Image source={heroSource} style={styles.largeImg} resizeMode="cover" />
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.02)', 'rgba(0,0,0,0.38)']}
          locations={[0, 0.55, 1]}
          style={styles.largeImgLuxScrim}
        />
        <View style={[styles.badgeLeft, isBuying && styles.badgeLeftBuying]}>
          <Text style={styles.badgeLeftText}>{props.badgeLeft}</Text>
        </View>
        <View style={[styles.badgeRight, isBuying && styles.badgeRightBuying]}>
          <Text style={[styles.badgeRightText, isBuying && styles.badgeRightTextBuying]}>{props.badgeRight}</Text>
        </View>
      </View>
      <View style={styles.largeBody}>
        <Text style={[styles.propTitle, isBuying && styles.propTitleBuying]}>{props.title}</Text>
        {props.localityLine ? <Text style={styles.propLocality}>{props.localityLine}</Text> : null}
        <Text style={[styles.propPrice, isBuying && styles.propPriceBuying]}>{props.price}</Text>
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
            <Text style={styles.propSpecs}>{props.beds}</Text>
            <View style={styles.propStatsRow}>
              {props.footerLabels.map((l) => (
                <Text key={l} style={styles.propStat}>
                  {l}
                </Text>
              ))}
            </View>
          </>
        )}
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
          ● {alertsOn ? 'ALERTS ON' : 'ALERTS OFF'}
        </Text>
        <Text style={styles.savedMeta}>{meta}</Text>
      </View>
    </View>
  );
}

function AgentReplyCard({ name, agency, snippet }: { name: string; agency: string; snippet: string }) {
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
        <Image source={imageSource} style={styles.matchThumb} resizeMode="cover" />
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

/** Home — OMM [Figma area](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-1046&t=gEfFuYKIwBHVUzXh-4) */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const bottomPad = useTabScreenBottomPad();
  const hPad = useScreenHorizontalPadding();
  const router = useRouter();
  const search = useGlobalSearchParams<{ openBuyingSearch?: string; homeSegment?: string; _ts?: string }>();
  const [mode, setMode] = useState<'selling' | 'buying'>('selling');
  const [buyingSearchActive, setBuyingSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState(DEMO_SEARCH_SUBURB);
  const [saveAlerts, setSaveAlerts] = useState(false);

  const sellingAlertsAll: Alert[] = [
    { id: 'sell-enquiries', icon: 'bullhorn', text: '3 new enquiries' },
    { id: 'sell-reviews', icon: 'star', text: '2 transactions awaiting review' },
  ];
  const buyingAlertsAll: Alert[] = [
    { id: 'buy-replies', icon: 'bolt', text: '2 new agent replies' },
    { id: 'buy-reviews', icon: 'star', text: '1 transaction awaiting review' },
  ];
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [alertsCollapsed, setAlertsCollapsed] = useState<{ selling: boolean; buying: boolean }>({
    selling: false,
    buying: false,
  });
  const dismissAlert = (id: string) =>
    setDismissedAlerts((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  const clearAllAlerts = (ids: string[]) =>
    setDismissedAlerts((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  const sellingAlerts = sellingAlertsAll.filter((a) => !dismissedAlerts.has(a.id));
  const buyingAlerts = buyingAlertsAll.filter((a) => !dismissedAlerts.has(a.id));
  const scrollEdge = useScrollEdgeReveal({ threshold: 120 });

  /** Return to Home (e.g. listing published) on Selling. Query lives on `/(tabs)?homeSegment=…` — use global params. */
  useEffect(() => {
    if (search.homeSegment !== 'selling') return;
    setMode('selling');
    setBuyingSearchActive(false);
  }, [search.homeSegment, search._ts]);

  /** Deep link: `?openBuyingSearch=results` (e.g. from Saved Searches → NEW SEARCH). */
  useEffect(() => {
    if (search.openBuyingSearch !== 'results') return;
    setMode('buying');
    setBuyingSearchActive(true);
  }, [search.openBuyingSearch, search._ts]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollFill}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollEdge.onScroll}
        scrollEventThrottle={scrollEdge.scrollEventThrottle}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: bottomPad + 12,
          },
        ]}>
        <View style={styles.stickyHeaderWrap}>
          <View style={[styles.stickyHeaderInner, { paddingTop: insets.top }]}>
            <View style={[styles.homeHeadBlock, hPad]}>
              <ScreenHeader title="Home" />
            </View>
          </View>
        </View>

        <View style={[styles.modeToggleRow, hPad]}>
          <HeaderToggle
            items={[
              { key: 'selling', label: 'Selling' },
              { key: 'buying', label: 'Buying' },
            ]}
            value={mode}
            onChange={(next) => {
              setMode(next);
              if (next === 'selling') setBuyingSearchActive(false);
            }}
            align="center"
            accessibilityLabel="Selling or buying mode"
          />
        </View>

        <Animated.View
          key={`${mode}-${buyingSearchActive}`}
          entering={enteringCrossfade()}
          style={hPad}>
        {mode === 'selling' ? (
          <>
            <AlertsBanner
              alerts={sellingAlerts}
              collapsed={alertsCollapsed.selling}
              onToggleCollapsed={() =>
                setAlertsCollapsed((prev) => ({ ...prev, selling: !prev.selling }))
              }
              onClearAll={() => clearAllAlerts(sellingAlertsAll.map((a) => a.id))}
              onDismiss={dismissAlert}
            />
            {sellingAlerts.length > 0 ? <View style={{ height: 20 }} /> : null}
            <HeroCTA
              kicker="NEW LISTING"
              title="Publish a property"
              subtitle="Statement of Information · PriceFinder sync · five guided steps"
              onPress={() => router.push('/add' as Href)}
            />
            <SectionHeader title="Latest enquiries" onSeeAll={() => router.push('/messages' as Href)} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              <Pressable onPress={() => router.push('/messages' as Href)} accessibilityRole="button">
                <EnquiryCard
                  name="John Doe"
                  time="2H AGO"
                  address="12 Lynch Cres, Hawthorn VIC 3122"
                  tag="RE: CAMBERWELL CORRIDOR"
                />
              </Pressable>
              <Pressable onPress={() => router.push('/messages' as Href)} accessibilityRole="button">
                <EnquiryCard
                  name="Anita Wong"
                  time="5H AGO"
                  address="48 Prospect Hill Rd, Camberwell VIC 3124"
                  tag="RE: INNER EAST · BOROONDARA"
                />
              </Pressable>
            </ScrollView>
            <SectionHeader
              title="Authority expiring"
              onSeeAll={() => router.push('/authority-expiring' as Href)}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              <AuthorityExpiringCarouselCard
                address="24 Riversdale Rd, Hawthorn VIC 3122"
                daysLeft="6D LEFT"
                subtitleLine="Riversdale Victorian"
                soiPill="SOI ATTACHED"
              />
              <AuthorityExpiringCarouselCard
                address="61 Burke Rd, Camberwell VIC 3124"
                daysLeft="11D LEFT"
                subtitleLine="Burke Rd Heritage"
                soiPill="SOI MISSING — ACTION NEEDED"
              />
              <AuthorityExpiringCarouselCard
                address="15 Monomeath Ave, Canterbury VIC 3126"
                daysLeft="16D LEFT"
                subtitleLine="Canterbury Hill"
                soiPill="SOI ATTACHED"
              />
            </ScrollView>
            <SectionHeader
              title="Your active listings"
              style={styles.sectionHeaderAboveListing}
              onSeeAll={() => router.push('/recent-listings' as Href)}
            />
            <Pressable
              onPress={() => router.push('/list' as Href)}
              accessibilityRole="button"
              accessibilityLabel="Open manage listings">
              <LargeListingCard
                title={DEMO_PRIMARY_LISTING_TITLE}
                localityLine={DEMO_PRIMARY_LOCALITY_LINE}
                price="$2.85M — $3.1M guide"
                beds="5 BED  4 BATH  890M²"
                badgeLeft="ACTIVE"
                badgeRight="AUTH 14D LEFT"
                footerLabels={['428 VIEWS (7D)', '9 LEADS', 'Attached SOI']}
              />
            </Pressable>
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
                style={styles.exploreBtnWrap}>
                EXPLORE
              </AppButton>
            </View>
            <View style={styles.saveBanner}>
              <View style={styles.saveBannerLeft}>
                <FontAwesome name="star-o" size={18} color="#fff" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.saveBannerTitle}>Save search & get alerts</Text>
                  <Text style={styles.saveBannerSub}>Notify me the moment a new match appears</Text>
                </View>
              </View>
              <Switch value={saveAlerts} onValueChange={setSaveAlerts} trackColor={{ false: '#444', true: '#6ccf7a' }} />
            </View>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>12 off-market matches</Text>
              <Text style={styles.sortLink}>SORT • BEST MATCH</Text>
            </View>
            <SearchMatchRow
              name="Auburn Rd Victorian"
              address="88 Auburn Rd, Hawthorn VIC 3122"
              price="$2.75M — $3.0M"
              specs="4 BED · 3 BATH · 580M²"
              match="94% MATCH"
              imageSource={propertyImageAtIndex(0)}
            />
            <View style={styles.resultDivider} />
            <SearchMatchRow
              name="The Ridge · Camberwell"
              address="3 Victoria Rd, Camberwell VIC 3124"
              price="$3.2M — $3.6M"
              specs="5 BED · 3 BATH · 720M²"
              match="91% MATCH"
              imageSource={propertyImageAtIndex(1)}
            />
            <View style={styles.resultDivider} />
            <SearchMatchRow
              name="Canterbury Estate"
              address="42 Mont Albert Rd, Canterbury VIC 3126"
              price="$2.95M — $3.25M"
              specs="4 BED · 4 BATH · 810M²"
              match="89% MATCH"
              imageSource={propertyImageAtIndex(2)}
            />
          </>
        ) : (
          <>
            <AlertsBanner
              alerts={buyingAlerts}
              collapsed={alertsCollapsed.buying}
              onToggleCollapsed={() =>
                setAlertsCollapsed((prev) => ({ ...prev, buying: !prev.buying }))
              }
              onClearAll={() => clearAllAlerts(buyingAlertsAll.map((a) => a.id))}
              onDismiss={dismissAlert}
            />
            {buyingAlerts.length > 0 ? <View style={{ height: 20 }} /> : null}
            <View style={styles.searchRow}>
              <View style={styles.searchField}>
                <FontAwesome name="search" size={16} color="#000000" />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={DEMO_SEARCH_SUBURB}
                  placeholderTextColor="rgba(0, 0, 0, 0.45)"
                />
              </View>
              <AppButton
                variant="filled"
                shrink
                onPress={() => setBuyingSearchActive(true)}
                textStyle={styles.exploreBtnLabel}
                style={styles.exploreBtnWrap}>
                EXPLORE
              </AppButton>
            </View>
            <HeroCTA
              kicker="BUYER BRIEF"
              title="Post a buyer brief"
              subtitle="Match listing agents within 24 hours"
              onPress={() => router.push('/post-buyer-brief' as Href)}
            />
            <View style={[styles.sellerNetworkCard, dashedPromoShell]}>
              <Text style={styles.sellerNetworkTitle}>6 Active Seller Matches</Text>
              <Text style={styles.sellerNetworkBody}>
                Verified sellers across Hawthorn, Camberwell, and Canterbury are listing overlapping corridors. Swap
                intel, co-marketing leads, and referral handoffs with peers who transact where you do.
              </Text>
              <Pressable
                style={styles.sellerNetworkCta}
                onPress={() => router.push('/your-matches' as Href)}
                accessibilityRole="button">
                <Text style={styles.sellerNetworkCtaText}>View Seller Matches</Text>
              </Pressable>
            </View>
            <SectionHeader title="Recent agent replies" onSeeAll={() => router.push('/messages' as Href)} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              <Pressable onPress={() => router.push('/messages' as Href)} accessibilityRole="button">
                <AgentReplyCard
                  name="John Doe"
                  agency="Jellis Craig"
                  snippet="YES, OFF-MARKET IN CAMBERWELL FITS YOUR BRIEF — HAPPY TO CONNECT"
                />
              </Pressable>
              <Pressable onPress={() => router.push('/messages' as Href)} accessibilityRole="button">
                <AgentReplyCard
                  name="Jane Price"
                  agency="Kay & Burton"
                  snippet="SIMILAR STOCK COMING — CAN PRIORITISE YOUR BRIEF"
                />
              </Pressable>
            </ScrollView>
            <SectionHeader title="Saved searches" onSeeAll={() => router.push('/saved-searches')} />
            <SavedSearchCard
              name="Inner East · Boroondara"
              criteria="4+ beds • House • $2.4M—3.8M • Hawthorn · Camberwell"
              badge="8 NEW"
              alertsOn
              meta="Yesterday"
            />
            <View style={{ height: 12 }} />
            <SavedSearchCard
              name="Canterbury & Glen Iris"
              criteria="4+ beds • Victorian • north rear • schools"
              badge="2 NEW"
              alertsOn={false}
              meta="Paused 2d ago"
            />
            <View style={{ height: 16 }} />
            <SectionHeader
              title="Recently Listed"
              style={styles.sectionHeaderAboveListing}
              onSeeAll={() => router.push('/recent-listings' as Href)}
            />
            <Pressable
              onPress={() => router.push('/view-live-listing' as Href)}
              accessibilityRole="button"
              accessibilityLabel={`Open listing ${DEMO_PRIMARY_LISTING_TITLE}`}>
              <LargeListingCard
                variant="buying"
                title={DEMO_PRIMARY_LISTING_TITLE}
                localityLine={DEMO_PRIMARY_LOCALITY_LINE}
                price="$2.85M — $3.1M guide"
                badgeLeft="OFF-MARKET"
                badgeRight="92% MATCH"
                specParts={['5 bed', '4 bath', '890m²']}
              />
            </Pressable>
          </>
        )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  scrollFill: { flex: 1, minHeight: 0 },
  scrollContent: { paddingHorizontal: 0 },
  stickyHeaderWrap: {
    backgroundColor: '#fff',
  },
  stickyHeaderInner: {},
  homeHeadBlock: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  modeToggleRow: {
    paddingTop: 4,
    paddingBottom: 14,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60, 60, 67, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  alertIcon: { width: 28 },
  alertText: { flex: 1, fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000', marginLeft: 4 },
  alertDismiss: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    backgroundColor: 'rgba(120, 120, 128, 0.10)',
  },
  alertChevron: {
    marginLeft: 2,
  },
  alertsBanner: {
    marginBottom: 0,
  },
  alertsBannerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  alertsHeadHit: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 6,
  },
  alertsKicker: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  alertsHeadChev: {
    marginLeft: 8,
  },
  alertsClear: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  alertsClearText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
  },
  alertsBannerBody: {},
  hero: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0b0b0b',
    borderRadius: 18,
    minHeight: 168,
    marginBottom: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 8,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    paddingTop: 64,
  },
  heroTextCol: { flex: 1, paddingRight: 12 },
  heroKicker: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Satoshi-Medium',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  /** Extra space after dashed saved-search cards and before listing hero image */
  sectionHeaderAboveListing: {
    marginTop: 28,
    marginBottom: 18,
  },
  sectionTitle: { fontSize: 18, fontFamily: 'Satoshi-Medium', color: '#000000' },
  seeAll: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)' },
  hScroll: { gap: 12, paddingBottom: 24 },
  sellerNetworkCard: {
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  sellerNetworkTitle: {
    fontSize: 17,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    marginBottom: 10,
  },
  sellerNetworkBody: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 21,
    marginBottom: 18,
  },
  sellerNetworkCta: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sellerNetworkCtaText: { color: '#fff', fontSize: 14, fontFamily: 'Satoshi-Medium' },
  enquiryCard: {
    width: 224,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60, 60, 67, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 22,
    elevation: 6,
  },
  enqName: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000' },
  enqTime: { fontSize: 11, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)', marginTop: 4 },
  enqAddr: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: '#000000', marginTop: 8 },
  enqPill: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: 'rgba(120, 120, 128, 0.10)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  enqPillText: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.65)' },
  authCarouselCard: {
    width: 224,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60, 60, 67, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 22,
    elevation: 6,
  },
  authCarouselTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  authCarouselAddr: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 20,
  },
  authCarouselDays: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  authCarouselDaysText: {
    fontSize: 9,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  authCarouselSub: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    marginTop: 8,
  },
  authCarouselPill: {
    alignSelf: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(120, 120, 128, 0.10)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: '100%',
  },
  authCarouselPillText: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.65)',
    textAlign: 'center',
  },
  largeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  largeCardBuying: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  largeImgWrap: { height: 220, position: 'relative', backgroundColor: 'rgba(0,0,0,0.04)' },
  largeImgWrapBuying: { height: 184 },
  largeImg: { width: '100%', height: '100%' },
  largeImgLuxScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  badgeLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeLeftText: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: '#fff', letterSpacing: 0.5 },
  badgeLeftBuying: { backgroundColor: '#212121' },
  badgeRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeRightText: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: '#000000' },
  badgeRightBuying: { backgroundColor: '#f2f2f2' },
  badgeRightTextBuying: { color: '#000' },
  largeBody: { padding: 16, paddingBottom: 18 },
  propTitle: { fontSize: 18, fontFamily: 'Satoshi-Medium', color: '#000000' },
  propLocality: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    letterSpacing: 0.4,
  },
  propTitleBuying: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000' },
  propPrice: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000', marginTop: 10 },
  propPriceBuying: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: 'rgba(0,0,0,0.55)', marginTop: 6 },
  propSpecs: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)', marginTop: 8 },
  specRowBuying: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 12,
  },
  specChipBuying: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    textTransform: 'lowercase',
  },
  specSepBuying: { fontSize: 11, fontWeight: '400', color: 'rgba(0, 0, 0, 0.45)' },
  propStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
    paddingTop: 18,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.15)',
    gap: 12,
    rowGap: 10,
  },
  propStat: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)', letterSpacing: 0.3 },
  /** Search + EXPLORE — [Figma: flat beige field, black icon + type, 12px radius to match EXPLORE] */
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    minHeight: 48,
  },
  searchFieldResults: {
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    paddingVertical: 8,
  },
  exploreBtnWrap: {},
  exploreBtnLabel: { fontSize: 12, fontFamily: 'Satoshi-Medium', letterSpacing: 0.6 },
  replyCard: {
    width: 244,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60, 60, 67, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 22,
    elevation: 6,
  },
  replyName: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000' },
  replyAgency: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)', marginTop: 4 },
  replySnippet: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.7)',
    marginTop: 10,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  savedCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.35)',
  },
  savedTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  savedName: { fontSize: 17, fontFamily: 'Satoshi-Medium', color: '#000000', flex: 1 },
  newBadge: { backgroundColor: '#000000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  newBadgeText: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: '#fff' },
  savedCriteria: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)', marginTop: 8 },
  savedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  savedDot: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: '#000000' },
  savedDotOff: { color: 'rgba(0, 0, 0, 0.35)' },
  savedMeta: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)' },
  saveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  saveBannerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  saveBannerTitle: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#fff' },
  saveBannerSub: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000' },
  sortLink: { fontSize: 11, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)', letterSpacing: 0.4 },
  resultDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginVertical: 14,
  },
  matchRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  matchThumbWrap: {
    width: 100,
    height: 100,
    position: 'relative',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    overflow: 'hidden',
  },
  matchThumb: { width: '100%', height: '100%' },
  matchTagOff: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  matchTagText: { fontSize: 8, fontFamily: 'Satoshi-Medium', color: '#fff' },
  matchPct: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  matchPctText: { fontSize: 9, fontFamily: 'Satoshi-Medium', color: '#fff' },
  matchBody: { flex: 1, padding: 12, justifyContent: 'center' },
  matchName: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000' },
  matchAddr: { fontSize: 12, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)', marginTop: 4 },
  matchPrice: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000', marginTop: 8 },
  matchSpecs: { fontSize: 11, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)', marginTop: 6 },
});
