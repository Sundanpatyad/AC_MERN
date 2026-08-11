import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/AppThemeProvider';

type PageProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Horizontal padding used across screens */
  paddingHorizontal?: number;
  /** Extra top padding on top of safe-area inset */
  paddingTopExtra?: number;
};

/**
 * Consistent page spacing wrapper (does not include background).
 * Most screens already use <ScreenBackground>, so this wrapper focuses on layout.
 */
export function Page({
  children,
  style,
  paddingHorizontal = 20,
  paddingTopExtra = 0,
}: PageProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          paddingHorizontal,
          paddingTop:
            Math.max(insets.top, 0) + paddingTopExtra + (Platform.OS === 'android' ? 0 : 0),
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

