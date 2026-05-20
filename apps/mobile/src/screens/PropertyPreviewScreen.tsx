import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { getPropertyPreview } from '../data/propertyPreview';
import { brand } from '../theme/brand';

type Props = RootStackScreenProps<'PropertyPreview'>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_H = 280;
const H_PAD = 20;
const SAGE_ICON_BG = 'rgba(138, 155, 142, 0.18)';
const MODAL_DARK = '#1f1f1f';
const SOI_CREAM = '#f5f1ed';

export function PropertyPreviewScreen({ navigation, route }: Props) {
  const { listingId } = route.params;
  const d = getPropertyPreview(listingId);
  const insets = useSafeAreaInsets();
  const [slide, setSlide] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [soiOpen, setSoiOpen] = useState(false);

  const titleShort = useMemo(
    () => d.addressLine.split(',')[0]?.trim() || d.addressLine,
    [d.addressLine],
  );
  const walkthroughSub = `WALK-THROUGH - ${d.videoLabel}`;
  const soiAddress =
    d.soi.sheetAddress ?? d.addressLine.replace(/,/g, ' ·');
  const soiPriceRange = d.soi.priceRangeDisplay ?? d.listPrice;
  const soiValid =
    d.soi.validityOneLine ?? `${d.soi.issued} · ${d.soi.expires}`;

  const openVideo = () => setVideoOpen(true);
  const goMessageSeller = () =>
    navigation.navigate('MessageThread', { name: d.agent.name, address: d.addressLine });

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / SCREEN_W);
    if (i >= 0 && i < d.gallery.length) setSlide(i);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={styles.heroWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
            decelerationRate="fast"
            snapToInterval={SCREEN_W}
            snapToAlignment="center"
          >
            {d.gallery.map((src, i) => (
              <Image
                key={i}
                source={src}
                style={{ width: SCREEN_W, height: HERO_H }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <SafeAreaView style={styles.heroOverlay} edges={['top']}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={[styles.backFab, { marginTop: Math.max(insets.top, 4) }]}
              hitSlop={10}
              accessibilityLabel="Back"
            >
              <Ionicons name="chevron-back" size={24} color={brand.charcoal} />
            </Pressable>
          </SafeAreaView>

          <View style={styles.playCenter} pointerEvents="box-none">
            <Pressable
              onPress={openVideo}
              style={styles.playCenterRing}
              hitSlop={20}
              accessibilityLabel="Play property tour preview"
            >
              <Ionicons name="play" size={28} color={brand.warmWhite} style={styles.playCenterIcon} />
            </Pressable>
          </View>

          <Pressable style={styles.playPill} onPress={openVideo} accessibilityLabel="Play tour">
            <Ionicons name="play" size={14} color={brand.warmWhite} />
            <Text style={styles.playPillText}>PLAY TOUR · {d.videoLabel}</Text>
          </Pressable>
          <View style={styles.dotsRow}>
            {d.gallery.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === slide ? styles.dotOn : styles.dotOff]}
              />
            ))}
          </View>
        </View>

        <View style={styles.padded}>
          <Text style={styles.labelUpper}>Property address</Text>
          <Text style={styles.addressTitle}>{d.addressLine}</Text>

          <Text style={[styles.labelUpper, styles.gapLabel]}>Listing price</Text>
          <Text style={styles.priceTitle}>{d.listPrice}</Text>

          <View style={styles.hRule} />

          <Pressable style={styles.soiCard} onPress={() => setSoiOpen(true)}>
            <View style={styles.soiIconWrap}>
              <Ionicons name="document-text-outline" size={24} color={brand.sage} />
            </View>
            <View style={styles.soiMid}>
              <Text style={styles.soiKicker}>STATEMENT OF INFORMATION</Text>
              <Text style={styles.soiPrice}>{d.soi.priceGuide}</Text>
              <Text style={styles.soiMeta}>
                {d.soi.issued} - {d.soi.expires}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={brand.sage} />
          </Pressable>

          <View style={styles.specGrid}>
            <View style={styles.specCell}>
              <View style={styles.iconCircle}>
                <Ionicons name="bed-outline" size={20} color={brand.sage} />
              </View>
              <Text style={styles.specN}>{d.beds}</Text>
            </View>
            <View style={styles.specCell}>
              <View style={styles.iconCircle}>
                <Ionicons name="water-outline" size={20} color={brand.sage} />
              </View>
              <Text style={styles.specN}>{d.baths}</Text>
            </View>
            <View style={styles.specCell}>
              <View style={styles.iconCircle}>
                <Ionicons name="car-outline" size={20} color={brand.sage} />
              </View>
              <Text style={styles.specN}>{d.cars}</Text>
            </View>
          </View>

          <Text style={styles.labelUpperDim}>Description</Text>
          <Text style={styles.bodyGrey}>{d.description}</Text>

          <Text style={[styles.labelUpperDim, styles.gapSect]}>Location</Text>
          <View style={styles.mapShot}>
            <Image
              source={d.locationExterior}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
          </View>

          <View style={styles.amenityGrid}>
            <View style={styles.amenityItem}>
              <View style={styles.amenityIcon}>
                <Ionicons name="school-outline" size={18} color={brand.sage} />
              </View>
              <View>
                <Text style={styles.amenityK}>Nearby school</Text>
                <Text style={styles.amenityV}>{d.amenities.school}</Text>
              </View>
            </View>
            <View style={styles.amenityItem}>
              <View style={styles.amenityIcon}>
                <Ionicons name="storefront-outline" size={18} color={brand.sage} />
              </View>
              <View>
                <Text style={styles.amenityK}>Nearby mall</Text>
                <Text style={styles.amenityV}>{d.amenities.mall}</Text>
              </View>
            </View>
            <View style={styles.amenityItem}>
              <View style={styles.amenityIcon}>
                <Ionicons name="cart-outline" size={18} color={brand.sage} />
              </View>
              <View>
                <Text style={styles.amenityK}>Nearby supermarket</Text>
                <Text style={styles.amenityV}>{d.amenities.supermarket}</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.labelUpperDim, styles.gapSect]}>Listing agent</Text>
          <View style={styles.agentCard}>
            <Image source={d.agent.image} style={styles.agentAvatar} />
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{d.agent.name}</Text>
              <Text style={styles.agentAgency}>{d.agent.agency}</Text>
              <Text style={styles.agentMeta}>
                ★ {d.agent.rating} · {d.agent.reviewCount} reviews · {d.agent.listingCount} listings
              </Text>
            </View>
            <Pressable
              style={styles.viewAgentPill}
              onPress={() =>
                navigation.navigate('AgentProfile', { agentName: d.agent.name })
              }
            >
              <Text style={styles.viewAgentText}>VIEW →</Text>
            </Pressable>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.ctaSafe}>
        <Pressable
          style={styles.ctaBtn}
          onPress={goMessageSeller}
          accessibilityRole="button"
          accessibilityLabel="Contact seller"
        >
          <Text style={styles.ctaLabel}>CONTACT SELLER</Text>
        </Pressable>
      </SafeAreaView>

      <Modal
        visible={videoOpen}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setVideoOpen(false)}
      >
        <View style={styles.vidBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVideoOpen(false)} />
          <View style={styles.vidCard}>
            <View style={styles.vidHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.vidTitle}>{titleShort}</Text>
                <Text style={styles.vidSub}>{walkthroughSub}</Text>
              </View>
              <Pressable
                onPress={() => setVideoOpen(false)}
                style={styles.vidClose}
                hitSlop={8}
                accessibilityLabel="Close video"
              >
                <Ionicons name="close" size={20} color={brand.warmWhite} />
              </Pressable>
            </View>
            <View style={styles.vidFrame}>
              <Image
                source={d.gallery[0]!}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
              <View style={styles.vidFrameOverlay} />
              <View style={styles.vidBadgeRow}>
                <View style={styles.vidPillSm}>
                  <Text style={styles.vidPillSmT}>AGENT WALK-THROUGH</Text>
                </View>
                <Text style={styles.vidTimer}>0:00 / {d.videoLabel}</Text>
              </View>
              <Pressable style={styles.vidMainPlay} hitSlop={16} accessibilityLabel="Play video">
                <View style={styles.vidMainPlayInner}>
                  <Ionicons name="play" size={36} color={brand.warmWhite} style={{ marginLeft: 4 }} />
                </View>
              </Pressable>
              <View style={styles.vidProgressRow}>
                <View style={styles.vidBarBg}>
                  <View style={[styles.vidBarFill, { width: '0%' }]} />
                </View>
              </View>
            </View>
            <View style={styles.vidControlsRow}>
              <View style={styles.vidControlsL}>
                <Ionicons name="play-skip-back" size={22} color={brand.warmWhite} />
                <Ionicons name="play" size={24} color={brand.warmWhite} style={styles.vidPadH} />
                <Ionicons name="play-skip-forward" size={22} color={brand.warmWhite} />
              </View>
              <View style={styles.vidControlsR}>
                <Ionicons name="musical-notes-outline" size={20} color={brand.warmWhite} />
                <Ionicons name="expand-outline" size={20} color={brand.warmWhite} style={styles.vidPadL} />
              </View>
            </View>
            <View style={styles.vidFooterRow}>
              <View style={styles.vidRec}>
                <View style={styles.vidRecDot} />
                <Text style={styles.vidRecT}>RECORDED 14 APR · AGENT</Text>
              </View>
              <Pressable style={styles.vidSavePill}>
                <Ionicons name="arrow-down" size={14} color={brand.charcoal} />
                <Text style={styles.vidSaveT}>SAVE</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={soiOpen}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setSoiOpen(false)}
      >
        <View style={styles.soiModalRoot}>
          <Pressable
            style={styles.soiBackdrop}
            onPress={() => setSoiOpen(false)}
            accessibilityLabel="Close"
          />
          <View style={[styles.soiSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.soiHandle} />
            <Text style={styles.soiSheetTitle}>Statement of Information</Text>
            <Text style={styles.soiSheetSub}>{soiAddress}</Text>

            <View style={styles.soiDocCard}>
              <Text style={styles.soiDocMeta}>SOI · 4 pages · PDF</Text>
              <Text style={styles.soiDocBody}>
                Indicative selling range and comparable sales as required by Victorian law.
              </Text>
              <Text style={styles.soiDocPh}>[ Preview of first page ]</Text>
            </View>

            <View style={styles.soiPriceCard}>
              <Text style={styles.soiPriceK}>PRICE GUIDE</Text>
              <Text style={styles.soiPriceBig}>{soiPriceRange}</Text>
              <Text style={styles.soiPriceDates}>{soiValid}</Text>
            </View>

            <Pressable
              style={styles.soiBtnPrimary}
              onPress={() => setSoiOpen(false)}
            >
              <Text style={styles.soiBtnPrimaryT}>OPEN FULL PDF</Text>
            </Pressable>
            <Pressable
              style={styles.soiBtnSec}
              onPress={() => setSoiOpen(false)}
            >
              <Text style={styles.soiBtnSecT}>DOWNLOAD</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.warmWhite },
  mainScroll: { flex: 1 },
  mainScrollContent: { paddingBottom: 0 },
  heroWrap: {
    position: 'relative',
    width: SCREEN_W,
    height: HERO_H,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  backFab: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCenterRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCenterIcon: {
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playPill: {
    position: 'absolute',
    bottom: 32,
    right: H_PAD,
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: brand.terracotta,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playPillText: {
    color: brand.warmWhite,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotOn: { backgroundColor: brand.warmWhite },
  dotOff: { backgroundColor: 'rgba(255,255,255,0.45)' },
  padded: { paddingHorizontal: H_PAD, paddingTop: 20 },
  labelUpper: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: brand.charcoal,
  },
  gapLabel: { marginTop: 20 },
  addressTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: brand.charcoal,
    marginTop: 6,
    lineHeight: 30,
  },
  priceTitle: { fontSize: 22, fontWeight: '700', color: brand.charcoal, marginTop: 6 },
  hRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(138,155,142,0.35)',
    marginVertical: 20,
  },
  soiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SAGE_ICON_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.3)',
    padding: 14,
    gap: 10,
  },
  soiIconWrap: { justifyContent: 'center' },
  soiMid: { flex: 1, minWidth: 0 },
  soiKicker: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, color: brand.sage },
  soiPrice: { fontSize: 14, fontWeight: '600', color: brand.charcoal, marginTop: 4 },
  soiMeta: { fontSize: 11, color: brand.sage, marginTop: 4 },
  specGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 22,
    marginBottom: 8,
  },
  specCell: { alignItems: 'center', gap: 6 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SAGE_ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specN: { fontSize: 16, fontWeight: '700', color: brand.charcoal },
  labelUpperDim: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: brand.charcoal,
    marginTop: 18,
  },
  bodyGrey: {
    fontSize: 15,
    lineHeight: 22,
    color: brand.sage,
    marginTop: 8,
  },
  gapSect: { marginTop: 24 },
  mapShot: { height: 180, borderRadius: 10, overflow: 'hidden', marginTop: 10, backgroundColor: brand.cream },
  amenityGrid: { marginTop: 16, gap: 14 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  amenityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SAGE_ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityK: { fontSize: 12, color: brand.sage },
  amenityV: { fontSize: 14, fontWeight: '600', color: brand.charcoal, marginTop: 2 },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.white,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    gap: 10,
    shadowColor: brand.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  agentAvatar: { width: 52, height: 52, borderRadius: 26 },
  agentInfo: { flex: 1, minWidth: 0 },
  agentName: { fontSize: 16, fontWeight: '700', color: brand.charcoal },
  agentAgency: { fontSize: 13, color: brand.sage, marginTop: 2 },
  agentMeta: { fontSize: 12, color: brand.sage, marginTop: 4 },
  viewAgentPill: {
    backgroundColor: brand.terracotta,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewAgentText: { color: brand.warmWhite, fontSize: 10, fontWeight: '800' },
  ctaSafe: {
    backgroundColor: brand.warmWhite,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(138,155,142,0.25)',
    paddingHorizontal: H_PAD,
    paddingTop: 10,
  },
  ctaBtn: {
    backgroundColor: brand.terracotta,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaLabel: { color: brand.warmWhite, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },

  vidBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 12,
    minHeight: SCREEN_H * 0.4,
  },
  vidCard: {
    backgroundColor: MODAL_DARK,
    borderRadius: 16,
    padding: 14,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
  },
  vidHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  vidTitle: { color: brand.warmWhite, fontSize: 16, fontWeight: '700' },
  vidSub: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 4, fontWeight: '500' },
  vidClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vidFrame: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  vidFrameOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  vidBadgeRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  vidPillSm: { backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  vidPillSmT: { color: brand.warmWhite, fontSize: 8, fontWeight: '800', letterSpacing: 0.3 },
  vidTimer: { color: brand.warmWhite, fontSize: 12, fontWeight: '500' },
  vidMainPlay: { ...StyleSheet.absoluteFillObject, zIndex: 0, alignItems: 'center', justifyContent: 'center' },
  vidMainPlayInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  vidProgressRow: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 8, paddingBottom: 6 },
  vidBarBg: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  vidBarFill: { height: 3, borderRadius: 2, backgroundColor: brand.warmWhite },
  vidControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  vidControlsL: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  vidControlsR: { flexDirection: 'row', alignItems: 'center' },
  vidPadH: { marginHorizontal: 4 },
  vidPadL: { marginLeft: 12 },
  vidFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 10,
  },
  vidRec: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  vidRecDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.7)' },
  vidRecT: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '600', letterSpacing: 0.2 },
  vidSavePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: brand.warmWhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  vidSaveT: { color: brand.charcoal, fontSize: 11, fontWeight: '800' },

  soiModalRoot: { flex: 1, justifyContent: 'flex-end' },
  soiBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  soiSheet: {
    backgroundColor: brand.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: H_PAD,
    paddingTop: 8,
    maxHeight: SCREEN_H * 0.92,
    zIndex: 1,
  },
  soiHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  soiSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: brand.charcoal,
    textAlign: 'center',
  },
  soiSheetSub: { fontSize: 13, color: brand.sage, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  soiDocCard: {
    backgroundColor: SOI_CREAM,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.25)',
    padding: 14,
    marginTop: 20,
  },
  soiDocMeta: { fontSize: 11, color: brand.sage, fontWeight: '600' },
  soiDocBody: { fontSize: 14, color: brand.charcoal, marginTop: 8, lineHeight: 21 },
  soiDocPh: { fontSize: 12, color: brand.sage, fontStyle: 'italic', marginTop: 10 },
  soiPriceCard: {
    backgroundColor: SOI_CREAM,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.25)',
    padding: 14,
    marginTop: 12,
  },
  soiPriceK: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, color: brand.sage },
  soiPriceBig: { fontSize: 20, fontWeight: '700', color: brand.charcoal, marginTop: 6 },
  soiPriceDates: { fontSize: 12, color: brand.sage, marginTop: 8 },
  soiBtnPrimary: {
    backgroundColor: brand.terracotta,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  soiBtnPrimaryT: { color: brand.warmWhite, fontSize: 13, fontWeight: '800', letterSpacing: 0.6 },
  soiBtnSec: {
    backgroundColor: brand.white,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(26,26,26,0.35)',
    marginBottom: 8,
  },
  soiBtnSecT: { color: brand.charcoal, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
});
