import React from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radii, spacing } from '../theme/theme';

const KITCHEN_IMAGE =
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80';

type Props = RootStackScreenProps<'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.heroWrap}>
          <ImageBackground source={{ uri: KITCHEN_IMAGE }} style={styles.hero} resizeMode="cover" />
        </View>
        <SafeAreaView edges={['bottom']} style={styles.panel}>
          <Text style={styles.kicker}>OMM for A-Z Real Estate</Text>
          <Text style={styles.title}>Off-market deals in one workspace.</Text>
          <Text style={styles.body}>
            Match buyer briefs, run referrals, and track commissions with a full Victorian
            compliance trail.
          </Text>
          <PrimaryButton label="Get Started" onPress={() => navigation.navigate('SignUp1')} />
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Login')}
            style={styles.footerRow}
          >
            <Text style={styles.footerMuted}>
              Already have an account? <Text style={styles.footerStrong}>Sign in</Text>
            </Text>
          </Pressable>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  heroWrap: { height: 320 },
  hero: { flex: 1 },
  panel: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 32,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footerRow: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerMuted: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footerStrong: {
    color: colors.text,
    fontWeight: '700',
  },
});
