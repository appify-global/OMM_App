import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/OMMText';
import { Fonts, ink } from '@/constants/theme';
import { hapticLight } from '@/lib/haptics';

/**
 * Standard push-screen header: back chevron on the left, page title beside it.
 * Layout: [←]  [Title]
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
      <Pressable
        onPress={() => {
          hapticLight();
          onClose();
        }}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={styles.backBtn}>
        <FontAwesome name="chevron-left" size={17} color={ink} />
      </Pressable>
      <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  /** Anchored to the left so it never pushes the centred title. */
  backBtn: {
    position: 'absolute',
    left: 0,
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Centred across full row width. */
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: Fonts.medium,
    color: ink,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
});
