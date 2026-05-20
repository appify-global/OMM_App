import Svg, { Circle, Path, Rect } from 'react-native-svg';

/** Inactive icons - black at reduced opacity (strict monochrome tab bar). */
export const TAB_ICON_INACTIVE = 'rgba(0, 0, 0, 0.35)';

/** Drawn glyph box; active chip is slightly smaller than 64px-tall pill. */
export const TAB_GLYPH_SIZE = 22;
export const TAB_SLOT_SIZE = 40;

const STROKE_W = 1.5;

type GlyphProps = {
  color: string;
  size?: number;
};

export function TabHomeGlyph({ color, size = TAB_GLYPH_SIZE }: GlyphProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      preserveAspectRatio="xMidYMid meet">
      <Path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
        stroke={color}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Rounded square + three bars, heights increase left → right (reference bar). */
export function TabActivitiesGlyph({ color, size = TAB_GLYPH_SIZE }: GlyphProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      preserveAspectRatio="xMidYMid meet">
      <Rect
        x={4}
        y={4}
        width={16}
        height={16}
        rx={3}
        stroke={color}
        strokeWidth={STROKE_W}
      />
      <Path
        d="M8.5 16.5V12.5M12 16.5V9.5M15.5 16.5V6.5"
        stroke={color}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TabAddGlyph({ color, size = TAB_GLYPH_SIZE }: GlyphProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      preserveAspectRatio="xMidYMid meet">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Bulleted list: filled dots + lines (reference). */
export function TabListGlyph({ color, size = TAB_GLYPH_SIZE }: GlyphProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      preserveAspectRatio="xMidYMid meet">
      <Circle cx={6.5} cy={8} r={1.35} fill={color} />
      <Path d="M10.5 8H19" stroke={color} strokeWidth={STROKE_W} strokeLinecap="round" />
      <Circle cx={6.5} cy={12} r={1.35} fill={color} />
      <Path d="M10.5 12H19" stroke={color} strokeWidth={STROKE_W} strokeLinecap="round" />
      <Circle cx={6.5} cy={16} r={1.35} fill={color} />
      <Path d="M10.5 16H19" stroke={color} strokeWidth={STROKE_W} strokeLinecap="round" />
    </Svg>
  );
}

const PROFILE_SILHOUETTE =
  'M8.4 7.2C10.3869 7.2 12 5.58689 12 3.6C12 1.61311 10.3869 0 8.4 0C6.41311 0 4.8 1.61311 4.8 3.6C4.8 5.58689 6.41311 7.2 8.4 7.2ZM0 18C0 13.3639 3.76391 9.6 8.4 9.6C13.0361 9.6 16.8 13.3639 16.8 18H0Z';

/** Filled head + shoulders (inactive); white fill when tab is active. */
export function TabProfileGlyph({ color, size = TAB_GLYPH_SIZE }: GlyphProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16.8 18"
      fill="none"
      preserveAspectRatio="xMidYMid meet">
      <Path fillRule="evenodd" clipRule="evenodd" d={PROFILE_SILHOUETTE} fill={color} />
    </Svg>
  );
}
