import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { type Href, useRouter } from 'expo-router';
import { Text } from '@/components/OMMText';
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Agent profile — from chat overflow "View agent profile".
 * [Figma 1053:6508](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-6508&t=2eZigRM0BwNtC5wd-4)
 */

import { DEMO_AGENT_AGENCY } from '@/lib/melbourne-demo-locations';
import { AGENT_IMG, PROPERTY_IMG_1, propertyImageAtIndex } from '@/lib/propertyImages';
const H_PAD = 20;
const CARD_R = 14;

const REVIEWS = [
  {
    name: 'Sarah Chen',
    role: 'Buyers Agent • BR Realty',
    rating: '5.0',
    quote: 'Quick replies, SOI was always on hand. Settlement ran smooth.',
    date: '14 APR 2026',
  },
  {
    name: 'Tom Reid',
    role: 'Listing Agent • Marshall White',
    rating: '4.8',
    quote: 'Clear authority docs, fair commission split. Would work with again.',
    date: '02 APR 2026',
  },
] as const;

const LISTINGS = [
  {
    address: '15 Rowe St, Fitzroy North VIC 3068',
    specs: 'HOUSE · 4 BED · 2 BATH',
    price: '$2.1m — $2.3m',
    listed: 'Listed 3 days ago',
  },
  {
    address: '102/8 Joseph Rd, Footscray VIC 3011',
    specs: 'APARTMENT · 2 BED · 1 BATH',
    price: '$850k — $920k',
    listed: 'Listed 12 days ago',
  },
] as const;

function SectionHeader({
  title,
  action,
  onActionPress,
  titleEmphasis,
}: {
  title: string;
  action?: string;
  onActionPress?: () => void;
  /** Darker title (e.g. Active listings header in Figma) */
  titleEmphasis?: boolean;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, titleEmphasis && styles.sectionTitleEmphasis]}>{title}</Text>
      {action ? (
        onActionPress ? (
          <Pressable onPress={onActionPress} hitSlop={8} accessibilityRole="button">
            <Text style={[styles.sectionAction, titleEmphasis && styles.sectionActionEmphasis]}>{action}</Text>
          </Pressable>
        ) : (
          <Text style={[styles.sectionAction, titleEmphasis && styles.sectionActionEmphasis]}>{action}</Text>
        )
      ) : null}
    </View>
  );
}

export default function AgentProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.navSide}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Agent</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarWrap}>
              <Image source={AGENT_IMG} style={styles.avatar} resizeMode="cover" />
              <View style={styles.verifiedBadge}>
                <FontAwesome name="check" size={10} color="#fff" />
              </View>
            </View>
            <View style={styles.heroTextCol}>
              <Text style={styles.name}>Anton Zhouk</Text>
              <Text style={styles.roleLine}>Listing Agent</Text>
              <Text style={styles.agencyLine}>{DEMO_AGENT_AGENCY}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <FontAwesome
                    key={i}
                    name="star"
                    size={12}
                    color="#000000"
                    style={i > 1 ? styles.starGap : undefined}
                  />
                ))}
                <Text style={styles.ratingScore}>4.9</Text>
                <Text style={styles.ratingMuted}> · 42 reviews</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.ctaRow}>
            <Pressable
              style={[styles.msgBtn, styles.ctaFlex]}
              onPress={() => router.push('/contact-seller-chat' as Href)}
              accessibilityRole="button">
              <Text style={styles.msgBtnText}>MESSAGE</Text>
            </Pressable>
            <Pressable style={[styles.callBtn, styles.ctaFlex]} accessibilityRole="button">
              <Text style={styles.callBtnText}>CALL</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>LISTINGS</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>87</Text>
            <Text style={styles.statLabel}>CLOSED</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>6</Text>
            <Text style={styles.statLabel}>YEARS</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>98%</Text>
            <Text style={styles.statLabel}>ON-TIME</Text>
          </View>
        </View>

        <SectionHeader
          title="REVIEWS"
          action="SEE ALL →"
          onActionPress={() => router.push('/agent-reviews' as Href)}
        />
        {REVIEWS.map((r) => (
          <View key={r.name} style={styles.reviewCard}>
            <View style={styles.reviewTop}>
              <Image source={PROPERTY_IMG_1} style={styles.reviewAvatar} resizeMode="cover" />
              <View style={styles.reviewMeta}>
                <Text style={styles.reviewName}>{r.name}</Text>
                <Text style={styles.reviewRole}>{r.role}</Text>
              </View>
              <Text style={styles.reviewStars}>★ {r.rating}</Text>
            </View>
            <View style={styles.reviewBodyDivider} />
            <Text style={styles.reviewQuote}>{r.quote}</Text>
            <Text style={styles.reviewDate}>{r.date}</Text>
          </View>
        ))}

        <SectionHeader
          title="ACTIVE LISTINGS"
          action="SEE ALL →"
          titleEmphasis
          onActionPress={() => router.push('/agent-active-listings' as Href)}
        />
        {LISTINGS.map((L, index) => (
          <Pressable
            key={L.address}
            onPress={() => router.push('/view-live-listing' as Href)}
            accessibilityRole="button"
            accessibilityLabel={`View listing, ${L.address}`}
            style={({ pressed }) => [pressed && { opacity: 0.96 }]}>
            <View style={styles.listingCard}>
              <View style={styles.listingThumbClip}>
                <Image source={propertyImageAtIndex(index)} style={styles.listingThumb} resizeMode="cover" />
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              </View>
              <View style={styles.listingBody}>
                <Text style={styles.listingAddr}>{L.address}</Text>
                <Text style={styles.listingSpecs}>{L.specs}</Text>
                <Text style={styles.listingPrice}>{L.price}</Text>
                <Text style={styles.listingListed}>{L.listed}</Text>
              </View>
            </View>
          </Pressable>
        ))}

        <Text style={styles.aboutKicker}>ABOUT</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutBody}>
            Principal agent with 6 years across inner Melbourne. Specialises in family homes and boutique apartments. Known for
            fast-turn SOI and clean authority docs.
          </Text>
        </View>

        <Pressable style={styles.actionRow} accessibilityRole="button">
          <MaterialCommunityIcons name="alert-outline" size={22} color="#c9a227" />
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle}>Raise a dispute</Text>
            <Text style={styles.actionSub}>Open formal ticket with OMM moderators.</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="rgba(0, 0, 0, 0.35)" />
        </Pressable>
        <Pressable style={styles.actionRow} accessibilityRole="button">
          <MaterialCommunityIcons name="block-helper" size={22} color="rgba(0, 0, 0, 0.45)" />
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle}>Block agent</Text>
            <Text style={styles.actionSub}>You will no longer receive messages</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="rgba(0, 0, 0, 0.35)" />
        </Pressable>
        <Pressable style={styles.actionRow} accessibilityRole="button">
          <MaterialCommunityIcons name="flag-outline" size={22} color="rgba(0, 0, 0, 0.45)" />
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle}>Report profile</Text>
            <Text style={styles.actionSub}>For spam, misleading info, or conduct issues</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="rgba(0, 0, 0, 0.35)" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  navSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 17, fontFamily: 'Satoshi-Medium', color: '#000000' },
  scroll: { paddingHorizontal: H_PAD, paddingTop: 16 },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: CARD_R,
    padding: 20,
    alignItems: 'stretch',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  heroTextCol: { flex: 1, minWidth: 0, paddingLeft: 14, justifyContent: 'flex-start' },
  heroDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginTop: 18,
    marginBottom: 18,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.06)' },
  verifiedBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: { fontSize: 20, fontFamily: 'Satoshi-Medium', color: '#000000' },
  roleLine: { fontSize: 14, fontWeight: '400', color: 'rgba(0, 0, 0, 0.55)', marginTop: 6 },
  agencyLine: { fontSize: 14, fontWeight: '400', color: 'rgba(0, 0, 0, 0.5)', marginTop: 2 },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  starGap: { marginLeft: 2 },
  ratingScore: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: '#000000', marginLeft: 8 },
  ratingMuted: { fontSize: 13, fontWeight: '400', color: 'rgba(0, 0, 0, 0.5)' },
  ctaRow: { flexDirection: 'row', gap: 12, width: '100%' },
  ctaFlex: { flex: 1 },
  msgBtn: {
    backgroundColor: '#000000',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Satoshi-Medium', letterSpacing: 0.4 },
  callBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  callBtnText: { color: '#000000', fontSize: 13, fontFamily: 'Satoshi-Medium', letterSpacing: 0.4 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: CARD_R,
    paddingVertical: 18,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  statCell: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontFamily: 'Satoshi-Medium', color: '#000000' },
  statLabel: {
    marginTop: 6,
    fontSize: 9,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    letterSpacing: 0.6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.5)',
    letterSpacing: 0.65,
  },
  sectionTitleEmphasis: {
    color: '#000000',
    fontFamily: 'Satoshi-Medium',
  },
  sectionAction: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: 0.4,
  },
  sectionActionEmphasis: {
    fontFamily: 'Satoshi-Medium',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: CARD_R,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  reviewTop: { flexDirection: 'row', alignItems: 'center' },
  reviewBodyDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 12,
    marginBottom: 12,
  },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)' },
  reviewMeta: { flex: 1, marginLeft: 12, minWidth: 0 },
  reviewName: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000' },
  reviewRole: { fontSize: 12, fontWeight: '400', color: 'rgba(0, 0, 0, 0.5)', marginTop: 2 },
  reviewStars: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: '#000000' },
  reviewQuote: { fontSize: 14, fontWeight: '400', color: '#000000', lineHeight: 21 },
  reviewDate: { marginTop: 12, fontSize: 12, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.45)' },
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  listingThumbClip: {
    width: 104,
    height: 104,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.06)',
    position: 'relative',
  },
  listingThumb: { width: '100%', height: '100%' },
  liveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.62)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
  },
  liveBadgeText: { fontSize: 9, fontFamily: 'Satoshi-Medium', color: '#fff', letterSpacing: 0.4 },
  listingBody: { flex: 1, minWidth: 0, justifyContent: 'center', paddingRight: 4 },
  listingAddr: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000', lineHeight: 21 },
  listingSpecs: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 8,
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  listingPrice: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000', marginTop: 10 },
  listingListed: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.45)',
    marginTop: 8,
  },
  aboutKicker: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.5)',
    letterSpacing: 0.65,
    marginTop: 8,
    marginBottom: 10,
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: CARD_R,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  aboutBody: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 21,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: CARD_R,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  actionTextCol: { flex: 1, minWidth: 0 },
  actionTitle: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000' },
  actionSub: { fontSize: 12, fontWeight: '400', color: 'rgba(0, 0, 0, 0.5)', marginTop: 4, lineHeight: 17 },
});
