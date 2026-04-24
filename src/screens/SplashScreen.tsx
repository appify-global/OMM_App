import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { RootStackScreenProps } from '../navigation/types';
import { colors, radii, spacing } from '../theme/theme';

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
          <Text style={styles.badgeText}>OMM</Text>
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
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: spacing.xxl + 8,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
  },
  badgeText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
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
