import FontAwesome from '@expo/vector-icons/FontAwesome';
import Slider from '@react-native-community/slider';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  PL_PAD,
  PL_BORDER,
  PL_CARD,
  PrimaryCta,
  PublishStepHeader,
  dashedShell,
  useListingFlowBottomPad,
} from './_shared';

const STRUCTURE_OPTS = ['STANDARD %', 'Tiered', 'Flat fee'] as const;
const TYPE_OPTS = ['EXCLUSIVE', 'Open', 'Auction'] as const;

export default function PublishListingReferral() {
  const router = useRouter();
  const bottomPad = useListingFlowBottomPad();
  const [pct, setPct] = useState(10);
  const [structure, setStructure] = useState('');
  const [listingType, setListingType] = useState('');
  const [modal, setModal] = useState<null | 'structure' | 'type'>(null);

  const saveDraft = useCallback(() => {
    Alert.alert('Draft saved', 'Your listing draft has been saved.');
  }, []);

  return (
    <View style={[styles.root, { paddingBottom: bottomPad }]}>
      <PublishStepHeader step={4} onBack={() => router.back()} onSaveDraft={saveDraft} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Referral Fee</Text>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>REFERRAL FEE</Text>
            <View style={styles.recBadge}>
              <Text style={styles.recBadgeText}>RECOMMENDED: 25%</Text>
            </View>
          </View>
          <View style={styles.heroPctRow}>
            <Text style={styles.heroPct}>{pct}</Text>
            <Text style={styles.heroPctSuffix}>%</Text>
          </View>
          <View style={styles.heroRule} />
          <Text style={styles.heroFoot}>INDUSTRY STANDARD: 25% – 30%</Text>
        </View>

        <View style={styles.sliderBlock}>
          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={50}
            step={1}
            value={pct}
            onValueChange={setPct}
            minimumTrackTintColor="#1a1a1a"
            maximumTrackTintColor="#e8e4df"
            thumbTintColor="#fff"
          />
          <View style={styles.tickRow}>
            {['10%', '20%', '25%', '30%', '50%'].map((t) => (
              <Text key={t} style={styles.tick}>
                {t}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.earnCard}>
          <Text style={styles.earnKicker}>YOU EARN (AUD) ON LISTING PRICE RANGE</Text>
          <Text style={styles.earnBig} numberOfLines={1}>
            —
          </Text>
          <Text style={styles.earnSub}>Estimates appear after you set a listing price in step 1.</Text>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.pickerCol}>
            <Text style={styles.pickerLabel}>STRUCTURE</Text>
            <Pressable
              onPress={() => setModal('structure')}
              style={[styles.pickerField, dashedShell, styles.pickerInner]}>
              <Text style={[styles.pickerVal, !structure && styles.pickerPlaceholder]}>
                {structure || 'Select'}
              </Text>
              <FontAwesome name="chevron-down" size={11} color={PL_BORDER} />
            </Pressable>
          </View>
          <View style={styles.pickerCol}>
            <Text style={styles.pickerLabel}>TYPE</Text>
            <Pressable
              onPress={() => setModal('type')}
              style={[styles.pickerField, styles.pickerOutlined, dashedShell, styles.pickerInner]}>
              <Text style={[styles.pickerVal, !listingType && styles.pickerPlaceholder]}>
                {listingType || 'Select'}
              </Text>
              <FontAwesome name="chevron-down" size={11} color={PL_BORDER} />
            </Pressable>
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={{ paddingBottom: 6 }}>
        <PrimaryCta label="CONTINUE" onPress={() => router.push('/add/review' as Href)} />
      </View>

      <Modal visible={modal !== null} transparent animationType="fade">
        <Pressable style={styles.modalScrim} onPress={() => setModal(null)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{modal === 'structure' ? 'Structure' : 'Type'}</Text>
            {(modal === 'structure' ? STRUCTURE_OPTS : TYPE_OPTS).map((o) => (
              <Pressable
                key={o}
                style={styles.modalOpt}
                onPress={() => {
                  if (modal === 'structure') setStructure(o);
                  else setListingType(o);
                  setModal(null);
                }}>
                <Text style={styles.modalOptText}>{o}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingTop: 12, paddingHorizontal: PL_PAD, paddingBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: '500', color: '#000', marginBottom: 20 },

  heroCard: {
    backgroundColor: PL_CARD,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    minHeight: 225,
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0.55,
  },
  recBadge: {
    borderWidth: 1,
    borderColor: 'rgba(200,125,95,0.4)',
    backgroundColor: 'rgba(200,125,95,0.2)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  recBadgeText: { fontSize: 11, fontWeight: '600', color: '#fff', letterSpacing: 0.35 },
  heroPctRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 16 },
  heroPct: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
    lineHeight: 80,
  },
  heroPctSuffix: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 14,
    marginLeft: 2,
  },
  heroRule: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(248,248,248,0.14)',
    marginTop: 20,
    paddingTop: 16,
  },
  heroFoot: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 0.35,
    lineHeight: 17,
  },

  sliderBlock: { marginBottom: 20 },
  slider: { width: '100%', height: 36 },
  tickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  tick: { fontSize: 11, fontWeight: '500', color: PL_BORDER },

  earnCard: {
    backgroundColor: PL_CARD,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 22,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
  earnKicker: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.55,
    marginBottom: 10,
    lineHeight: 16,
  },
  earnBig: { fontSize: 28, fontWeight: '500', color: '#fff', lineHeight: 38 },
  earnSub: {
    fontSize: 15,
    fontWeight: '400',
    color: '#fff',
    opacity: 0.96,
    marginTop: 10,
    lineHeight: 22,
  },

  twoCol: { flexDirection: 'row', gap: 12 },
  pickerCol: { flex: 1 },
  pickerLabel: {
    fontSize: 10,
    color: PL_BORDER,
    letterSpacing: 0.1,
    marginBottom: 8,
  },
  pickerField: { borderRadius: 14, minHeight: 54 },
  pickerOutlined: {},
  pickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  pickerVal: { fontSize: 14, color: '#000' },
  pickerPlaceholder: { color: 'rgba(60,60,67,0.35)' },

  modalScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  modalOpt: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e8e4df' },
  modalOptText: { fontSize: 16, color: '#1a1a1a' },
});
