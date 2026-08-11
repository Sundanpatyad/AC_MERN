import React from 'react';
import { Image, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Radii } from '@/constants/theme';

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** Official Awakening Classes mark — used on auth, about, and branding surfaces. */
export function BrandLogo({ size = 72, style }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.22 }, style]}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: size, height: size }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderRadius: Radii.lg,
  },
});
