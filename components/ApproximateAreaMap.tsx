import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { Text } from '@/components/OMMText';

const MAP_HEIGHT = 220;
const VB_W = 320;
const VB_H = 200;

type Props = {
  /** Search string for Maps (full street when disclosed, suburb only when anonymous). */
  mapsQuery: string;
  /** Shown in caption for anonymous listings */
  radiusMeters?: number;
  /**
   * `disclosed` — mock map with a property pin; opens Maps at full address.
   * `anonymous` — suburb-only copy + approximate radius ring; opens Maps at suburb.
   */
  variant: 'disclosed' | 'anonymous';
};

function mapsUrlForQuery(q: string) {
  const encoded = encodeURIComponent(q);
  return Platform.OS === 'ios'
    ? `https://maps.apple.com/?q=${encoded}`
    : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

/**
 * Mock listing map (no tile SDK): grid “streets” + pin or radius.
 * Tap opens the system maps app.
 */
export function ApproximateAreaMap({ mapsQuery, radiusMeters = 500, variant }: Props) {
  const url = mapsUrlForQuery(mapsQuery);
  const a11y =
    variant === 'anonymous'
      ? `Open approximate area in Maps: ${mapsQuery}`
      : `Open property location in Maps: ${mapsQuery}`;

  return (
    <Pressable
      onPress={() => void Linking.openURL(url)}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={styles.wrap}>
      <View style={styles.mapStage}>
        <Svg width="100%" height={MAP_HEIGHT} viewBox={`0 0 ${VB_W} ${VB_H}`}>
          <Rect x={0} y={0} width={VB_W} height={VB_H} fill="#e8e4df" />
          {[28, 76, 124, 172, 220, 268].map((x) => (
            <Line
              key={`v-${x}`}
              x1={x}
              y1={0}
              x2={x}
              y2={VB_H}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={1}
            />
          ))}
          {[25, 55, 85, 115, 145, 175].map((y) => (
            <Line
              key={`h-${y}`}
              x1={0}
              y1={y}
              x2={VB_W}
              y2={y}
              stroke="rgba(255,255,255,0.28)"
              strokeWidth={1}
            />
          ))}
          <Rect x={48} y={40} width={88} height={52} fill="rgba(200,195,188,0.85)" rx={3} />
          <Rect x={178} y={95} width={96} height={60} fill="rgba(210,205,198,0.9)" rx={3} />
          {variant === 'anonymous' ? (
            <>
              <Circle cx={200} cy={118} r={62} fill="rgba(0, 122, 255, 0.09)" />
              <Circle
                cx={200}
                cy={118}
                r={62}
                fill="none"
                stroke="rgba(0, 122, 255, 0.42)"
                strokeWidth={2}
                strokeDasharray="7 5"
              />
              <Circle cx={196} cy={122} r={5} fill="rgba(0, 122, 255, 0.55)" />
            </>
          ) : (
            <>
              <Circle cx={168} cy={108} r={28} fill="rgba(0, 122, 255, 0.08)" />
              <Circle
                cx={168}
                cy={108}
                r={28}
                fill="none"
                stroke="rgba(0, 122, 255, 0.2)"
                strokeWidth={1}
              />
            </>
          )}
        </Svg>
        {variant === 'disclosed' ? (
          <View style={styles.pinWrap} pointerEvents="none">
            <MaterialCommunityIcons name="map-marker" size={44} color="#007AFF" />
          </View>
        ) : null}
      </View>
      <View style={styles.captionBar}>
        <Text style={styles.captionStrong}>
          {variant === 'anonymous' ? 'Approximate area' : 'Property location'}
        </Text>
        <Text style={styles.captionSoft}>
          {variant === 'anonymous'
            ? `Within ~${radiusMeters} m · suburb only on listing · tap to open Maps`
            : 'Full address shown to buyers · tap to open Maps'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  mapStage: {
    width: '100%',
    height: MAP_HEIGHT,
    position: 'relative',
  },
  pinWrap: {
    position: 'absolute',
    left: '52.5%',
    top: '54%',
    marginLeft: -22,
    marginTop: -40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  captionBar: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f5f3f0',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  captionStrong: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#1a1c1c',
  },
  captionSoft: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(0,0,0,0.52)',
    lineHeight: 17,
  },
});
