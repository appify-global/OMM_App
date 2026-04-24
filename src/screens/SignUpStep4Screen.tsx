import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import type { RootStackScreenProps } from '../navigation/types';
import { useSignUp } from '../context/SignUpContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radii, spacing } from '../theme/theme';

type Props = RootStackScreenProps<'SignUp4'>;

export function SignUpStep4Screen({ navigation }: Props) {
  const { reset } = useSignUp();

  const signOut = () => {
    reset();
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] }));
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <View style={styles.iconCircle}>
            <Ionicons name="hourglass-outline" size={40} color={colors.text} />
          </View>
          <Text style={styles.title}>Verification in progress</Text>
          <Text style={styles.body}>
            Unlisted is exclusive to verified real estate agents. We are reviewing your licence and ID.
            You will be able to access listings, message agents, and submit offers once approved.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>APPLICATION STATUS</Text>
            <StatusRow state="done" label="Application submitted" isLast={false} />
            <StatusRow state="current" label="Documents being reviewed" isLast={false} />
            <StatusRow state="upcoming" label="Account approved" isLast />
          </View>

          <View style={styles.noteRow}>
            <Ionicons name="information-circle-outline" size={17} color={colors.textMuted} />
            <Text style={styles.note}>Typically 24–48 business hours</Text>
          </View>

          <PrimaryButton
            label="Contact support"
            tone="verification"
            onPress={() => navigation.navigate('ContactSupport')}
          />

          <Pressable onPress={signOut} style={styles.signOut} hitSlop={12}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusRow({
  state,
  label,
  isLast,
}: {
  state: 'done' | 'current' | 'upcoming';
  label: string;
  isLast: boolean;
}) {
  return (
    <View style={[styles.statusRow, isLast && styles.statusRowLast]}>
      {state === 'done' ? (
        <View style={[styles.dot, styles.dotFilled]} />
      ) : state === 'current' ? (
        <View style={[styles.dot, styles.dotRing]} />
      ) : (
        <View style={[styles.dot, styles.dotUpcoming]} />
      )}
      <Text
        style={[
          styles.statusLabel,
          state === 'upcoming' && styles.statusLabelMuted,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  inner: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    alignItems: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.verificationIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl + 4,
    paddingHorizontal: spacing.sm,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg + 2,
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    alignSelf: 'stretch',
  },
  cardTitle: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    fontWeight: '500',
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  statusRowLast: {
    marginBottom: 0,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dotFilled: {
    backgroundColor: colors.text,
  },
  dotRing: {
    borderWidth: 2,
    borderColor: colors.text,
    backgroundColor: 'transparent',
  },
  dotUpcoming: {
    backgroundColor: colors.statusPendingFill,
  },
  statusLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  statusLabelMuted: {
    color: colors.textMuted,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.xl + 8,
    paddingHorizontal: spacing.md,
  },
  note: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  signOut: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  signOutText: {
    fontSize: 15,
    color: colors.text,
    textDecorationLine: 'underline',
    fontWeight: '500',
    textAlign: 'center',
  },
});
