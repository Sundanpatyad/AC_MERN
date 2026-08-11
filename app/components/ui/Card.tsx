import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { useTheme } from '@/providers/AppThemeProvider';
import { Radii } from '@/constants/theme';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated';
  padding?: number;
};

/**
 * Neutral card primitive: border + subtle elevation/shadow.
 * Use this instead of per-screen one-off styles for clean consistency.
 */
export function Card({ children, style, variant = 'default', padding }: CardProps) {
  const { colors } = useTheme();

  const baseBackground =
    variant === 'elevated' ? colors.backgroundElevated : colors.surface;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: baseBackground,
          borderColor: colors.border,
          borderRadius: Radii.lg,
        },
        padding != null ? { padding } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    ...(Platform.OS === 'android'
      ? {
          elevation: 2,
        }
      : {}),
  },
});

