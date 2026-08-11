import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/providers/AppThemeProvider';
import { AppPalette } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  rightText?: string;
  onPressRight?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeading({ title, subtitle, rightText, onPressRight, style }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.root, style]}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {rightText && onPressRight && (
          <TouchableOpacity onPress={onPressRight} hitSlop={8}>
            <Text style={styles.right}>{rightText}</Text>
          </TouchableOpacity>
        )}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    root: {
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.2,
    },
    right: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });
}

