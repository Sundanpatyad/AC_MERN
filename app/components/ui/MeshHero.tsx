import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/providers/AppThemeProvider';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Kept for existing callers. */
  fadeTo?: string;
  /** Hairline under the header. Default on for tab/settings screens. */
  divided?: boolean;
};

/** @deprecated No-op. Mesh fill was removed from headers. */
export function MeshFill() {
  return null;
}

/** Flat page header — same beige/ink as the screen, no gradient. */
export function MeshHero({ children, style, divided = true }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.hero,
        { backgroundColor: colors.background },
        divided && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export const ScreenHeader = MeshHero;

const styles = StyleSheet.create({
  hero: {
    backgroundColor: 'transparent',
  },
});
