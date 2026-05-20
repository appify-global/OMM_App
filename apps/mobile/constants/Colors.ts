import { frost } from '@/constants/theme';

/** Matches `accent` in `constants/theme` - tabs & native tint in light mode. */
const tintColorLight = '#38BDF8';
const tintColorDark = '#ffffff';

export default {
  light: {
    text: '#000000',
    background: frost,
    tint: tintColorLight,
    tabIconDefault: 'rgba(0,0,0,0.35)',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    tint: tintColorDark,
    tabIconDefault: 'rgba(255,255,255,0.35)',
    tabIconSelected: tintColorDark,
  },
};
