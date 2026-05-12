import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import { Text } from '@/components/OMMText';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/constants/theme';
import { AppButton } from '@/components/AppButton';

/**
 * Buyer lead detail (buyer agent brief).
 * [Figma 1053:7004](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-7004&t=gEfFuYKIwBHVUzXh-4)
 */

import { PROPERTY_IMG_1 } from '@/lib/propertyImages';


function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const DEMO_BUYER_AGENT = {
  name: 'Jane Doe',
  role: 'Buyer agent',
  suburbs: 'Brunswick, Northcote, Coburg (north of Bell St)',
  budget: '$1.80m – $2.60m · flexible if sole mandate',
  propertyType: 'Period home or renovated townhouse · 3–4 beds',
  minBeds: '3+ (4 preferred)',
  settlement: '60–90 days',
  mustHaves: 'North-facing living · 2 car spaces · walkable schools',
  avoid: 'Main road frontage · apartment towers',
};

export default function BuyerLeadDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backBtn}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.profileBlock}>
          <Image source={PROPERTY_IMG_1} style={styles.avatar} resizeMode="cover" />
          <Text style={styles.name}>{DEMO_BUYER_AGENT.name}</Text>
          <Text style={styles.role}>{DEMO_BUYER_AGENT.role}</Text>
        </View>

        <Text style={styles.sectionKicker}>WHAT THEY ARE LOOKING FOR</Text>

        <View style={styles.card}>
          <FieldBlock label="PREFERRED SUBURBS OR AREAS" value={DEMO_BUYER_AGENT.suburbs} />
          <FieldBlock label="BUDGET RANGE" value={DEMO_BUYER_AGENT.budget} />
          <FieldBlock label="PROPERTY TYPE" value={DEMO_BUYER_AGENT.propertyType} />
          <FieldBlock label="MINIMUM BEDROOMS" value={DEMO_BUYER_AGENT.minBeds} />
          <FieldBlock label="SETTLEMENT WINDOW" value={DEMO_BUYER_AGENT.settlement} />
          <FieldBlock label="MUST-HAVES" value={DEMO_BUYER_AGENT.mustHaves} />
          <FieldBlock label="AVOID" value={DEMO_BUYER_AGENT.avoid} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <AppButton
          variant="filled"
          onPress={() => router.push('/contact-seller-chat' as Href)}
          textStyle={styles.messageCta}>
          MESSAGE BUYER
        </AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  topBar: { paddingHorizontal: layout.screenGutter, paddingVertical: 8 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  scroll: { paddingHorizontal: layout.screenGutter, paddingTop: 8 },
  profileBlock: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginBottom: 14,
  },
  name: { fontSize: 22, fontFamily: 'Satoshi-Medium', color: '#000000' },
  role: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)', marginTop: 6, textAlign: 'center' },
  sectionKicker: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#f5f1eb',
    borderRadius: 14,
    padding: 18,
    gap: 18,
  },
  fieldBlock: { gap: 6 },
  fieldLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    letterSpacing: 0.35,
  },
  fieldValue: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000', lineHeight: 22 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  messageCta: { fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.8 },
});
