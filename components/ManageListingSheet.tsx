import { BlurView } from 'expo-blur';
import { Text } from '@/components/OMMText';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/constants/theme';
import { AppButton } from '@/components/AppButton';
import { DEMO_MANAGE_LISTING_HEADER } from '@/lib/melbourne-demo-locations';

export const MANAGE_LISTING_MENU_ITEMS = [
  'Edit listing details',
  'Update photos & floorplan',
  'View performance',
  'Change status',
  'Archive listing',
] as const;

export type ManageListingMenuItem = (typeof MANAGE_LISTING_MENU_ITEMS)[number];

/** Local alias — avoids stale bundles that still resolve `MENU_ITEMS.map`. */
const MENU_ITEMS = MANAGE_LISTING_MENU_ITEMS;

type Props = {
  visible: boolean;
  onClose: () => void;
  /** e.g. "15 Rowe St, Fitzroy North" */
  title?: string;
  /** e.g. "$2,450,000 • Live • Authority expires in 14 days • SOI 20 Apr" */
  subtitle?: string;
  onMenuItemPress?: (item: ManageListingMenuItem) => void;
};

/**
 * Manage listing actions — bottom sheet over **blurred** manage listings screen.
 */
export function ManageListingSheet({
  visible,
  onClose,
  title = DEMO_MANAGE_LISTING_HEADER,
  subtitle = '$2,450,000 • Live • Authority expires in 14 days • SOI 20 Apr',
  onMenuItemPress,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.wrap}>
        {Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
        ) : (
          <BlurView intensity={72} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.18)' }]}
        />
        <View style={styles.stack}>
          <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <View style={styles.menu}>
              {MENU_ITEMS.map((label, index) => (
                <View key={label}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <Pressable
                    style={styles.menuRow}
                    onPress={() => onMenuItemPress?.(label)}
                    accessibilityRole="button"
                    accessibilityLabel={label}>
                    <Text style={styles.menuLabel}>{label}</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <AppButton variant="filled" onPress={onClose} textStyle={styles.doneLabel}>
              DONE
            </AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const DIVIDER_INSET = 20;

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  stack: { flex: 1, justifyContent: 'flex-end' },
  scrim: { flex: 1 },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 8,
  },
  handleWrap: { alignItems: 'center', paddingVertical: 8 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 20,
    marginBottom: 8,
  },
  menu: { marginBottom: 20 },
  menuRow: {
    paddingVertical: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginLeft: DIVIDER_INSET,
    marginRight: DIVIDER_INSET,
  },
  doneLabel: { fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.6 },
});
