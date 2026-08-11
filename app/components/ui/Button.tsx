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
import { Palette, Radii } from '@/constants/theme';

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
  const textColor =
    disabled
      ? Palette.textMuted
      : variant === 'primary'
        ? Palette.black
        : Palette.text;

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
        style={[styles.button, styles.primaryShadow, style]}
      >
        <LinearGradient
          colors={[Palette.text, Palette.accentMuted]}
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
    ? Palette.surface
    : variant === 'secondary'
      ? Palette.surfaceRaised
      : 'transparent';

  const borderColor =
    variant === 'outline' || variant === 'secondary'
      ? Palette.borderStrong
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
    height: 52,
    borderRadius: Radii.pill,
    marginVertical: 4,
    overflow: 'hidden',
  },
  primaryShadow: {
    shadowColor: '#fff',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  gradientFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  solidFill: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
