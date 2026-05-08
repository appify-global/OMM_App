import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Fragment, useEffect, useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Image, Pressable, ScrollView, StyleSheet, Switch, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type Href, useGlobalSearchParams, useRouter } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import {
  DEMO_PRIMARY_LISTING_TITLE,
  DEMO_SEARCH_SUBURB,
} from '@/lib/melbourne-demo-locations';
import { PROPERTY_IMG_1, PROPERTY_IMG_2, propertyImageAtIndex } from '@/lib/propertyImages';

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

function AlertRow({ icon, text }: { icon: React.ComponentProps<typeof FontAwesome>['name']; text: string }) {
  return (
    <Pressable style={styles.alertCard} accessibilityRole="button">
      <FontAwesome name={icon} size={18} color="#000000" style={styles.alertIcon} />
      <Text style={styles.alertText}>{text}</Text>
      <FontAwesome name="chevron-right" size={12} color="rgba(0, 0, 0, 0.4)" />
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
        <View style={[styles.badgeLeft, isBuying && styles.badgeLeftBuying]}>
          <Text style={styles.badgeLeftText}>{props.badgeLeft}</Text>
        </View>
        <View style={[styles.badgeRight, isBuying && styles.badgeRightBuying]}>
          <Text style={[styles.badgeRightText, isBuying && styles.badgeRightTextBuying]}>{props.badgeRight}</Text>
        </View>
      </View>
      <View style={styles.largeBody}>
        <Text style={[styles.propTitle, isBuying && styles.propTitleBuying]}>{props.title}</Text>
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
  const router = useRouter();
  const search = useGlobalSearchParams<{ openBuyingSearch?: string; homeSegment?: string; _ts?: string }>();
  const [mode, setMode] = useState<'selling' | 'buying'>('selling');
  const [buyingSearchActive, setBuyingSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState(DEMO_SEARCH_SUBURB);
  const [saveAlerts, setSaveAlerts] = useState(false);

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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 100,
          },
        ]}>
        <View style={styles.topRow}>
          <Text style={styles.homeTitle}>Home</Text>
          <View style={styles.headerIcons}>
            <Pressable
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => router.push('/notifications' as Href)}>
              <FontAwesome name="bell-o" size={22} color="#000000" />
            </Pressable>
            <Pressable
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Messages"
              onPress={() => router.push('/messages' as Href)}>
              <FontAwesome name="comment-o" size={22} color="#000000" />
            </Pressable>
          </View>
        </View>

        <View style={styles.segment}>
          <Pressable
            onPress={() => {
              setMode('selling');
              setBuyingSearchActive(false);
            }}
            style={[styles.segmentItem, mode === 'selling' && styles.segmentActive]}>
            <Text style={[styles.segmentText, mode === 'selling' && styles.segmentTextActive]}>SELLING</Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('buying')}
            style={[styles.segmentItem, mode === 'buying' && styles.segmentActive]}>
            <Text style={[styles.segmentText, mode === 'buying' && styles.segmentTextActive]}>BUYING</Text>
          </Pressable>
        </View>

        {mode === 'selling' ? (
          <>
            <AlertRow icon="bullhorn" text="3 new enquiries" />
            <View style={{ height: 10 }} />
            <AlertRow icon="star" text="2 transactions awaiting review" />
            <View style={{ height: 20 }} />
            <HeroCTA
              kicker="NEW LISTING"
              title="Publish a property"
              subtitle="Auto-fill from PriceFinder • SOI in 5 steps"
              onPress={() => router.push('/add' as Href)}
            />
            <SectionHeader title="Latest enquiries" onSeeAll={() => router.push('/messages' as Href)} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              <Pressable onPress={() => router.push('/messages' as Href)} accessibilityRole="button">
                <EnquiryCard
                  name="John Doe"
                  time="2H AGO"
                  address="8 Union St, Brunswick VIC 3056"
                  tag="RE: HAWTHORN CITY CENTER"
                />
              </Pressable>
              <Pressable onPress={() => router.push('/messages' as Href)} accessibilityRole="button">
                <EnquiryCard
                  name="Anita Wong"
                  time="5H AGO"
                  address="44 Walter St, Moorabbin VIC 3189"
                  tag="RE: INNER EAST BRIEF"
                />
              </Pressable>
            </ScrollView>
            <SectionHeader
              title="Authority expiring"
              onSeeAll={() => router.push('/authority-expiring' as Href)}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
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
                price="$2.0M — $2.2M"
                beds="4 BED  3 BATH  650M²"
                badgeLeft="ACTIVE"
                badgeRight="AUTH 14D LEFT"
                footerLabels={['312 VIEWS (7D)', '6 LEADS', 'Attached SOI']}
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
            <AlertRow icon="bolt" text="2 new agent replies" />
            <View style={{ height: 10 }} />
            <AlertRow icon="star" text="1 transaction awaiting review" />
            <View style={{ height: 20 }} />
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
                Verified sellers in your corridors are listing overlapping stock. Swap intel, co-marketing leads, and
                referral handoffs with peers who sell where you sell.
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
                price="$2.0M — $2.2M"
                badgeLeft="OFF-MARKET"
                badgeRight="92% MATCH"
                specParts={['4 bed', '3 bath', '650m²']}
              />
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 20 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  homeTitle: {
    fontSize: 32,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: -0.8,
  },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  segment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 11,
  },
  segmentActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.50)',
    letterSpacing: 0.4,
  },
  segmentTextActive: { color: '#000000' },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  alertIcon: { width: 28 },
  alertText: { flex: 1, fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000', marginLeft: 4 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
  },
  heroTextCol: { flex: 1, paddingRight: 12 },
  heroKicker: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSub: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: 'rgba(255,255,255,0.55)', lineHeight: 18 },
  heroFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  enqName: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000' },
  enqTime: { fontSize: 11, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)', marginTop: 4 },
  enqAddr: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: '#000000', marginTop: 8 },
  enqPill: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  enqPillText: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.65)' },
  authCarouselCard: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    backgroundColor: '#ffffff',
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
  largeImgWrap: { height: 200, position: 'relative' },
  largeImgWrapBuying: { height: 168 },
  largeImg: { width: '100%', height: '100%' },
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
  propTitleBuying: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000' },
  propPrice: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000', marginTop: 6 },
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
    backgroundColor: '#ede8e0',
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
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
