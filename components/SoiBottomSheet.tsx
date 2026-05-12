import { BlurView } from 'expo-blur';
import { Text } from '@/components/OMMText';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/constants/theme';
import { AppButton, APP_BUTTON_STACK_GAP } from '@/components/AppButton';
import { DEMO_SOI_PROPERTY_LINE } from '@/lib/melbourne-demo-locations';

type Props = {
  visible: boolean;
  onClose: () => void;
  propertyLine?: string;
};

/**
 * Statement of Information — bottom sheet; backdrop uses **blur** (listing visible underneath).
 * [Figma 1053:8028](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-8028)
 */
export function SoiBottomSheet({
  visible,
  onClose,
  propertyLine = DEMO_SOI_PROPERTY_LINE,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.wrap}>
        {Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
        ) : (
          <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.22)' }]}
        />
        <View style={styles.stack}>
          <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>
            <Text style={styles.title}>Statement of Information</Text>
            <Text style={styles.subtitle}>{propertyLine}</Text>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollInner}
              showsVerticalScrollIndicator={false}
              bounces={false}>
              <View style={styles.infoCard}>
                <Text style={styles.cardMeta}>SOI · 4 pages · PDF</Text>
                <Text style={styles.cardBody}>
                  Indicative selling range and comparable sales as required by Victorian law.
                </Text>
                <Text style={styles.cardPlaceholder}>[ Preview of first page ]</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.priceLabel}>PRICE GUIDE</Text>
                <Text style={styles.priceRange}>$2,350,000 — $2,550,000</Text>
                <Text style={styles.cardDates}>Issued 12 Apr 2026 · Expires 12 Jul 2026</Text>
              </View>
            </ScrollView>

            <View style={styles.actions}>
              <AppButton variant="filled" onPress={onClose} textStyle={styles.btnPrimary}>
                OPEN FULL PDF
              </AppButton>
              <View style={{ height: APP_BUTTON_STACK_GAP }} />
              <AppButton variant="outlined" onPress={onClose} textStyle={styles.btnSecondary}>
                DOWNLOAD
              </AppButton>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  stack: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: { flex: 1 },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 8,
    maxHeight: '88%',
  },
  handleWrap: { alignItems: 'center', paddingVertical: 8 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  scroll: { maxHeight: 360 },
  scrollInner: { gap: 14, paddingBottom: 8 },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  cardMeta: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 12,
  },
  cardPlaceholder: {
    fontSize: 13,
    fontStyle: 'italic',
    color: 'rgba(0, 0, 0, 0.45)',
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.8,
    color: 'rgba(0, 0, 0, 0.55)',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  priceRange: {
    fontSize: 22,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  cardDates: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 20,
  },
  actions: { marginTop: 20, paddingTop: 4 },
  btnPrimary: { fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.5 },
  btnSecondary: { fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.5, color: 'rgba(0,0,0,0.55)' },
});
