import { Text } from '@/components/OMMText';
import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { layout } from '@/constants/theme';
import {
  DEMO_SELLER_EMAIL,
  DEMO_SELLER_PHONE_DISPLAY,
  DEMO_SELLER_PHONE_TEL,
} from '@/lib/demo-seller-contact';

type SellerContactSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Optional name row shown above email (e.g. vendor on a match detail). */
  displayName?: string;
  email?: string;
  phoneDisplay?: string;
  phoneTel?: string;
  /** When false, the phone row is omitted. Defaults true. */
  showPhone?: boolean;
  /** Override sheet title (default: Seller contact). */
  title?: string;
  /** Override subtitle hint under title. */
  hint?: string;
  /** Called when the buyer taps email or phone (e.g. listing enquiry analytics). */
  onContactChannelPress?: () => void;
};

/**
 * Seller contact bottom sheet — optional name, email + phone tappable rows.
 * [Figma listing contact flow](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=903-1586)
 */
export function SellerContactSheet({
  visible,
  onClose,
  displayName,
  email = DEMO_SELLER_EMAIL,
  phoneDisplay = DEMO_SELLER_PHONE_DISPLAY,
  phoneTel = DEMO_SELLER_PHONE_TEL,
  showPhone = true,
  title = 'Seller contact',
  hint = 'Email or call the Real Estate Agent.',
  onContactChannelPress,
}: SellerContactSheetProps) {
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
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.hint}>{hint}</Text>

          <View style={styles.divider} />

          {displayName ? (
            <>
              <View style={styles.row}>
                <Text style={styles.kicker}>NAME</Text>
                <Text style={styles.valuePlain}>{displayName}</Text>
              </View>
              <View style={styles.divider} />
            </>
          ) : null}

          <View style={styles.row}>
            <Text style={styles.kicker}>EMAIL</Text>
            <Pressable
              onPress={() => {
                onContactChannelPress?.();
                void Linking.openURL(`mailto:${email}`);
              }}
              accessibilityRole="link"
              accessibilityLabel={`Email ${email}`}>
              <Text style={styles.value}>{email}</Text>
            </Pressable>
          </View>

          {showPhone ? (
            <>
              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.kicker}>PHONE</Text>
                <Pressable
                  onPress={() => {
                    onContactChannelPress?.();
                    void Linking.openURL(`tel:${phoneTel}`);
                  }}
                  accessibilityRole="link"
                  accessibilityLabel={`Call ${phoneDisplay}`}>
                  <Text style={styles.value}>{phoneDisplay}</Text>
                </Pressable>
              </View>
            </>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.doneWrap}>
            <AppButton variant="filled" onPress={onClose} textStyle={styles.doneBtn}>
              DONE
            </AppButton>
          </View>
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
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  row: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  kicker: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    textDecorationLine: 'underline',
  },
  valuePlain: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    lineHeight: 22,
  },
  doneWrap: {
    marginTop: 8,
    paddingTop: 12,
  },
  doneBtn: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.5,
  },
});
