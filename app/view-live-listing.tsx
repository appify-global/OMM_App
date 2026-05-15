import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Text } from '@/components/OMMText';
import { Image, Linking, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApproximateAreaMap } from '@/components/ApproximateAreaMap';
import { AppButton } from '@/components/AppButton';
import { PlayTourModal } from '@/components/PlayTourModal';
import { SoiBottomSheet } from '@/components/SoiBottomSheet';
import { useSavedListings } from '@/lib/saved-listings-context';
import { VIEW_LIVE_LISTING_CARD } from '@/lib/saved-listings';

/**
 * View live listing / property information.
 * [Figma 1053:8267](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-8267)
 * Flow: [Figma 1053:8028](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-8028)
 */

import { AGENT_IMG, PROPERTY_IMG_1, propertyImageAtIndex } from '@/lib/propertyImages';
import {
  DEMO_AGENT_AGENCY,
  DEMO_ANONYMOUS_LISTING_ADDRESS_MULTILINE,
  DEMO_APPROXIMATE_MAPS_QUERY,
  DEMO_PRIMARY_ADDRESS_MULTILINE,
  DEMO_PRIMARY_STREET,
} from '@/lib/melbourne-demo-locations';
import {
  parseAddressDisclosureParam,
  readDemoLiveListingDisclosure,
  type LiveListingAddressDisclosure,
} from '@/lib/demo-live-listing-disclosure';
import { layout } from '@/constants/theme';

/** Demo seller contact for "Contact" — replace with API data when wired. */
const DEMO_SELLER_EMAIL = 'anton.zhouk@bigginscott.com.au';
const DEMO_SELLER_PHONE_DISPLAY = '+61 3 9328 4500';
const DEMO_SELLER_PHONE_TEL = '+61393284500';

const SECTION = 28;
const GAP_MD = 16;

function firstQueryParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function Kicker({ children }: { children: string }) {
  return <Text style={styles.kicker}>{children}</Text>;
}

function FeatureCell({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <View style={styles.featureCell}>
      <View style={styles.featureIconWrap}>{icon}</View>
      <View style={styles.featureTextCol}>
        <Text style={styles.featureLabel}>{label}</Text>
        <Text style={styles.featureValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ViewLiveListingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    addressDisclosure: addressDisclosureParam,
    street: streetParam,
    suburb: suburbParam,
    price: priceParam,
    beds: bedsParam,
    baths: bathsParam,
    cars: carsParam,
    imageIndex: imageIndexParam,
  } = useLocalSearchParams<{
    addressDisclosure?: string;
    street?: string;
    suburb?: string;
    price?: string;
    beds?: string;
    baths?: string;
    cars?: string;
    imageIndex?: string;
  }>();
  const [storedDisclosure, setStoredDisclosure] = useState<LiveListingAddressDisclosure | null>(null);

  useEffect(() => {
    if (addressDisclosureParam !== undefined) {
      return;
    }
    void readDemoLiveListingDisclosure().then(setStoredDisclosure);
  }, [addressDisclosureParam]);

  const { isSaved, toggleSaved } = useSavedListings();
  const [soiOpen, setSoiOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [sellerContactOpen, setSellerContactOpen] = useState(false);

  const street = firstQueryParam(streetParam);
  const suburb = firstQueryParam(suburbParam);
  const listingFromRecent = Boolean(street && suburb);
  const listingPrice = firstQueryParam(priceParam);
  const listingBeds = firstQueryParam(bedsParam);
  const listingBaths = firstQueryParam(bathsParam);
  const listingCars = firstQueryParam(carsParam);
  const listingImageIndex = Math.max(0, parseInt(firstQueryParam(imageIndexParam) ?? '0', 10) || 0);
  const heroSource = listingFromRecent ? propertyImageAtIndex(listingImageIndex) : PROPERTY_IMG_1;

  const addressMultiline = listingFromRecent ? `${street},\n${suburb} VIC` : null;
  const displayPrice = listingFromRecent && listingPrice ? listingPrice : '$2,450,000';
  const displayBeds = listingFromRecent && listingBeds ? listingBeds : '3';
  const displayBaths = listingFromRecent && listingBaths ? listingBaths : '2';
  const displayCars = listingFromRecent && listingCars ? listingCars : '2';
  const mapQuery = listingFromRecent ? `${street}, ${suburb} VIC Australia` : null;
  const descriptionBody = listingFromRecent
    ? `A refined ${displayBeds}-bedroom property in ${suburb}, combining modern living with easy access to local amenities, transport links, and vibrant surroundings.`
    : 'A refined 3-bedroom property positioned in a prime central location, combining modern living with easy access to key amenities, transport links, and vibrant city surroundings.';

  const addressDisclosure: LiveListingAddressDisclosure = listingFromRecent
    ? 'disclose'
    : addressDisclosureParam !== undefined
      ? parseAddressDisclosureParam(addressDisclosureParam)
      : (storedDisclosure ?? 'disclose');
  const addressAnonymousToBuyers = addressDisclosure === 'not_disclose';
  const saved = isSaved(VIEW_LIVE_LISTING_CARD.id);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.heroWrap}>
        <Image source={heroSource} style={styles.heroImg} resizeMode="cover" />
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={[styles.backBtn, { top: 8 }]}>
          <FontAwesome name="chevron-left" size={22} color="#000000" />
        </Pressable>
        <Pressable
          onPress={() => void toggleSaved(VIEW_LIVE_LISTING_CARD)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved properties' : 'Save property'}
          accessibilityState={{ selected: saved }}
          style={[styles.saveStarBtn, { top: 8 }]}>
          <FontAwesome name={saved ? 'star' : 'star-o'} size={20} color="#000000" />
        </Pressable>
        <Pressable
          style={styles.playTourPill}
          accessibilityRole="button"
          onPress={() => setTourOpen(true)}>
          <Text style={styles.playTourPlay}>▶</Text>
          <Text style={styles.playTourText}>PLAY TOUR · 0:42</Text>
        </Pressable>
      </View>
      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 112 }]}>
        <Kicker>PROPERTY ADDRESS</Kicker>
        {addressAnonymousToBuyers ? (
          <>
            <Text style={styles.addressTitle}>The street address is not disclosed publicly on this listing.</Text>
            <Text style={styles.addressSubMuted}>{DEMO_ANONYMOUS_LISTING_ADDRESS_MULTILINE}</Text>
          </>
        ) : listingFromRecent && addressMultiline ? (
          <Text style={styles.addressTitle}>{addressMultiline}</Text>
        ) : (
          <Text style={styles.addressTitle}>{DEMO_PRIMARY_ADDRESS_MULTILINE}</Text>
        )}

        <View style={styles.priceBlock}>
          <Text style={[styles.kicker, styles.kickerNoTop]}>LISTING PRICE</Text>
          <Text style={styles.priceValue}>{displayPrice}</Text>
        </View>
        <View style={styles.ruleThick} />

        <Pressable
          style={styles.soiCard}
          accessibilityRole="button"
          onPress={() => setSoiOpen(true)}>
          <FontAwesome name="file-text-o" size={22} color="rgba(0, 0, 0, 0.55)" style={styles.soiIcon} />
          <View style={styles.soiBody}>
            <Text style={styles.soiKicker}>STATEMENT OF INFORMATION</Text>
            <Text style={styles.soiGuide}>Price guide $2.35M — $2.55M</Text>
            <Text style={styles.soiMeta}>Issued 12 Apr 2026 · Expires 12 Jul</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="rgba(0, 0, 0, 0.45)" />
        </Pressable>

        <View style={styles.featuresGrid}>
          <View style={styles.featureRow}>
            <FeatureCell
              label="BEDROOMS"
              value={displayBeds}
              icon={<MaterialCommunityIcons name="bed" size={24} color="#fff" />}
            />
            <FeatureCell
              label="BATHROOMS"
              value={displayBaths}
              icon={<MaterialCommunityIcons name="bathtub" size={22} color="#fff" />}
            />
          </View>
          <View style={styles.featureRule} />
          <View style={styles.carRow}>
            <View style={styles.featureIconWrap}>
              <MaterialCommunityIcons name="car" size={20} color="#fff" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureLabel}>CAR SPACES</Text>
              <Text style={styles.featureValue}>{displayCars}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionPad}>
          <Text style={styles.descKicker}>DESCRIPTION</Text>
          <Text style={styles.descBody}>{descriptionBody}</Text>
        </View>

        <Text style={[styles.locKicker, styles.sectionPadTop]}>LOCATION</Text>
        <View style={styles.locMapBlock}>
          <ApproximateAreaMap
            variant={addressAnonymousToBuyers ? 'anonymous' : 'disclosed'}
            mapsQuery={
              addressAnonymousToBuyers
                ? DEMO_APPROXIMATE_MAPS_QUERY
                : mapQuery ?? DEMO_PRIMARY_STREET
            }
            radiusMeters={500}
          />
        </View>

        <View style={styles.amenities}>
          <View style={styles.featureRow}>
            <FeatureCell
              label="NEARBY SCHOOL"
              value="3 km"
              icon={<MaterialCommunityIcons name="school" size={20} color="#fff" />}
            />
            <FeatureCell
              label="NEARBY MALL"
              value="4 km"
              icon={<MaterialCommunityIcons name="storefront-outline" size={20} color="#fff" />}
            />
          </View>
          <View style={styles.featureRule} />
          <View style={styles.carRow}>
            <View style={styles.featureIconWrap}>
              <MaterialCommunityIcons name="basket-outline" size={20} color="#fff" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureLabel}>NEARBY SUPERMARKET</Text>
              <Text style={styles.featureValue}>1.5 km</Text>
            </View>
          </View>
        </View>

        <Text style={styles.agentSectionKicker}>SELLING AGENT</Text>
        <View style={styles.agentCard}>
          <Image source={AGENT_IMG} style={styles.agentAvatar} resizeMode="cover" />
          <View style={styles.agentText}>
            <Text style={styles.agentName}>Anton Zhouk</Text>
            <Text style={styles.agentAgency}>{DEMO_AGENT_AGENCY}</Text>
            <Text style={styles.agentMeta}>★ 4.9 · 42 reviews · 12 listings</Text>
          </View>
          <Pressable
            style={styles.viewAgentBtn}
            accessibilityRole="button"
            accessibilityLabel="View agent profile"
            onPress={() => router.push('/agent-profile' as Href)}>
            <Text style={styles.viewAgentBtnText}>VIEW →</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.footerBtnRow}>
          <View style={styles.footerBtnCol}>
            <AppButton
              variant="filled"
              onPress={() => router.push('/contact-seller-chat' as Href)}
              textStyle={styles.contactBtnText}
              accessibilityLabel="Message seller">
              MESSAGE
            </AppButton>
          </View>
          <View style={styles.footerBtnCol}>
            <AppButton
              variant="outlined"
              onPress={() => setSellerContactOpen(true)}
              textStyle={styles.contactBtnTextOutlined}
              accessibilityLabel="Show seller email and phone">
              CONTACT
            </AppButton>
          </View>
        </View>
      </View>

      <Modal
        visible={sellerContactOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSellerContactOpen(false)}>
        <View style={styles.contactSheetStack}>
          <Pressable
            style={styles.contactSheetScrim}
            onPress={() => setSellerContactOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          />
          <View style={[styles.contactSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.contactSheetHandleWrap}>
              <View style={styles.contactSheetHandle} />
            </View>
            <Text style={styles.contactSheetTitle}>Seller contact</Text>
            <Text style={styles.contactSheetHint}>Email or call the Real Estate Agent.</Text>

            <View style={styles.contactSheetDivider} />

            <View style={styles.contactSheetRow}>
              <Text style={styles.contactModalKicker}>EMAIL</Text>
              <Pressable
                onPress={() => void Linking.openURL(`mailto:${DEMO_SELLER_EMAIL}`)}
                accessibilityRole="link"
                accessibilityLabel={`Email ${DEMO_SELLER_EMAIL}`}>
                <Text style={styles.contactModalValue}>{DEMO_SELLER_EMAIL}</Text>
              </Pressable>
            </View>

            <View style={styles.contactSheetDivider} />

            <View style={styles.contactSheetRow}>
              <Text style={styles.contactModalKicker}>PHONE</Text>
              <Pressable
                onPress={() => void Linking.openURL(`tel:${DEMO_SELLER_PHONE_TEL}`)}
                accessibilityRole="link"
                accessibilityLabel={`Call ${DEMO_SELLER_PHONE_DISPLAY}`}>
                <Text style={styles.contactModalValue}>{DEMO_SELLER_PHONE_DISPLAY}</Text>
              </Pressable>
            </View>

            <View style={styles.contactSheetDivider} />

            <View style={styles.contactSheetDoneWrap}>
              <AppButton
                variant="filled"
                onPress={() => setSellerContactOpen(false)}
                textStyle={styles.contactSheetDoneBtn}>
                DONE
              </AppButton>
            </View>
          </View>
        </View>
      </Modal>

      <SoiBottomSheet visible={soiOpen} onClose={() => setSoiOpen(false)} />
      <PlayTourModal visible={tourOpen} onClose={() => setTourOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  heroWrap: {
    height: 268,
    width: '100%',
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  heroImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveStarBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTourPill: {
    position: 'absolute',
    right: 16,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 16,
    borderRadius: 20,
  },
  playTourPlay: { color: '#fff', fontSize: 11, fontFamily: 'Satoshi-Medium' },
  playTourText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  dotActive: { backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  scroll: { paddingHorizontal: layout.screenGutter },
  kicker: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#777',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  kickerNoTop: { marginTop: 0 },
  addressTitle: {
    marginTop: 12,
    fontSize: 26,
    fontFamily: 'Satoshi-Medium',
    color: '#1a1c1c',
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  addressSubMuted: {
    marginTop: 14,
    fontSize: 17,
    lineHeight: 24,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.5)',
  },
  priceBlock: { marginTop: SECTION },
  priceValue: {
    marginTop: 10,
    fontSize: 22,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    lineHeight: 30,
  },
  ruleThick: {
    marginTop: GAP_MD,
    marginBottom: 6,
    borderBottomWidth: 0.8,
    borderBottomColor: '#5c5c5c',
    paddingBottom: GAP_MD,
  },
  soiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.14)',
    paddingVertical: 18,
    paddingHorizontal: GAP_MD,
    marginTop: 12,
    gap: 14,
  },
  soiIcon: { marginTop: 2 },
  soiBody: { flex: 1, minWidth: 0 },
  soiKicker: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  soiGuide: { marginTop: 6, fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000', lineHeight: 22 },
  soiMeta: { marginTop: 6, fontSize: 13, color: 'rgba(0, 0, 0, 0.55)', lineHeight: 18 },
  featuresGrid: { marginTop: SECTION },
  featureRow: { flexDirection: 'row', gap: 14 },
  featureCell: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 68 },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTextCol: { flex: 1, justifyContent: 'flex-start', paddingTop: 0 },
  featureLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    textTransform: 'uppercase',
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  featureValue: { marginTop: 6, fontSize: 22, fontFamily: 'Satoshi-Medium', color: '#000', lineHeight: 28 },
  featureRule: {
    marginVertical: GAP_MD,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ffffff',
  },
  carRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 60 },
  sectionPad: { marginTop: SECTION },
  sectionPadTop: { marginTop: SECTION, marginBottom: 10 },
  descKicker: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  descBody: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(0, 0, 0, 0.65)',
    fontWeight: '400',
  },
  locKicker: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#777',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  locMapBlock: { marginTop: 10 },
  amenities: { marginTop: SECTION },
  agentSectionKicker: {
    marginTop: SECTION,
    marginBottom: 12,
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: GAP_MD,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  agentAvatar: { width: 52, height: 52, borderRadius: 22 },
  agentText: { flex: 1, minWidth: 0 },
  agentName: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000' },
  agentAgency: { marginTop: 6, fontSize: 14, color: 'rgba(0, 0, 0, 0.55)' },
  agentMeta: { marginTop: 8, fontSize: 12, color: 'rgba(0, 0, 0, 0.55)', lineHeight: 17 },
  viewAgentBtn: {
    backgroundColor: '#000000',
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAgentBtnText: { color: '#fff', fontSize: 12, fontFamily: 'Satoshi-Medium', letterSpacing: 0.5 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: layout.screenGutter,
    paddingTop: GAP_MD,
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  footerBtnRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  footerBtnCol: {
    flex: 1,
    minWidth: 0,
  },
  contactBtnText: { fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.2 },
  contactBtnTextOutlined: { fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.2 },
  contactSheetStack: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  contactSheetScrim: {
    flex: 1,
  },
  contactSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 8,
  },
  contactSheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  contactSheetTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  contactSheetHint: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  contactSheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginVertical: 0,
  },
  contactSheetRow: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  contactModalKicker: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  contactModalValue: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    textDecorationLine: 'underline',
  },
  contactSheetDoneWrap: {
    marginTop: 8,
    paddingTop: 12,
  },
  contactSheetDoneBtn: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.5,
  },
});
