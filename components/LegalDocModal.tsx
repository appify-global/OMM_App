import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import { Text } from '@/components/OMMText';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

export function LegalDocModal({ visible, title, body, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  /** Card never taller than 55% of screen — ScrollView handles overflow for long docs. */
  const maxH = Math.min(height * 0.55, height - insets.top - insets.bottom - 48);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        {Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
        ) : (
          <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.28)' }]}
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View
          pointerEvents="box-none"
          style={[
            StyleSheet.absoluteFill,
            {
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 24,
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 12,
              zIndex: 2,
              elevation: 12,
            },
          ]}>
          {/* Fixed height so ScrollView resolves correctly inside a centered card */}
          <View style={[styles.card, { height: maxH }]} pointerEvents="auto">
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{title}</Text>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close">
                <FontAwesome name="times" size={20} color="#000000" />
              </Pressable>
            </View>
            {/* flex: 1 + minHeight: 0 resolves because card now has an explicit height */}
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollInner}
              showsVerticalScrollIndicator={false}
              bounces={false}>
              <Text style={styles.body}>{body}</Text>
            </ScrollView>
            <View style={styles.footerBtn}>
              <AppButton
                variant="charcoalSoft"
                onPress={onClose}
                accessibilityLabel="Close"
                textStyle={styles.closeBtnLabel}>
                CLOSE
              </AppButton>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    flexDirection: 'column',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 24,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollInner: {
    paddingBottom: 4,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(26, 26, 26, 0.88)',
  },
  footerBtn: {
    flexShrink: 0,
    paddingTop: 12,
  },
  closeBtnLabel: {
    textTransform: 'uppercase',
  },
});
