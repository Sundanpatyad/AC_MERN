import { Platform } from 'react-native';

/**
 * Awakening Classes — Proton Pass–inspired dark palette.
 * Pure black base, soft white accents, glass surfaces, pill CTAs.
 */
export const Palette = {
  black: '#000000',
  background: '#000000',
  backgroundElevated: '#0A0A0A',
  surface: '#121212',
  surfaceRaised: '#1C1C1E',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textMuted: '#636366',
  accent: '#FFFFFF',
  accentMuted: '#D1D1D6',
  danger: '#FF453A',
  success: '#30D158',
  warning: '#FFD60A',
  glow: 'rgba(255,255,255,0.12)',
  overlay: 'rgba(0,0,0,0.55)',
  tabBar: 'rgba(18,18,18,0.92)',
} as const;

const tintColorLight = '#0a7ea4';
const tintColorDark = Palette.text;

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: Palette.text,
    background: Palette.background,
    tint: tintColorDark,
    icon: Palette.textSecondary,
    tabIconDefault: Palette.textMuted,
    tabIconSelected: Palette.text,
  },
};

export const Radii = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
