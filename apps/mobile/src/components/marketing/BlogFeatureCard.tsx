import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SquareFilled } from "../BrandGlyph";
import type { BlogPost } from "../../data/marketingHome";
import { colors, fonts, shadow, space } from "../../theme/tokens";

type Props = {
  post: BlogPost;
  onPress?: () => void;
};

/** Featured story — mirrors `.blog-feature` on the web blog. */
export function BlogFeatureCard({ post, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${post.title}. ${post.readTime} read.`}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: post.image }}
        style={styles.image}
        contentFit="cover"
        transition={220}
      />
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <SquareFilled size={5} />
          <Text style={styles.metaCat}>{post.category}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaDate}>{post.date}</Text>
        </View>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.dek}>{post.dek}</Text>
        <Text style={styles.byline}>
          By {post.author} · {post.readTime} read
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    marginBottom: space.xl,
    ...shadow.card,
  },
  pressed: { opacity: 0.96 },
  image: {
    width: "100%",
    height: 220,
    backgroundColor: colors.surfaceMuted,
  },
  body: {
    padding: space.lg,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  metaCat: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.forest,
  },
  metaDot: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.muted,
  },
  metaDate: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.muted,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
    color: colors.ink,
    marginBottom: 12,
  },
  dek: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 23,
    color: "rgba(17, 17, 17, 0.62)",
    marginBottom: space.md,
  },
  byline: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
  },
});
