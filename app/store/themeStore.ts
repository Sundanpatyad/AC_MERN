import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import type { ColorScheme, ThemePreference } from '../constants/theme';

const STORAGE_KEY = 'ac_theme_pref';

type ThemeState = {
  preference: ThemePreference;
  systemScheme: ColorScheme;
  hydrated: boolean;
  setPreference: (preference: ThemePreference) => Promise<void>;
  hydrate: () => Promise<void>;
  setSystemScheme: (scheme: ColorSchemeName) => void;
  resolvedScheme: () => ColorScheme;
};

function normalizeScheme(scheme: ColorSchemeName): ColorScheme {
  return scheme === 'light' ? 'light' : 'dark';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: 'system',
  systemScheme: normalizeScheme(Appearance.getColorScheme()),
  hydrated: false,

  setPreference: async (preference) => {
    set({ preference });
    await AsyncStorage.setItem(STORAGE_KEY, preference);
  },

  setSystemScheme: (scheme) => {
    set({ systemScheme: normalizeScheme(scheme) });
  },

  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        set({ preference: saved, hydrated: true });
        return;
      }
    } catch (e) {
      console.error('Failed to hydrate theme preference', e);
    }
    set({ hydrated: true });
  },

  resolvedScheme: () => {
    const { preference, systemScheme } = get();
    if (preference === 'system') return systemScheme;
    return preference;
  },
}));
