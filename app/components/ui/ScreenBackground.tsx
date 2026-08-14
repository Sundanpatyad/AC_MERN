import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/providers/AppThemeProvider';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Solid page canvas. Mesh gradient lives only in the top header. */
export function ScreenBackground({ children, style }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]}>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
