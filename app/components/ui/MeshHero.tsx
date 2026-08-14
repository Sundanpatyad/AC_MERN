import React from 'react';
import { Platform, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Kept for callers. Header is a full mesh, not a fade. */
  fadeTo: string;
};

/** Clean light-blue + white mesh layers. */
export function MeshFill() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, styles.base]} />
      <LinearGradient
        colors={['#DBEAFE', '#BFDBFE', '#93C5FD']}
        locations={[0, 0.48, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(96, 165, 250, 0.55)', 'rgba(147, 197, 253, 0.35)', 'transparent']}
        locations={[0, 0.5, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(186, 230, 253, 0.7)', 'rgba(147, 197, 253, 0.4)', 'rgba(59, 130, 246, 0.28)']}
        locations={[0, 0.42, 1]}
        start={{ x: 0, y: 0.1 }}
        end={{ x: 1, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

/** Light blue + white mesh used on app headers. */
export function MeshHero({ children, style }: Props) {
  return (
    <View style={[styles.hero, style]}>
      <View style={styles.heroClip} pointerEvents="none">
        <MeshFill />
      </View>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#BFDBFE',
  },
  hero: {
    overflow: 'visible',
    backgroundColor: '#BFDBFE',
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
