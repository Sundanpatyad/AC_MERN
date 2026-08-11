import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radii } from '@/constants/theme';
import { useTheme } from '@/providers/AppThemeProvider';

type Props = {
  iconName: any;
  label: string;
  onPress?: () => void;
  rightText?: string;
  style?: any;
  iconColor?: string;
  labelColor?: string;
  showChevron?: boolean;
};

export function ListRow({
  iconName,
  label,
  onPress,
  rightText,
  style,
  iconColor,
  labelColor,
  showChevron = true,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const Comp: any = onPress ? TouchableOpacity : View;

  return (
    <Comp
      {...(onPress ? { onPress, activeOpacity: 0.7, accessibilityRole: 'button' } : null)}
      style={[styles.root, style]}
    >
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Ionicons name={iconName} size={18} color={iconColor || colors.text} />
        </View>
        <Text style={[styles.label, { color: labelColor || colors.text }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      {rightText ? (
        <Text style={styles.rightText} numberOfLines={1}>
          {rightText}
        </Text>
      ) : showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </Comp>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: Radii.lg,
      gap: 12,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      minWidth: 0,
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surfaceRaised,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    label: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
      flex: 1,
    },
    rightText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
  });
}

