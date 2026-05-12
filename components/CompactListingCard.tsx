import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { Text } from '@/components/OMMText';

export type CompactListingCardProps = {
  imageSource: ImageSourcePropType;
  title: string;
  suburb: string;
  price: string;
  beds: number;
  baths: number;
  cars: number;
  badgeLeft?: string;
  badgeRight?: string;
  /** Narrow carousel tile vs full-width stack */
  layout?: 'full' | 'carousel';
  onPress?: () => void;
};

/**
 * Dense listing row (~50% height vs `LargeListingCard` baseline). See
 * `docs/listing-card-metrics.md` for approximate before/after totals.
 */
export function CompactListingCard({
  imageSource,
  title,
  suburb,
  price,
  beds,
  baths,
  cars,
  badgeLeft,
  badgeRight,
  layout = 'full',
  onPress,
}: CompactListingCardProps) {
  const inner = (
    <>
      <View style={styles.imgWrap}>
        <Image source={imageSource} style={styles.img} resizeMode="cover" />
        {badgeLeft || badgeRight ? (
          <View style={styles.badgeRow} pointerEvents="box-none">
            {badgeLeft ? (
              <View style={[styles.badgePill, styles.badgePillDark]}>
                <Text style={styles.badgeText}>{badgeLeft}</Text>
              </View>
            ) : null}
            {badgeRight ? (
              <View style={[styles.badgePill, styles.badgePillLight]}>
                <Text style={styles.badgeRightText}>{badgeRight}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.price} numberOfLines={1}>
          {price}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.suburb} numberOfLines={1}>
          {suburb}
        </Text>
        <View style={styles.specRow}>
          <View style={styles.specItem}>
            <MaterialCommunityIcons name="bed" size={14} color="rgba(17,17,17,0.55)" />
            <Text style={styles.specText}>{beds}</Text>
          </View>
          <View style={styles.specItem}>
            <MaterialCommunityIcons name="bathtub" size={14} color="rgba(17,17,17,0.55)" />
            <Text style={styles.specText}>{baths}</Text>
          </View>
          <View style={styles.specItem}>
            <MaterialCommunityIcons name="car" size={14} color="rgba(17,17,17,0.55)" />
            <Text style={styles.specText}>{cars}</Text>
          </View>
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Listing ${title}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          layout === 'carousel' && styles.cardCarousel,
          pressed && { opacity: 0.94 },
        ]}>
        {inner}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, layout === 'carousel' && styles.cardCarousel]}>{inner}</View>
  );
}

const IMG = 100;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(17,17,17,0.08)',
    minHeight: IMG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardCarousel: {
    width: 312,
    flexShrink: 0,
    marginRight: 14,
  },
  imgWrap: {
    width: IMG,
    alignSelf: 'stretch',
    minHeight: IMG,
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  img: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  badgeRow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'flex-start',
    zIndex: 1,
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
    maxWidth: '100%',
  },
  badgePillDark: {
    backgroundColor: '#111111',
  },
  badgePillLight: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  badgeText: {
    fontSize: 8,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.4,
  },
  badgeRightText: {
    fontSize: 8,
    fontFamily: 'Satoshi-Medium',
    color: '#111111',
    letterSpacing: 0.2,
  },
  body: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    paddingLeft: 12,
    justifyContent: 'center',
    minWidth: 0,
  },
  price: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#111111',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#111111',
    lineHeight: 20,
    marginBottom: 3,
  },
  suburb: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(17,17,17,0.48)',
    marginBottom: 8,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(17,17,17,0.55)',
  },
});
