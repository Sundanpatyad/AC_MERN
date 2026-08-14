import { Tabs } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GlassFloatingTabBar } from '@/components/GlassFloatingTabBar';
import { supportsNativeLiquidGlassTabs } from '@/lib/platform';
import { useTheme } from '@/providers/AppThemeProvider';
import { isInstructorAccount, useAuthStore } from '@/store/authStore';

function SharedTabScreens({ instructor }: { instructor: boolean }) {
  return (
    <>
      <Tabs.Screen
        name="index"
        options={{
          title: instructor ? 'Console' : 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? instructor
                    ? 'stats-chart'
                    : 'home'
                  : instructor
                    ? 'stats-chart-outline'
                    : 'home-outline'
              }
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mock-tests"
        options={{
          title: 'Tests',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-tests"
        options={{
          title: instructor ? 'Admin' : 'My Tests',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? instructor
                    ? 'grid'
                    : 'book'
                  : instructor
                    ? 'grid-outline'
                    : 'book-outline'
              }
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rankings"
        options={
          instructor
            ? { href: null }
            : {
                title: 'Rankings',
                tabBarIcon: ({ color, focused }) => (
                  <Ionicons name={focused ? 'trophy' : 'trophy-outline'} size={24} color={color} />
                ),
              }
        }
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </>
  );
}

const hiddenTabBarStyle = {
  position: 'absolute' as const,
  left: 0,
  right: 0,
  bottom: 0,
  height: 0,
  opacity: 0,
  backgroundColor: 'transparent',
  borderTopWidth: 0,
  elevation: 0,
  shadowOpacity: 0,
};

/** Floating glass pill tab bar — Android and iOS < 26. */
function GlassTabLayout() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const instructor = isInstructorAccount(user?.accountType);

  return (
    <Tabs
      tabBar={(props) => <GlassFloatingTabBar {...props} />}
      safeAreaInsets={{ bottom: 0, top: 0, left: 0, right: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: hiddenTabBarStyle,
      }}
    >
      <SharedTabScreens instructor={instructor} />
    </Tabs>
  );
}

/** System liquid-glass tab bar — iOS 26+. */
function NativeLiquidGlassTabLayout() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const instructor = isInstructorAccount(user?.accountType);

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={colors.text}
      labelStyle={{
        default: {
          fontSize: 10,
          fontWeight: '500',
          color: colors.textSecondary,
        },
        selected: {
          fontSize: 10,
          fontWeight: '600',
          color: colors.text,
        },
      }}
      titlePositionAdjustment={{ vertical: -2 }}
    >
      <NativeTabs.Trigger name="index">
        <Icon
          sf={{
            default: instructor ? 'chart.bar' : 'house',
            selected: instructor ? 'chart.bar.fill' : 'house.fill',
          }}
        />
        <Label>{instructor ? 'Console' : 'Home'}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="mock-tests">
        <Icon sf={{ default: 'list.bullet', selected: 'list.bullet' }} />
        <Label>Tests</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="my-tests">
        <Icon
          sf={{
            default: instructor ? 'square.grid.2x2' : 'book',
            selected: instructor ? 'square.grid.2x2.fill' : 'book.fill',
          }}
        />
        <Label>{instructor ? 'Admin' : 'My Tests'}</Label>
      </NativeTabs.Trigger>

      {!instructor ? (
        <NativeTabs.Trigger name="rankings">
          <Icon sf={{ default: 'trophy', selected: 'trophy.fill' }} />
          <Label>Rankings</Label>
        </NativeTabs.Trigger>
      ) : null}

      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function TabLayout() {
  if (supportsNativeLiquidGlassTabs()) {
    return <NativeLiquidGlassTabLayout />;
  }
  return <GlassTabLayout />;
}
