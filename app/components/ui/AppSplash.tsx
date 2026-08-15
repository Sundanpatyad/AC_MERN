import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/providers/AppThemeProvider';
import { BrandLogo } from './BrandLogo';

/** Branded launch screen shown while fonts and session hydrate. */
export function AppSplash() {
  const { colors } = useTheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBarStyle} />
      <BrandLogo size={96} />
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontFamily: Platform.select({ ios: 'System', default: 'sans-serif' }),
          },
        ]}
      >
        Awakening Classes
      </Text>
      <Text style={[styles.tag, { color: colors.textMuted }]}>Learn · Grow · Succeed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  tag: {
    marginTop: 6,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
