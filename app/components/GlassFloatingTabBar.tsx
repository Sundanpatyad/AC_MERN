import React, { useCallback, useEffect, useMemo } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  BottomTabBarHeightCallbackContext,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNativeBottomInset } from '@/lib/safeArea';
import {
  getTabBarIconName,
  getTabBarLabel,
  isTabRouteVisible,
  sortTabRoutes,
} from '@/constants/tabBar';
import {
  FLOATING_TAB_BAR_HEIGHT,
  TAB_BAR_BOTTOM_OFFSET,
  TAB_BAR_END_PAD,
  TAB_BAR_ICON_SIZE,
  TAB_BAR_INDICATOR_INSET,
  TAB_BAR_INDICATOR_SIZE,
  TAB_BAR_ITEM_GAP,
  floatingTabBarWidth,
} from '@/constants/layout';
import { useTheme } from '@/providers/AppThemeProvider';
import { isInstructorAccount, useAuthStore } from '@/store/authStore';

const SHELL_RADIUS = FLOATING_TAB_BAR_HEIGHT / 2;

/** Fluid slide — soft settle, no harsh snap. */
const INDICATOR_SPRING = {
  damping: 24,
  stiffness: 220,
  mass: 0.65,
  overshootClamping: false,
};

const ICON_SPRING = {
  damping: 18,
  stiffness: 260,
  mass: 0.45,
};

function indicatorOffset(index: number) {
  return TAB_BAR_END_PAD + index * (TAB_BAR_INDICATOR_SIZE + TAB_BAR_ITEM_GAP);
}

function TabBarIcon({
  focused,
  name,
  activeColor,
  inactiveColor,
}: {
  focused: boolean;
  name: keyof typeof Ionicons.glyphMap;
  activeColor: string;
  inactiveColor: string;
}) {
  const scale = useSharedValue(focused ? 1 : 0.9);
  const opacity = useSharedValue(focused ? 1 : 0.72);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.9, ICON_SPRING);
    opacity.value = withTiming(focused ? 1 : 0.72, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, opacity, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={iconStyle}>
      <Ionicons
        name={name}
        size={TAB_BAR_ICON_SIZE}
        color={focused ? activeColor : inactiveColor}
      />
    </Animated.View>
  );
}

export function GlassFloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const instructor = isInstructorAccount(user?.accountType);
  const { left: insetLeft, right: insetRight } = useSafeAreaInsets();
  const nativeBottomInset = useNativeBottomInset();
  const onHeightChange = React.useContext(BottomTabBarHeightCallbackContext);

  const visibleRoutes = useMemo(
    () =>
      sortTabRoutes(
        state.routes.filter((route) => isTabRouteVisible(route.name, instructor)),
        instructor
      ),
    [state.routes, instructor]
  );

  const focusedKey = state.routes[state.index]?.key;
  const focusedVisibleIndex = Math.max(
    visibleRoutes.findIndex((route) => route.key === focusedKey),
    0
  );

  const pillWidth = floatingTabBarWidth(visibleRoutes.length);
  const indicatorX = useSharedValue(indicatorOffset(focusedVisibleIndex));

  useEffect(() => {
    indicatorX.value = withSpring(indicatorOffset(focusedVisibleIndex), INDICATOR_SPRING);
  }, [focusedVisibleIndex, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const onOuterLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onHeightChange?.(event.nativeEvent.layout.height);
    },
    [onHeightChange]
  );

  return (
    <View
      style={[
        styles.overlay,
        {
          paddingBottom: nativeBottomInset + TAB_BAR_BOTTOM_OFFSET,
          paddingLeft: insetLeft,
          paddingRight: insetRight,
        },
      ]}
      onLayout={onOuterLayout}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.shell,
          {
            width: pillWidth,
            backgroundColor: colors.tabBarPill,
            borderColor: colors.tabBarPillBorder,
            borderWidth: colors.tabBarPillBorder === 'transparent' ? 0 : 1,
          },
        ]}
      >
        <View style={styles.track}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                width: TAB_BAR_INDICATOR_SIZE,
                height: TAB_BAR_INDICATOR_SIZE,
                borderRadius: TAB_BAR_INDICATOR_SIZE / 2,
                backgroundColor: colors.tabBarIndicator,
                top: TAB_BAR_INDICATOR_INSET,
              },
              indicatorStyle,
            ]}
          />

          {visibleRoutes.map((route, index) => {
            const focused = route.key === focusedKey;
            const label = getTabBarLabel(route.name, instructor);
            const iconName = getTabBarIconName(route.name, false, instructor);

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={label}
                android_ripple={{ color: 'transparent', borderless: true }}
                onPress={() => {
                  if (!focused) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  }
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                }}
                style={[styles.tab, index < visibleRoutes.length - 1 && styles.tabGap]}
              >
                <TabBarIcon
                  focused={focused}
                  name={iconName}
                  activeColor={colors.tabBarIconActive}
                  inactiveColor={colors.tabBarIconInactive}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shell: {
    height: FLOATING_TAB_BAR_HEIGHT,
    borderRadius: SHELL_RADIUS,
    overflow: 'hidden',
    elevation: 0,
    shadowOpacity: 0,
    ...(Platform.OS === 'ios' ? { borderCurve: 'continuous' as const } : null),
  },
  track: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TAB_BAR_END_PAD,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  tab: {
    width: TAB_BAR_INDICATOR_SIZE,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabGap: {
    marginRight: TAB_BAR_ITEM_GAP,
  },
});
