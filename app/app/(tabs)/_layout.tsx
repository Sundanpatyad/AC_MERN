import { Tabs } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@/providers/AppThemeProvider';

function AndroidTabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [
          styles.androidTabBar,
          {
            backgroundColor: colors.backgroundElevated,
            borderTopColor: colors.border,
          },
        ],
        tabBarLabelStyle: styles.androidTabLabel,
        tabBarItemStyle: styles.androidTabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen
        name="mock-tests"
        options={{
          title: 'Tests',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-tests"
        options={{
          title: 'My Tests',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rankings"
        options={{
          title: 'Rankings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'trophy' : 'trophy-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function IOSTabLayout() {
  const { colors } = useTheme();

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={colors.text}
      labelStyle={{ color: colors.textSecondary }}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="mock-tests">
        <Icon sf={{ default: 'list.bullet', selected: 'list.bullet' }} />
        <Label>Tests</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="my-tests">
        <Icon sf={{ default: 'book', selected: 'book.fill' }} />
        <Label>My Tests</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="rankings">
        <Icon sf={{ default: 'trophy', selected: 'trophy.fill' }} />
        <Label>Rankings</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function TabLayout() {
  if (Platform.OS === 'ios') {
    return <IOSTabLayout />;
  }
  return <AndroidTabLayout />;
}

const styles = StyleSheet.create({
  androidTabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 58,
    paddingBottom: 6,
    paddingTop: 4,
    elevation: 8,
  },
  androidTabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.15,
    marginTop: 1,
  },
  androidTabItem: {
    paddingVertical: 2,
  },
});
