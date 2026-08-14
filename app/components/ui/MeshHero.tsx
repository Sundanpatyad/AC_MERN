import React from 'react';
import { Platform, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/AppThemeProvider';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Kept for callers. Header is a full mesh, not a fade. */
  fadeTo: string;
};

/** Website cream/ink mesh with a soft brand-red glow. */
export function MeshFill() {
  const { colors } = useTheme();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.meshBase }]} />
      <LinearGradient
        colors={colors.meshGlow}
        locations={[0, 0.48, 1]}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.88, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={colors.meshWash}
        locations={[0, 0.52, 1]}
        start={{ x: 0.85, y: 1 }}
        end={{ x: 0.15, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={colors.glowTop}
        locations={[0, 0.42, 1]}
        start={{ x: 0.18, y: 0 }}
        end={{ x: 0.8, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

/** Header mesh matching the website color scheme. */
export function MeshHero({ children, style }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.hero, { backgroundColor: colors.meshBase }, style]}>
      <View style={styles.heroClip} pointerEvents="none">
        <MeshFill />
      </View>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
    ...(Platform.OS === 'ios' ? { borderCurve: 'continuous' as const } : null),
  },
  heroClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...(Platform.OS === 'ios' ? { borderCurve: 'continuous' as const } : null),
  },
  inner: {
    position: 'relative',
  },
});
