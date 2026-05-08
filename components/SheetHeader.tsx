import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/OMMText';
import { Fonts, ink, inkMuted } from '@/constants/theme';
import { hapticLight } from '@/lib/haptics';

/**
 * Header for screens presented as bottom sheets / modals (e.g. Notifications, Messages).
 * Pure title row with a close glyph on the right — the sheet's own grabber sits above it,
 * so we deliberately skip safe-area top padding.
 */
export function SheetHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
      <Pressable
        onPress={() => {
          hapticLight();
          onClose();
        }}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={({ pressed }) => [styles.closeBtn, pressed && styles.closePressed]}>
        <FontAwesome name="times" size={16} color={ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: Fonts.medium,
    color: ink,
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(120, 120, 128, 0.16)',
    marginLeft: 12,
  },
  closePressed: {
    opacity: 0.55,
  },
  _muted: { color: inkMuted },
});
