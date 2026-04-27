import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

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
  textStyle
}: ButtonProps) {
  
  const getBackgroundColor = () => {
    if (disabled) return '#333';
    switch (variant) {
      case 'primary': return '#ffffff';
      case 'secondary': return '#1a1a1a';
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return '#ffffff';
    }
  };

  const getTextColor = () => {
    if (disabled) return '#888';
    switch (variant) {
      case 'primary': return '#000000';
      case 'secondary': return '#ffffff';
      case 'outline': return '#ffffff';
      case 'ghost': return '#a1a1aa';
      default: return '#000000';
    }
  };

  const getBorderColor = () => {
    if (disabled) return '#333';
    if (variant === 'outline') return '#333';
    if (variant === 'secondary') return '#333';
    return 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
