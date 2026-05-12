import { Pressable, StyleSheet, View } from 'react-native';

import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';

import { GoogleLogoMark, MicrosoftLogoMark } from './OAuthBrandMarks';

export const OAUTH_CIRCLE_SIZE = 54;
export const OAUTH_ICON_SIZE = 26;

type Props = {
  onGooglePress: () => void | Promise<void>;
  onMicrosoftPress: () => void | Promise<void>;
  googleAccessibilityLabel?: string;
  microsoftAccessibilityLabel?: string;
};

export function OAuthProviderCircles({
  onGooglePress,
  onMicrosoftPress,
  googleAccessibilityLabel = 'Continue with Google',
  microsoftAccessibilityLabel = 'Continue with Microsoft',
}: Props) {
  return (
    <View style={styles.oauthRow}>
      <Pressable
        onPress={onGooglePress}
        style={({ pressed }) => [styles.oauthCircle, pressed && styles.oauthCirclePressed]}
        accessibilityRole="button"
        accessibilityLabel={googleAccessibilityLabel}
        hitSlop={8}>
        <GoogleLogoMark size={OAUTH_ICON_SIZE} />
      </Pressable>
      <Pressable
        onPress={onMicrosoftPress}
        style={({ pressed }) => [styles.oauthCircle, pressed && styles.oauthCirclePressed]}
        accessibilityRole="button"
        accessibilityLabel={microsoftAccessibilityLabel}
        hitSlop={8}>
        <MicrosoftLogoMark size={OAUTH_ICON_SIZE} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  oauthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  oauthCircle: {
    width: OAUTH_CIRCLE_SIZE,
    height: OAUTH_CIRCLE_SIZE,
    borderRadius: OAUTH_CIRCLE_SIZE / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oauthCirclePressed: {
    opacity: 0.82,
  },
});
