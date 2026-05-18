import { useMemo } from "react";
import {
  Alert,
  FlatList,
  Linking,
  ListRenderItem,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SquareFilled } from "../../components/BrandGlyph";
import { BlogFeatureCard } from "../../components/marketing/BlogFeatureCard";
import { BlogGridCard } from "../../components/marketing/BlogGridCard";
import { Screen } from "../../components/ui/Screen";
import { blogPageStats, blogPosts, type BlogPost } from "../../data/marketingHome";
import { webBaseUrl } from "../../lib/env";
import { colors, fonts, space } from "../../theme/tokens";

const CANVAS = "#f9f9f7";

export function BlogScreen() {
  const { feature, rest } = useMemo(() => {
    const f = blogPosts.find((p) => p.featured) ?? blogPosts[0];
    return { feature: f, rest: blogPosts.filter((p) => p.id !== f.id) };
  }, []);

  const openPost = async (post: BlogPost) => {
    const url = `${webBaseUrl}/blog/${post.slug}`;
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else throw new Error("cannot open");
    } catch {
      Alert.alert(post.title, `Open in your browser:\n${url}`, [
        { text: "OK" },
      ]);
    }
  };

  const renderItem: ListRenderItem<BlogPost> = ({ item }) => (
    <BlogGridCard post={item} onPress={() => openPost(item)} />
  );

  return (
    <Screen
      variant="paper"
      edges={["top", "left", "right"]}
      style={{ backgroundColor: CANVAS }}
    >
      <FlatList
        style={styles.list}
        data={rest}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.kickerRow}>
              <SquareFilled size={6} />
              <Text style={styles.kicker}>The Blog</Text>
            </View>
            <Text style={styles.title}>
              <Text style={styles.titleEm}>Field notes</Text>
              {" from\n"}
              <Text style={styles.titleRest}>the private market.</Text>
            </Text>
            <Text style={styles.lede}>
              Essays, primers, data and interviews. Written by our editors
              with agents, buyers and owners across Australia.
            </Text>

            <View style={styles.statsRow}>
              {blogPageStats.map((s) => (
                <View key={s.label} style={styles.statCell}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <BlogFeatureCard post={feature} onPress={() => openPost(feature)} />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: CANVAS },
  listContent: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: 120,
  },
  headerBlock: { marginBottom: space.sm },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  kicker: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 2.42,
    textTransform: "uppercase",
    color: colors.muted,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.75,
    color: colors.ink,
    fontWeight: "400",
    marginBottom: space.md,
  },
  titleEm: {
    fontFamily: fonts.displayItalic,
    color: colors.forest,
  },
  titleRest: {
    fontFamily: fonts.display,
    color: colors.ink,
  },
  lede: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 23,
    color: "rgba(17, 17, 17, 0.58)",
    maxWidth: 400,
    marginBottom: space.xl,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: space.xl,
  },
  statCell: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
    color: colors.ink,
    marginBottom: 6,
  },
  statLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muted,
  },
});
