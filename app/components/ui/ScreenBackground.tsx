import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Deep black canvas with soft corner glow + faint grid. */
export function ScreenBackground({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.02)', 'transparent']}
        locations={[0, 0.35, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 0.55 }}
        style={styles.glowTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.04)']}
        start={{ x: 0.5, y: 0.4 }}
        end={{ x: 1, y: 1 }}
        style={styles.glowBottom}
        pointerEvents="none"
      />
      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 8}%` as any }]} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 11}%` as any }]} />
        ))}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background,
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
    opacity: 0.045,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#fff',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});
