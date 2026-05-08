import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { type Href, useRouter } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Fragment, useState } from 'react';
import Svg, { Line } from 'react-native-svg';
import { Text } from '@/components/OMMText';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { clearAuthenticated } from '@/lib/auth-session';

/**
 * Profile tab — buyer / user settings hub.
 * [Figma 1053:2082](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-2082&t=2eZigRM0BwNtC5wd-4)
 */

import { AGENT_IMG } from '@/lib/propertyImages';
const H_PAD = 20;
const SECTION_GAP = 24;
const GROUP_R = 16;
/** Light gray dashed rules — full profile (ref. second screen) */
const DASH_COLOR = 'rgba(0, 0, 0, 0.34)';
const DASH_WIDTH = 1;
const STAR_FILLED = '#6b5344';
const STAR_EMPTY = 'rgba(0, 0, 0, 0.22)';

type MenuIcon =
  | { family: 'fa'; name: ComponentProps<typeof FontAwesome>['name'] }
  | { family: 'mci'; name: ComponentProps<typeof MaterialCommunityIcons>['name'] };

function MenuIconGlyph({ spec, size = 20 }: { spec: MenuIcon; size?: number }) {
  if (spec.family === 'fa') {
    return <FontAwesome name={spec.name} size={size} color="#000000" />;
  }
  return <MaterialCommunityIcons name={spec.name} size={size} color="#000000" />;
}

/** Full-width dashed rule between rows — image 2 ref; RN border dashed is unreliable on Android. */
function BetweenRowDashedLine() {
  const [w, setW] = useState(0);
  return (
    <View
      style={styles.dashRuleHost}
      onLayout={(e) => setW(Math.ceil(e.nativeEvent.layout.width))}
      pointerEvents="none">
      {w > 0 ? (
        <Svg width={w} height={2} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Line
            x1={0}
            y1={1}
            x2={w}
            y2={1}
            stroke={DASH_COLOR}
            strokeWidth={1}
            strokeDasharray="5 4"
          />
        </Svg>
      ) : null}
    </View>
  );
}

function MenuRow({
  icon,
  label,
  isLast,
  onPress,
}: {
  icon: MenuIcon;
  label: string;
  isLast: boolean;
  onPress: () => void;
}) {
  return (
    <Fragment>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.72 }]}
        accessibilityRole="button"
        accessibilityLabel={label}>
        <MenuIconGlyph spec={icon} />
        <Text style={styles.menuLabel}>{label}</Text>
        <FontAwesome name="chevron-right" size={14} color="rgba(0, 0, 0, 0.35)" />
      </Pressable>
      {!isLast ? <BetweenRowDashedLine /> : null}
    </Fragment>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionKicker}>{children}</Text>;
}

function SectionMenuGroup({ children }: { children: ReactNode }) {
  return <View style={styles.sectionMenuGroup}>{children}</View>;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tabBarPad = 100;

  const onLogOut = () => {
    Alert.alert('Log out', 'You will need to sign in again to access your account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await clearAuthenticated();
          router.replace('/welcome' as Href);
        },
      },
    ]);
  };

  const onDeleteAccount = () => {
    router.push('/delete-account' as Href);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollInner, { paddingBottom: insets.bottom + tabBarPad }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextCol}>
            <Text style={styles.userName}>John Lim</Text>
            <View style={styles.ratingRow}>
              {[0, 1, 2, 3].map((i) => (
                <FontAwesome
                  key={i}
                  name="star"
                  size={12}
                  color={STAR_FILLED}
                  style={i > 0 ? styles.starGap : undefined}
                />
              ))}
              <FontAwesome name="star-o" size={12} color={STAR_EMPTY} style={styles.starGap} />
              <Text style={styles.reviewMeta}>4.8 / 24 reviews</Text>
            </View>
          </View>
          <View style={styles.avatarBlock}>
            <Pressable
              onPress={() => Alert.alert('Profile photo', 'Photo picker would open here.')}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo">
              <Image source={AGENT_IMG} style={styles.avatar} resizeMode="cover" />
            </Pressable>
            <Pressable
              style={styles.cameraBtn}
              onPress={() => Alert.alert('Profile photo', 'Photo picker would open here.')}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo">
              <FontAwesome name="camera" size={11} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={{ height: SECTION_GAP }} />

        <SectionTitle>GENERAL</SectionTitle>
        <View style={{ height: 12 }} />
        <SectionMenuGroup>
          <MenuRow
            icon={{ family: 'fa', name: 'cog' }}
            label="Account settings"
            isLast={false}
            onPress={() => router.push('/account-settings' as Href)}
          />
          <MenuRow
            icon={{ family: 'fa', name: 'comment-o' }}
            label="Contact support"
            isLast={false}
            onPress={() => router.push('/(auth)/contact-support' as Href)}
          />
          <MenuRow
            icon={{ family: 'fa', name: 'pencil-square-o' }}
            label="Share feedback"
            isLast
            onPress={() => router.push('/(auth)/share-feedback' as Href)}
          />
        </SectionMenuGroup>

        <View style={{ height: SECTION_GAP }} />

        <SectionTitle>DEALINGS</SectionTitle>
        <View style={{ height: 12 }} />
        <SectionMenuGroup>
          <MenuRow
            icon={{ family: 'fa', name: 'star-o' }}
            label="Reviews"
            isLast={false}
            onPress={() => router.push('/reviews' as Href)}
          />
          <MenuRow
            icon={{ family: 'fa', name: 'exclamation-triangle' }}
            label="Disputes"
            isLast={false}
            onPress={() => router.push('/disputes' as Href)}
          />
          <MenuRow
            icon={{ family: 'fa', name: 'credit-card' }}
            label="Payments & Billing"
            isLast
            onPress={() => router.push('/payments-billing' as Href)}
          />
        </SectionMenuGroup>

        <View style={{ height: SECTION_GAP }} />

        <SectionTitle>PRIVACY & LEGAL</SectionTitle>
        <View style={{ height: 12 }} />
        <SectionMenuGroup>
          <MenuRow
            icon={{ family: 'fa', name: 'file-text-o' }}
            label="Terms of Service"
            isLast={false}
            onPress={() => router.push('/terms-of-service' as Href)}
          />
          <MenuRow
            icon={{ family: 'mci', name: 'account-group-outline' }}
            label="Community Guidelines"
            isLast={false}
            onPress={() => router.push('/community-guidelines' as Href)}
          />
          <MenuRow
            icon={{ family: 'mci', name: 'shield-outline' }}
            label="Privacy Policy"
            isLast={false}
            onPress={() => router.push('/privacy-policy' as Href)}
          />
          <MenuRow
            icon={{ family: 'fa', name: 'trash-o' }}
            label="Delete Account"
            isLast={false}
            onPress={onDeleteAccount}
          />
          <MenuRow
            icon={{ family: 'mci', name: 'logout-variant' }}
            label="Log out"
            isLast
            onPress={onLogOut}
          />
        </SectionMenuGroup>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  scrollInner: { paddingHorizontal: H_PAD },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingTop: 8,
  },
  headerTextCol: { flex: 1, paddingRight: 16 },
  userName: {
    fontSize: 24,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: -0.3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  starGap: { marginLeft: 4 },
  reviewMeta: {
    marginLeft: 10,
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
  },
  avatarBlock: { position: 'relative', width: 64, height: 64 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  cameraBtn: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  sectionKicker: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionMenuGroup: {
    alignSelf: 'stretch',
    borderWidth: DASH_WIDTH,
    borderColor: DASH_COLOR,
    borderStyle: 'dashed',
    borderRadius: GROUP_R,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dashRuleHost: {
    width: '100%',
    height: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
  },
});
