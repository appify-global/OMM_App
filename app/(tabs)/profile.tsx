import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { type Href, useRouter } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Fragment, useMemo } from 'react';
import { Text } from '@/components/OMMText';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useClerk, useUser } from '@clerk/expo';
import { clearAuthenticated } from '@/lib/auth-session';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';
import { useTabBarOnScroll } from '@/lib/tab-bar-visibility';

/**
 * Profile tab — buyer / user settings hub.
 * [Figma 1053:2082](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-2082&t=2eZigRM0BwNtC5wd-4)
 */

import { AGENT_IMG } from '@/lib/propertyImages';
import { accent, frost, ink, layout, slateNavy } from '@/constants/theme';

const SECTION_GAP = 24;
const GROUP_R = 16;
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

/** Hairline rule between menu rows. */
function BetweenRowHairline() {
  return <View style={styles.menuHairline} />;
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
      {/* Static style — function-style Pressable on iOS can fail to apply flexDirection: 'row',
          causing icon/label/chevron to stack vertically. */}
      <Pressable
        onPress={onPress}
        style={styles.menuRow}
        accessibilityRole="button"
        accessibilityLabel={label}>
        {({ pressed }) => (
          <>
            <View style={[styles.iconWrap, pressed && styles.rowPressed]}>
              <MenuIconGlyph spec={icon} size={18} />
            </View>
            <Text style={[styles.menuLabel, pressed && styles.rowPressed]}>{label}</Text>
            <FontAwesome
              name="chevron-right"
              size={12}
              color={pressed ? 'rgba(0,0,0,0.2)' : 'rgba(0, 0, 0, 0.35)'}
            />
          </>
        )}
      </Pressable>
      {!isLast ? <BetweenRowHairline /> : null}
    </Fragment>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionKicker}>{children}</Text>;
}

function SectionMenuGroup({ children }: { children: ReactNode }) {
  return <View style={styles.sectionMenuGroup}>{children}</View>;
}

/** Display name from the signed-in user — falls back to email local-part then a neutral label. */
function clerkDisplayName(user: ReturnType<typeof useUser>['user']): string {
  if (!user) return 'Agent';
  const full = user.fullName?.trim();
  if (full) return full;
  const fn = user.firstName?.trim() ?? '';
  const ln = user.lastName?.trim() ?? '';
  const pair = `${fn} ${ln}`.trim();
  if (pair) return pair;
  const email = user.primaryEmailAddress?.emailAddress;
  if (email) {
    const local = email.split('@')[0]?.replace(/[._]/g, ' ').trim();
    if (local) {
      return local.replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return email;
  }
  return 'Agent';
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const { onScroll } = useTabBarOnScroll();

  const displayName = useMemo(() => clerkDisplayName(user ?? null), [user]);
  const avatarSource =
    user?.imageUrl != null && user.imageUrl.length > 0
      ? { uri: user.imageUrl }
      : AGENT_IMG;

  const tabBarPad = 100;

  const onLogOut = () => {
    Alert.alert('Log out', 'You will need to sign in again to access your account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
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
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollInner, { paddingBottom: insets.bottom + tabBarPad }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextCol}>
            <Text style={styles.userName}>{isLoaded ? displayName : '…'}</Text>
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
              <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
            </Pressable>
            <Pressable
              style={styles.cameraBtn}
              onPress={() => Alert.alert('Profile photo', 'Photo picker would open here.')}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo">
              <FontAwesome name="camera" size={11} color={ink} />
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
  screen: { flex: 1, backgroundColor: frost },
  scrollInner: { paddingHorizontal: 32 },
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
    backgroundColor: accent,
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
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderStyle: 'solid',
    borderColor: FIELD_OUTLINE_COLOR,
    borderRadius: GROUP_R,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  menuHairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: FIELD_OUTLINE_COLOR,
    alignSelf: 'stretch',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    minHeight: 53,
    paddingVertical: 16,
    gap: 16,
  },
  iconWrap: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  rowPressed: {
    opacity: 0.55,
  },
});
