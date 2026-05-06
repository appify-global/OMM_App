import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { type Href, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { PlayTourModal } from '@/components/PlayTourModal';
import { SoiBottomSheet } from '@/components/SoiBottomSheet';

/**
 * View live listing / property information.
 * [Figma 1053:8267](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-8267)
 * Flow: [Figma 1053:8028](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-8028)
 */

const HERO = require('@/assets/images/welcome-bg.jpg');

/** 8 / 12 / 16 / 20 / 24 / 32 rhythm */
const PAD = 24;
const SECTION = 28;
const GAP_MD = 16;

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
  const [soiOpen, setSoiOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.heroWrap}>
        <Image source={HERO} style={styles.heroImg} resizeMode="cover" />
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={[styles.backBtn, { top: 8 }]}>
          <FontAwesome name="chevron-left" size={22} color="#1c1c1e" />
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
        <Text style={styles.addressTitle}>
          Hawthorn City Center,{'\n'}Victoria
        </Text>

        <View style={styles.priceBlock}>
          <Text style={[styles.kicker, styles.kickerNoTop]}>LISTING PRICE</Text>
          <Text style={styles.priceValue}>$2,450,000</Text>
        </View>
        <View style={styles.ruleThick} />

        <Pressable
          style={styles.soiCard}
          accessibilityRole="button"
          onPress={() => setSoiOpen(true)}>
          <FontAwesome name="file-text-o" size={22} color="rgba(60,60,67,0.55)" style={styles.soiIcon} />
          <View style={styles.soiBody}>
            <Text style={styles.soiKicker}>STATEMENT OF INFORMATION</Text>
            <Text style={styles.soiGuide}>Price guide $2.35M — $2.55M</Text>
            <Text style={styles.soiMeta}>Issued 12 Apr 2026 · Expires 12 Jul</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="rgba(60,60,67,0.45)" />
        </Pressable>

        <View style={styles.featuresGrid}>
          <View style={styles.featureRow}>
            <FeatureCell
              label="BEDROOMS"
              value="3"
              icon={<MaterialCommunityIcons name="bed" size={24} color="#fff" />}
            />
            <FeatureCell
              label="BATHROOMS"
              value="2"
              icon={<MaterialCommunityIcons name="bathtub" size={22} color="#fff" />}
            />
          </View>
          <View style={styles.featureRule} />
          <View style={styles.carRow}>
            <View style={styles.featureIconWrap}>
              <MaterialCommunityIcons name="car" size={20} color="#fff" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureLabel}>CARSPACES</Text>
              <Text style={styles.featureValue}>2</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionPad}>
          <Text style={styles.descKicker}>DESCRIPTION</Text>
          <Text style={styles.descBody}>
            A refined 3-bedroom property positioned in a prime central location, combining modern living with easy
            access to key amenities, transport links, and vibrant city surroundings.
          </Text>
        </View>

        <Text style={[styles.locKicker, styles.sectionPadTop]}>LOCATION</Text>
        <Image source={HERO} style={styles.locImage} resizeMode="cover" />

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

        <Text style={styles.agentSectionKicker}>LISTING AGENT</Text>
        <View style={styles.agentCard}>
          <Image source={HERO} style={styles.agentAvatar} resizeMode="cover" />
          <View style={styles.agentText}>
            <Text style={styles.agentName}>Anton Zhouk</Text>
            <Text style={styles.agentAgency}>Ray White Hawthorn</Text>
            <Text style={styles.agentMeta}>★ 4.9 · 42 reviews · 12 listings</Text>
          </View>
          <Pressable style={styles.viewAgentBtn} accessibilityRole="button">
            <Text style={styles.viewAgentBtnText}>VIEW →</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <AppButton
          variant="filled"
          onPress={() => router.push('/contact-seller-chat' as Href)}
          textStyle={styles.contactBtnText}>
          CONTACT SELLER
        </AppButton>
      </View>

      <SoiBottomSheet visible={soiOpen} onClose={() => setSoiOpen(false)} />
      <PlayTourModal visible={tourOpen} onClose={() => setTourOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fefdfb' },
  heroWrap: {
    height: 268,
    width: '100%',
    position: 'relative',
    backgroundColor: '#e8e4df',
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
  playTourPill: {
    position: 'absolute',
    right: 16,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1c1c1e',
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 16,
    borderRadius: 20,
  },
  playTourPlay: { color: '#fff', fontSize: 11, fontWeight: '700' },
  playTourText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#fefdfb',
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(60,60,67,0.2)' },
  dotActive: { backgroundColor: 'rgba(60,60,67,0.55)' },
  scroll: { paddingHorizontal: PAD },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    color: '#777',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  kickerNoTop: { marginTop: 0 },
  addressTitle: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1c1c',
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  priceBlock: { marginTop: SECTION },
  priceValue: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: '800',
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
    backgroundColor: '#f5f1ed',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.14)',
    paddingVertical: 18,
    paddingHorizontal: GAP_MD,
    marginTop: 12,
    gap: 14,
  },
  soiIcon: { marginTop: 2 },
  soiBody: { flex: 1, minWidth: 0 },
  soiKicker: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(60,60,67,0.55)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  soiGuide: { marginTop: 6, fontSize: 16, fontWeight: '700', color: '#000', lineHeight: 22 },
  soiMeta: { marginTop: 6, fontSize: 13, color: 'rgba(60,60,67,0.55)', lineHeight: 18 },
  featuresGrid: { marginTop: SECTION },
  featureRow: { flexDirection: 'row', gap: 14 },
  featureCell: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 68 },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(60,60,67,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTextCol: { flex: 1, justifyContent: 'flex-start', paddingTop: 0 },
  featureLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(60,60,67,0.55)',
    textTransform: 'uppercase',
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  featureValue: { marginTop: 6, fontSize: 22, fontWeight: '600', color: '#000', lineHeight: 28 },
  featureRule: {
    marginVertical: GAP_MD,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f5f1ed',
  },
  carRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 60 },
  sectionPad: { marginTop: SECTION },
  sectionPadTop: { marginTop: SECTION, marginBottom: 10 },
  descKicker: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(60,60,67,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  descBody: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(60,60,67,0.65)',
    fontWeight: '400',
  },
  locKicker: {
    fontSize: 12,
    fontWeight: '700',
    color: '#777',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  locImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: '#e8e4df',
  },
  amenities: { marginTop: SECTION },
  agentSectionKicker: {
    marginTop: SECTION,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(60,60,67,0.55)',
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
  agentName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  agentAgency: { marginTop: 6, fontSize: 14, color: 'rgba(60,60,67,0.55)' },
  agentMeta: { marginTop: 8, fontSize: 12, color: 'rgba(60,60,67,0.55)', lineHeight: 17 },
  viewAgentBtn: {
    backgroundColor: '#1c1c1e',
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAgentBtnText: { color: '#fff', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: PAD,
    paddingTop: GAP_MD,
    backgroundColor: '#fefdfb',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(60,60,67,0.08)',
  },
  contactBtnText: { fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },
});
