import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Radii, Type } from '@/constants/theme';
import { useTheme } from '@/providers/AppThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const textColor =
    disabled
      ? colors.textMuted
      : variant === 'primary'
        ? colors.primaryButtonText
        : colors.text;

  const content = isLoading ? (
    <ActivityIndicator color={textColor} />
  ) : (
    <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.85}
        style={[
          styles.button,
          {
            shadowColor: colors.primaryShadow,
            shadowOpacity: 0.12,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          },
          style,
        ]}
      >
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientFill}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const backgroundColor = disabled
    ? colors.surface
    : variant === 'secondary'
      ? colors.surfaceRaised
      : 'transparent';

  const borderColor =
    variant === 'outline' || variant === 'secondary'
      ? colors.borderStrong
      : 'transparent';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles.solidFill,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
          opacity: disabled ? 0.55 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: Radii.pill,
    marginVertical: 4,
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  solidFill: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    ...Type.button,
  },
});
