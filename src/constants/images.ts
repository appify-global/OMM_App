/** Bundled property, portrait, and review headshots (Unsplash-sourced, local files). */
export const images = {
  propertyHouse1: require('../../assets/images/property-house-01.jpg'),
  propertyHouse2: require('../../assets/images/property-house-02.jpg'),
  propertyHouse3: require('../../assets/images/property-house-03.jpg'),
  agentAnton: require('../../assets/images/agent-anton.jpg'),
  reviewer1: require('../../assets/images/reviewer-01.jpg'),
  reviewer2: require('../../assets/images/reviewer-02.jpg'),
  reviewer3: require('../../assets/images/reviewer-03.jpg'),
  reviewer4: require('../../assets/images/reviewer-04.jpg'),
} as const;

export type ImageKey = keyof typeof images;
