import { forwardRef } from 'react';
import {
  TextInput as RNTextInput,
  type TextInputProps,
} from 'react-native';

import { Fonts, ink } from '@/constants/theme';

export type OMMTextInputProps = TextInputProps;

/** Text inputs use Satoshi Regular + black body copy by default. Forwards ref for OTP / focus helpers. */
export const TextInput = forwardRef<RNTextInput, OMMTextInputProps>(function TextInput(
  { style, placeholderTextColor, ...rest },
  ref
) {
  return (
    <RNTextInput
      ref={ref}
      placeholderTextColor={placeholderTextColor ?? 'rgba(0,0,0,0.45)'}
      style={[{ fontFamily: Fonts.regular, color: ink }, style]}
      {...rest}
    />
  );
});
