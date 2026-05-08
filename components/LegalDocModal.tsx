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
  const maxH = Math.min(height * 0.72, height - insets.top - insets.bottom - 48);

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
            },
          ]}>
          <View style={[styles.card, { maxHeight: maxH }]} pointerEvents="auto">
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{title}</Text>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close">
                <FontAwesome name="times" size={22} color="#000000" />
              </Pressable>
            </View>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollInner}
              showsVerticalScrollIndicator
              bounces={false}>
              <Text style={styles.body}>{body}</Text>
            </ScrollView>
            <AppButton
              variant="filled"
              onPress={onClose}
              accessibilityLabel="Close"
              textStyle={{ letterSpacing: 0.5, fontFamily: 'Satoshi-Medium' }}>
              CLOSE
            </AppButton>
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
    paddingTop: 28,
    paddingBottom: 28,
    flexDirection: 'column',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 24,
  },
  scroll: {
    marginBottom: 18,
    flexGrow: 0,
    flexShrink: 1,
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
});
