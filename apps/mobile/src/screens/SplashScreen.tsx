import React, { useEffect } from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { images } from '../constants/images';
import type { RootStackScreenProps } from '../navigation/types';
import { radii, spacing } from '../theme/theme';

const HOUSE_IMAGE =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80';

type Props = RootStackScreenProps<'Splash'>;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2400);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ImageBackground source={{ uri: HOUSE_IMAGE }} style={styles.bg} resizeMode="cover">
        <View style={styles.badge}>
          <Image
            source={images.unlistedLogo}
            style={styles.badgeLogo}
            resizeMode="contain"
            accessible
            accessibilityLabel="Unlisted"
          />
        </View>
        <View style={styles.footer}>
          <View style={styles.footerIcon} />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255,253,251,0.95)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    maxWidth: '92%',
  },
  badgeLogo: {
    width: 280,
    height: 88,
  },
  footer: {
    position: 'absolute',
    bottom: 36,
    alignItems: 'center',
    width: '100%',
  },
  footerIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: '#fff',
    opacity: 0.95,
  },
});
