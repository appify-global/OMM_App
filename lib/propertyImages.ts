import type { ImageSourcePropType } from 'react-native';

/** Demo listing photos (welcome hero stays on `welcome-bg.jpg`). */
export const PROPERTY_IMG_1: ImageSourcePropType = require('@/assets/images/property 1.jpg');
export const PROPERTY_IMG_2: ImageSourcePropType = require('@/assets/images/property 2.jpg');

/** Demo listing agent (Anton Zhouk) headshot. */
export const AGENT_IMG: ImageSourcePropType = require('@/assets/images/agent.jpg');

export function propertyImageAtIndex(index: number): ImageSourcePropType {
  return index % 2 === 0 ? PROPERTY_IMG_1 : PROPERTY_IMG_2;
}
