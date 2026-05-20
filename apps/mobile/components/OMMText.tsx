import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { Fonts } from '@/constants/theme';

export type TextProps = RNTextProps;

/**
 * App default type - Satoshi Regular. Emphasis: `style={{ fontFamily: Fonts.medium }}` only (no bold / 700).
 */
export function Text({ style, ...rest }: TextProps) {
  return <RNText style={[{ fontFamily: Fonts.regular }, style]} {...rest} />;
}
