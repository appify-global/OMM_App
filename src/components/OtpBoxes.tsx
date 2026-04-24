import React, { useRef } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { colors, radii, spacing } from '../theme/theme';

const LENGTH = 5;

type Props = {
  value: string;
  onChange: (digits: string) => void;
};

export function OtpBoxes({ value, onChange }: Props) {
  const refs = useRef<Array<TextInput | null>>([]);

  const focus = (i: number) => {
    refs.current[i]?.focus();
  };

  return (
    <View style={styles.row}>
      {Array.from({ length: LENGTH }).map((_, i) => (
        <TextInput
          key={i}
          ref={(r) => {
            refs.current[i] = r;
          }}
          style={styles.cell}
          value={value[i] ?? ''}
          onChangeText={(t) => {
            const digit = t.replace(/\D/g, '').slice(-1);
            const next = `${value.slice(0, i)}${digit}${value.slice(i + 1)}`.slice(0, LENGTH);
            onChange(next);
            if (digit && i < LENGTH - 1) focus(i + 1);
          }}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace' && !(value[i] ?? '') && i > 0) {
              focus(i - 1);
            }
          }}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          textAlign="center"
          underlineColorAndroid="transparent"
          accessibilityLabel={`Digit ${i + 1} of ${LENGTH}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cell: {
    flex: 1,
    minWidth: 0,
    maxWidth: 56,
    height: 56,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputSurface,
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 0,
    paddingHorizontal: 0,
    textAlign: 'center',
    ...Platform.select({
      android: {
        textAlignVertical: 'center',
        includeFontPadding: false,
      },
      default: {},
    }),
  },
});
