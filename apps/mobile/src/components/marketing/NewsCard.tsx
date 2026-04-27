import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radii, space } from "../../theme/tokens";

export type NewsItem = {
  category: string;
  title: string;
  readTime: string;
  image: string;
};

type Props = {
  item: NewsItem;
  index: number;
  onPress?: () => void;
};

export function NewsCard({ item, index, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      </View>
      <Text style={styles.meta}>
        {String(index + 1).padStart(2, "0")} · {item.category}
      </Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.read}>{item.readTime} read</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    marginRight: space.md,
    backgroundColor: colors.paper,
    borderRadius: radii.controlSoft,
    borderWidth: 1,
    borderColor: colors.cardLine,
    overflow: "hidden",
    paddingBottom: space.md,
  },
  pressed: { opacity: 0.92 },
  imageWrap: {
    height: 140,
    backgroundColor: colors.surfaceMuted,
    width: "100%",
  },
  image: { width: "100%", height: 140 },
  meta: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.muted,
    marginTop: space.sm,
    marginHorizontal: space.md,
  },
  title: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
    marginTop: 6,
    marginHorizontal: space.md,
  },
  read: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.muted,
    marginTop: 8,
    marginHorizontal: space.md,
  },
});
