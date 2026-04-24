import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/theme';

type Props = {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  required?: boolean;
  helper?: string;
  placeholder?: string;
  /** Small caps line above the value (e.g. role picker). */
  metaLabel?: string;
};

export function SelectField({
  label,
  value,
  options,
  onChange,
  required,
  helper,
  placeholder = 'Select',
  metaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.fieldLabel}>
        {label.toUpperCase()}
        {required ? <Text style={styles.star}> *</Text> : null}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.field, pressed && styles.fieldPressed]}
      >
        <View>
          {metaLabel ? <Text style={styles.caps}>{metaLabel}</Text> : null}
          <Text style={styles.valueText}>{selected?.label ?? placeholder}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </Pressable>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBg} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={styles.optionRow}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      opt.value === value && styles.optionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  star: { color: colors.destructive },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputSurface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  fieldPressed: { opacity: 0.9 },
  caps: {
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginBottom: 2,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.3,
  },
  helper: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalBg: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.xl,
    maxHeight: '55%',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.text,
  },
  optionRow: {
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionText: { fontSize: 16, color: colors.text },
  optionTextActive: { color: colors.primary, fontWeight: '600' },
});
