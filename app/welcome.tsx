import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';

/**
 * Welcome — [Figma: OMM / Welcome Screen](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1286-160)
 * Node 1286:160. Specs from get_design_context (Satoshi → SF system on RN).
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ImageBackground
        source={require('@/assets/images/welcome-bg.jpg')}
        style={styles.bg}
        resizeMode="cover">
        {/* Ellipse fade in Figma → bottom-heavy linear: photo visible ~top third, white lower area */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.25)',
            'rgba(255,255,255,0.78)',
            '#FFFFFF',
          ]}
          locations={[0, 0.28, 0.42, 0.58, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradient}
        />

        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top,
              paddingBottom: Math.max(insets.bottom, 12) + 6,
            },
          ]}>
          <View style={styles.copyBlock}>
            <Image
              source={require('@/assets/images/match-logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="MATCH"
            />

            {/* 1286:195 — Satoshi Medium 30 / lh 36 */}
            <Text style={styles.headlineMuted}>Off-market deals in</Text>
            {/* 1286:196 — Satoshi Regular 30 / lh 36 */}
            <Text style={styles.headlineRegular}>one workspace.</Text>

            {/* 1286:197 — 14 Medium, rgba(107,107,115,0.85), lh 20, two paragraphs */}
            <Text style={styles.tagline}>
              OMM for A-Z Real Estate{'\n'}
              Match buyer briefs, run referrals, and track commissions with a full Victorian compliance trail.
            </Text>

            <AppButton
              variant="dashed"
              style={styles.signUpBtnWrap}
              onPress={() => router.push('/sign-up')}
              accessibilityLabel="Sign up">
              Sign Up
            </AppButton>

            {/* 1286:198 — footer, gap 6 */}
            <View style={styles.footerRow}>
              <Text style={styles.footerDark}>Already have an account?</Text>
              <Pressable onPress={() => router.push('/sign-in')} accessibilityRole="link" hitSlop={10}>
                <Text style={styles.footerMuted}>Sign in</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bg: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  copyBlock: {
    width: '100%',
    maxWidth: 384,
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 52.687,
    marginBottom: 19,
  },
  headlineMuted: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '500',
    color: 'rgba(60, 60, 67, 0.55)',
    textAlign: 'center',
    width: 340,
  },
  headlineRegular: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    width: 340,
    marginBottom: 18,
  },
  tagline: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: 'rgba(107, 107, 115, 0.85)',
    textAlign: 'center',
    width: 352,
    marginBottom: 22,
  },
  signUpBtnWrap: {
    width: '100%',
    maxWidth: 329,
    alignSelf: 'center',
    marginBottom: 24,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  footerDark: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  footerMuted: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(60, 60, 67, 0.55)',
  },
});
