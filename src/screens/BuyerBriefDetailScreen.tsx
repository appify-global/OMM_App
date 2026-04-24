import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { brand } from '../theme/brand';
import { getBuyerBriefDetail, type BuyerBriefDetailData } from '../data/buyerBriefs';

type Props = RootStackScreenProps<'BuyerBriefDetail'>;

const CARD_BG = '#f9f6f2';
const TERRA = '#c98367';
const H_PAD = 20;

type DetailKey = keyof Pick<
  BuyerBriefDetailData,
  'areas' | 'budget' | 'propertyType' | 'minBedrooms' | 'settlement' | 'mustHaves' | 'avoid'
>;

const FIELDS: { label: string; dataKey: DetailKey }[] = [
  { label: 'PREFERRED SUBURBS OR AREAS', dataKey: 'areas' },
  { label: 'BUDGET RANGE', dataKey: 'budget' },
  { label: 'PROPERTY TYPE', dataKey: 'propertyType' },
  { label: 'MINIMUM BEDROOMS', dataKey: 'minBedrooms' },
  { label: 'SETTLEMENT WINDOW', dataKey: 'settlement' },
  { label: 'MUST-HAVES', dataKey: 'mustHaves' },
  { label: 'AVOID', dataKey: 'avoid' },
];

function FieldBlock({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast: boolean;
}) {
  return (
    <View style={isLast ? styles.fieldColLast : styles.fieldCol}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export function BuyerBriefDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const d = getBuyerBriefDetail(route.params.id);

  if (!d) {
    return (
      <View style={styles.root}>
        <Text style={styles.miss}>Brief not found.</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.missBack}>
          <Text style={styles.missBackText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.back}
            hitSlop={10}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={26} color={brand.charcoal} />
          </Pressable>
          <Text style={styles.navTitle} numberOfLines={1}>
            Buyer brief · Detail
          </Text>
          <View style={styles.topSpacer} />
        </View>

        <ScrollView
          style={styles.scrollMain}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.profileBlock}>
            <Image source={d.contactAvatar} style={styles.avatar} />
            <Text style={styles.name}>{d.contactName}</Text>
            <Text style={styles.role}>{d.contactRole}</Text>
          </View>

          <Text style={styles.sectionLabel}>WHAT THEY ARE LOOKING FOR</Text>

          <View style={styles.card}>
            {FIELDS.map((f, i) => (
              <FieldBlock
                key={f.dataKey}
                label={f.label}
                value={d[f.dataKey]}
                isLast={i === FIELDS.length - 1}
              />
            ))}
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(16, insets.bottom) },
          ]}
        >
          <Pressable
            style={styles.btn}
            onPress={() =>
              navigation.navigate('MessageThread', {
                name: d.contactName,
                address: d.listItem.title,
              })
            }
            accessibilityLabel="Message buyer"
          >
            <Text style={styles.btnText}>MESSAGE BUYER</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  miss: { padding: 24, fontSize: 16, color: brand.charcoal },
  missBack: { marginTop: 8, marginLeft: 24 },
  missBackText: { color: brand.terracotta, fontSize: 16 },
  root: { flex: 1, backgroundColor: brand.white },
  safe: { flex: 1, paddingHorizontal: H_PAD },
  topBar: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: { width: 44, height: 44, marginLeft: -8, alignItems: 'center', justifyContent: 'center' },
  topSpacer: { width: 40 },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: brand.fontSans,
    fontSize: 16,
    fontWeight: '600',
    color: brand.charcoal,
  },
  scrollMain: { flex: 1 },
  scroll: {
    paddingTop: 4,
    paddingBottom: 20,
  },
  profileBlock: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: brand.cream,
  },
  name: {
    fontFamily: brand.fontSans,
    fontSize: 20,
    fontWeight: '600',
    color: brand.charcoal,
    marginTop: 14,
  },
  role: {
    fontFamily: brand.fontSans,
    fontSize: 15,
    color: brand.sage,
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: brand.fontSans,
    fontSize: 10,
    letterSpacing: 1.2,
    color: brand.sage,
    marginBottom: 10,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
  },
  fieldCol: { marginBottom: 20 },
  fieldColLast: { marginBottom: 0 },
  fieldLabel: {
    fontFamily: brand.fontSans,
    fontSize: 10,
    letterSpacing: 0.4,
    color: brand.sage,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  fieldValue: {
    fontFamily: brand.fontSans,
    fontSize: 16,
    lineHeight: 24,
    color: brand.charcoal,
  },
  footer: {
    paddingTop: 12,
    backgroundColor: brand.white,
  },
  btn: {
    backgroundColor: TERRA,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: brand.fontSans,
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: brand.warmWhite,
  },
});
