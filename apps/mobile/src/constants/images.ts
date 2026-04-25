/** Property imagery: remote Unsplash placeholders for dev. Swap for CDN / bundled when real listings land. */
const unsplash = (id: string) =>
  ({
    uri: `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`,
  }) as const;

export const images = {
  /** Wordmark: UNLISTED — Off market listings */
  unlistedLogo: require("../../assets/images/unlisted-logo.png"),
  propertyHouse1: unsplash("1706808849780-7a04fbac83ef"),
  propertyHouse2: unsplash("1678575326996-a1bf09b86158"),
  propertyHouse3: unsplash("1613490493576-7fde63acd811"),
  propertyHouse4: unsplash("1670589953882-b94c9cb380f5"),
  propertyHouse5: unsplash("1748063578185-3d68121b11ff"),
  propertyHouse6: unsplash("1706164971302-e30c0640cc3b"),
  agentAnton: require("../../assets/images/agent-anton.jpg"),
  reviewer1: require("../../assets/images/reviewer-01.jpg"),
  reviewer2: require("../../assets/images/reviewer-02.jpg"),
  reviewer3: require("../../assets/images/reviewer-03.jpg"),
  reviewer4: require("../../assets/images/reviewer-04.jpg"),
} as const;

export type ImageKey = keyof typeof images;
