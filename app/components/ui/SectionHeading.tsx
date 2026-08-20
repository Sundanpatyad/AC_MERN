import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/providers/AppThemeProvider';
import { AppPalette, Type } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  rightText?: string;
  onPressRight?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Large editorial serif title (home / marketing sections) */
  serif?: boolean;
  compact?: boolean;
};

export function SectionHeading({
  title,
  subtitle,
  rightText,
  onPressRight,
  style,
  serif = false,
  compact = false,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.root, style]}>
      <View style={styles.row}>
        <Text style={[styles.title, serif && styles.titleSerif, compact && styles.titleCompact]}>
          {title}
        </Text>
        {rightText && onPressRight && (
          <TouchableOpacity onPress={onPressRight} hitSlop={8}>
            <Text style={[styles.right, compact && styles.rightCompact]}>{rightText}</Text>
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
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    title: {
      ...Type.h3,
      color: colors.text,
    },
    titleSerif: {
      ...Type.h3,
    },
    titleCompact: {
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: -0.2,
    },
    right: {
      ...Type.caption,
      fontFamily: Type.nav.fontFamily,
      color: colors.textSecondary,
    },
    rightCompact: {
      fontSize: 13,
      lineHeight: 18,
    },
    subtitle: {
      ...Type.bodySmall,
      marginTop: 6,
      color: colors.textSecondary,
    },
  });
}

