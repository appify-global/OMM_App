import { Text } from '@/components/OMMText';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { layout } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Opens the in-app seller message thread. */
  onMessageSeller: () => void;
  /** Opens contact details (name, email, etc.). */
  onContactInfo: () => void;
};

/**
 * Bottom sheet - choose messaging vs viewing contact info (vendor / match detail).
 */
export function ContactSellerOptionsSheet({
  visible,
  onClose,
  onMessageSeller,
  onContactInfo,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.stack}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
          <Text style={styles.title}>Contact seller</Text>
          <Text style={styles.hint}>Message in the app or open name and email.</Text>

          <View style={styles.menu}>
            <Pressable
              style={styles.menuRow}
              onPress={onMessageSeller}
              accessibilityRole="button"
              accessibilityLabel="Message seller">
              <Text style={styles.menuLabel}>Message seller</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.menuRow}
              onPress={onContactInfo}
              accessibilityRole="button"
              accessibilityLabel="Contact info">
              <Text style={styles.menuLabel}>Contact info</Text>
            </Pressable>
          </View>

          <AppButton variant="filled" onPress={onClose} textStyle={styles.doneBtn}>
            DONE
          </AppButton>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  scrim: { flex: 1 },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 8,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  menu: {
    borderRadius: 11,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  menuRow: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    textAlign: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  doneBtn: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.5,
  },
});
