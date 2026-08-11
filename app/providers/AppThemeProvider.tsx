import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Appearance } from 'react-native';
import {
  AppPalette,
  ColorScheme,
  ThemePreference,
  resolvePalette,
} from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';

type ThemeContextValue = {
  preference: ThemePreference;
  colorScheme: ColorScheme;
  isDark: boolean;
  colors: AppPalette;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useThemeStore((s) => s.systemScheme);
  const setPreference = useThemeStore((s) => s.setPreference);
  const setSystemScheme = useThemeStore((s) => s.setSystemScheme);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, [setSystemScheme]);

  const colorScheme: ColorScheme =
    preference === 'system' ? systemScheme : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      colorScheme,
      isDark: colorScheme === 'dark',
      colors: resolvePalette(colorScheme),
      setPreference,
    }),
    [preference, colorScheme, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within AppThemeProvider');
  }
  return ctx;
}
