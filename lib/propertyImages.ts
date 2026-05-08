import type { ImageSourcePropType } from 'react-native';

/** Demo listing photos — curated luxury residential (Unsplash). Welcome hero stays on `welcome-bg.jpg`. */
export const PROPERTY_IMG_1: ImageSourcePropType = require('@/assets/images/property-luxury-1.jpg');
export const PROPERTY_IMG_2: ImageSourcePropType = require('@/assets/images/property-luxury-2.jpg');

/** Wide architectural exterior — used behind the Home "Publish a property" hero CTA. */
export const HERO_PROPERTY_IMG: ImageSourcePropType = require('@/assets/images/hero-property.jpg');

/** Demo listing agent (Anton Zhouk) headshot — bundled square crop (Unsplash). */
export const AGENT_IMG: ImageSourcePropType = require('@/assets/images/agent.jpg');

export function propertyImageAtIndex(index: number): ImageSourcePropType {
  return index % 2 === 0 ? PROPERTY_IMG_1 : PROPERTY_IMG_2;
}
