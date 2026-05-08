import { type Href, useRouter } from 'expo-router';
import { Text } from '@/components/OMMText';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useScreenHorizontalPadding } from '@/lib/useScreenHorizontalPadding';

/**
 * Buyer lead detail (buyer agent brief).
 * [Figma 1053:7004](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-7004&t=gEfFuYKIwBHVUzXh-4)
 */

import { PROPERTY_IMG_1 } from '@/lib/propertyImages';

const PAD = 20;

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
  const hPad = useScreenHorizontalPadding();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.headBlock, hPad]}>
        <ScreenHeader title="Buyer brief" onBack={() => router.back()} />
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
  headBlock: { paddingTop: 8, paddingBottom: 4 },
  scroll: { paddingHorizontal: PAD, paddingTop: 8 },
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
    paddingHorizontal: PAD,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  messageCta: { fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.8 },
});
