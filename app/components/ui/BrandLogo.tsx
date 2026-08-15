import React from 'react';
import { Image, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** Official AC monogram — cream serif on brand red, matching the app icon. */
export function BrandLogo({ size = 72, style }: Props) {
  const radius = Math.round(size * 0.163);
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: radius }, style]}>
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
  },
});
