import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/providers/AppThemeProvider';
import { AppPalette, Fonts } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  rightText?: string;
  onPressRight?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Large editorial serif title (home / marketing sections) */
  serif?: boolean;
};

export function SectionHeading({
  title,
  subtitle,
  rightText,
  onPressRight,
  style,
  serif = false,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.root, style]}>
      <View style={styles.row}>
        <Text style={[styles.title, serif && styles.titleSerif]}>{title}</Text>
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
    titleSerif: {
      fontSize: 26,
      fontFamily: Fonts.semiBold,
      letterSpacing: -0.3,
      lineHeight: 32,
    },
    right: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      paddingBottom: 4,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });
}

