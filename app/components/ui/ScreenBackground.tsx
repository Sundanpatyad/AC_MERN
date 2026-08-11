import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/AppThemeProvider';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Soft canvas with corner glow + faint grid — adapts to light/dark. */
export function ScreenBackground({ children, style }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]}>
      <LinearGradient
        colors={colors.glowTop}
        locations={[0, 0.35, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 0.55 }}
        style={styles.glowTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={colors.glowBottom}
        start={{ x: 0.5, y: 0.4 }}
        end={{ x: 1, y: 1 }}
        style={styles.glowBottom}
        pointerEvents="none"
      />
      <View style={[styles.grid, { opacity: colors.gridOpacity }]} pointerEvents="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.gridLineH,
              { top: `${(i + 1) * 8}%` as any, backgroundColor: colors.gridLine },
            ]}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.gridLineV,
              { left: `${(i + 1) * 11}%` as any, backgroundColor: colors.gridLine },
            ]}
          />
        ))}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  glowTop: {
    ...StyleSheet.absoluteFillObject,
    height: '55%',
  },
  glowBottom: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '70%',
    height: '45%',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
  },
});
