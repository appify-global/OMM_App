import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from './PrimaryButton';
import { colors, radii, spacing } from '../theme/theme';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

export function LegalModal({ visible, title, body, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView edges={['bottom']} style={styles.safe}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              style={styles.closeBtn}
              onPress={onClose}
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
            <PrimaryButton label="CLOSE" variant="secondary" onPress={onClose} />
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    maxHeight: '78%',
    overflow: 'hidden',
  },
  safe: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  closeBtn: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    zIndex: 2,
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    color: colors.modalTitle,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
});
