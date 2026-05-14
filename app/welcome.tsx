import { Text } from "@/components/OMMText";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OAuthProviderCircles } from "@/components/oauth/OAuthProviderCircles";

/**
 * Welcome — [Figma: OMM / Welcome Screen](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1286-160)
 * Sign Up CTA [1286:188](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1286-188): 54pt tall,
 * **rounded rect** `radius: 14` (not a stadium / circle), full-width row — **no outline** (shadow-only lift).
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ImageBackground
        source={require("@/assets/images/welcome-bg.jpg")}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Ellipse fade in Figma → bottom-heavy linear: photo visible ~top third, white lower area */}
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.25)",
            "rgba(255,255,255,0.78)",
            "#FFFFFF",
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
              paddingBottom:
                Math.max(insets.bottom, 16) + (Platform.OS === "ios" ? 8 : 6),
            },
          ]}
        >
          <View style={styles.copyBlock}>
            <Image
              source={require("@/assets/images/match-logo.png")}
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
              OMM for A-Z Real Estate{"\n"}
              Run listings and referrals, and track commissions with a full
              Victorian compliance trail.
            </Text>

            {/* CTA stack: `gap` avoids margin-collapse / shadow weirdness between button and SSO row. */}
            <View style={styles.welcomeCtaStack}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign up"
                onPress={() => router.push("/sign-up")}
                style={({ pressed }) => [
                  styles.signUpBtnOuter,
                  pressed && styles.signUpBtnPressed,
                ]}
              >
                <View style={styles.signUpBtnFace}>
                  <Text style={styles.signUpBtnLabel}>Sign Up</Text>
                </View>
              </Pressable>

              <View style={styles.oauthWrap}>
                <OAuthProviderCircles
                  onGooglePress={() => router.push("/sign-up")}
                  onMicrosoftPress={() => router.push("/sign-up")}
                  googleAccessibilityLabel="Sign Up with Google"
                  microsoftAccessibilityLabel="Sign Up with Microsoft Account"
                />
              </View>
            </View>

            {/* 1286:198 — footer, gap 6 */}
            <View style={styles.footerRow}>
              <Text style={styles.footerDark}>Already have an account?</Text>
              <Pressable
                onPress={() => router.push("/sign-in")}
                accessibilityRole="link"
                hitSlop={10}
              >
                <Text style={styles.footerMuted}>Sign in</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

/** Figma 1286:189 — Button face */
const SIGN_UP_BTN_H = 54;
/** Figma `rounded-[14px]` — fixed corner radius = horizontal rounded rectangle (not capsule / not circle). */
const SIGN_UP_BTN_CORNER = 14;
/** Space under body copy → moves white CTA upward vs tagline ↔ button rhythm. */
const WELCOME_TAGLINE_TO_SIGNUP = 18;
/** Space between SSO icons and footer (“Already have an account?”). */
const WELCOME_OAUTH_TO_FOOTER_GAP = 22;
/** Vertical space between Sign Up (incl. shadow) and SSO icon row — `gap` on parent, not margin on Pressable. */
const WELCOME_SIGNUP_TO_OAUTH_GAP = 44;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  bg: {
    flex: 1,
    width: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "stretch",
    /** Slightly tighter than auth (32): reference reads ~22–26pt edge → CTA inset. */
    paddingHorizontal: 24,
  },
  copyBlock: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    /**
     * `alignItems: "center"` shrink-wraps full-width siblings (Pressable ignores % width → tiny button).
     * Stretch the column; center logo/copy with `alignSelf` on those nodes only.
     */
    alignItems: "stretch",
  },
  logo: {
    alignSelf: "center",
    width: 220,
    height: 52.687,
    marginBottom: 28,
  },
  headlineMuted: {
    alignSelf: "center",
    fontSize: 30,
    lineHeight: 36,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.55)",
    textAlign: "center",
    width: 340,
    marginBottom: 6,
  },
  headlineRegular: {
    alignSelf: "center",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "400",
    color: "#000000",
    textAlign: "center",
    width: 340,
    marginBottom: 14,
  },
  /** Sign Up + OAuth: single column with explicit row gap (reliable on iOS / Android / web). */
  welcomeCtaStack: {
    width: "100%",
    gap: WELCOME_SIGNUP_TO_OAUTH_GAP,
  },
  tagline: {
    alignSelf: "center",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Satoshi-Medium",
    color: "rgba(107, 107, 115, 0.85)",
    textAlign: "center",
    width: 352,
    marginBottom: WELCOME_TAGLINE_TO_SIGNUP,
  },
  /** Shadow host matches 14px corners (Figma 1286:188 drop shadow). Spacing to SSO row → parent `welcomeCtaStack` `gap`. */
  signUpBtnOuter: {
    width: "100%",
    alignSelf: "stretch",
    borderRadius: SIGN_UP_BTN_CORNER,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  signUpBtnPressed: { opacity: 0.88 },
  /** Borderless face — soft shadow on wrapper gives depth (no hairline). */
  signUpBtnFace: {
    width: "100%",
    height: SIGN_UP_BTN_H,
    borderRadius: SIGN_UP_BTN_CORNER,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  signUpBtnLabel: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "#454545",
    letterSpacing: -0.14,
  },
  oauthWrap: {
    width: "100%",
    alignItems: "center",
    marginBottom: WELCOME_OAUTH_TO_FOOTER_GAP,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
    alignSelf: "center",
    paddingVertical: 2,
  },
  footerDark: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
  },
  footerMuted: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.55)",
  },
});
