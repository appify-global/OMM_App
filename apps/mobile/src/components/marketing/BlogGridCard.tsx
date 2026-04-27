import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SquareFilled } from "../BrandGlyph";
import type { BlogPost } from "../../data/marketingHome";
import { colors, fonts, shadow, space } from "../../theme/tokens";

type Props = {
  post: BlogPost;
  onPress?: () => void;
};

/** Grid row card — mirrors `.blog-card` (image + category + title + byline). */
export function BlogGridCard({ post, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${post.title}. ${post.author}. ${post.readTime} read.`}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: post.image }}
        style={styles.image}
        contentFit="cover"
        transition={180}
      />
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <SquareFilled size={5} />
          <Text style={styles.category}>{post.category}</Text>
        </View>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.byline}>
          {post.author} · {post.readTime} read
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    marginBottom: space.md,
    ...shadow.card,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.995 }] },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: colors.surfaceMuted,
  },
  body: {
    padding: space.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  category: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 0.3,
    color: colors.forest,
  },
  title: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.2,
    color: colors.ink,
    marginBottom: 10,
  },
  byline: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.muted,
  },
});
