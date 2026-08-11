import { Platform } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

export type AppPalette = {
  black: string;
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentMuted: string;
  danger: string;
  success: string;
  warning: string;
  glow: string;
  overlay: string;
  tabBar: string;
  primaryGradient: [string, string];
  primaryButtonText: string;
  primaryShadow: string;
  statusBarStyle: 'light' | 'dark';
  /** Aurora mesh blobs — soft overlapping glows at the top of screens */
  meshMagenta: string;
  meshPurple: string;
  meshCream: string;
  meshHot: string;
  glowTop: [string, string, string];
  glowBottom: [string, string];
  gridLine: string;
  gridOpacity: number;
  refreshTint: string;
};

export const PaletteDark: AppPalette = {
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
  primaryGradient: ['#FFFFFF', '#D1D1D6'],
  primaryButtonText: '#000000',
  primaryShadow: '#FFFFFF',
  statusBarStyle: 'light',
  meshMagenta: 'rgba(255, 255, 255, 0.12)',
  meshPurple: 'rgba(255, 255, 255, 0.06)',
  meshCream: 'rgba(255, 255, 255, 0.1)',
  meshHot: 'rgba(255, 255, 255, 0.08)',
  glowTop: ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.02)', 'transparent'],
  glowBottom: ['transparent', 'rgba(255,255,255,0.04)'],
  gridLine: '#FFFFFF',
  gridOpacity: 0.045,
  refreshTint: '#FFFFFF',
};

export const PaletteLight: AppPalette = {
  black: '#000000',
  background: '#F2F2F7',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceRaised: '#EBEBF0',
  border: 'rgba(0,0,0,0.08)',
  borderStrong: 'rgba(0,0,0,0.14)',
  text: '#111111',
  textSecondary: '#6C6C70',
  textMuted: '#8E8E93',
  accent: '#111111',
  accentMuted: '#3A3A3C',
  danger: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  glow: 'rgba(0,0,0,0.06)',
  overlay: 'rgba(0,0,0,0.4)',
  tabBar: 'rgba(255,255,255,0.94)',
  primaryGradient: ['#1C1C1E', '#3A3A3C'],
  primaryButtonText: '#FFFFFF',
  primaryShadow: '#000000',
  statusBarStyle: 'dark',
  meshMagenta: 'rgba(0, 0, 0, 0.04)',
  meshPurple: 'rgba(0, 0, 0, 0.03)',
  meshCream: 'rgba(255, 255, 255, 0.5)',
  meshHot: 'rgba(0, 0, 0, 0.02)',
  glowTop: ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.015)', 'transparent'],
  glowBottom: ['transparent', 'rgba(0,0,0,0.03)'],
  gridLine: '#000000',
  gridOpacity: 0.035,
  refreshTint: '#111111',
};

/** @deprecated Prefer useTheme().colors — kept as dark default for legacy static styles. */
export const Palette = PaletteDark;

export function resolvePalette(scheme: ColorScheme): AppPalette {
  return scheme === 'light' ? PaletteLight : PaletteDark;
}

const tintColorLight = '#0a7ea4';
const tintColorDark = PaletteDark.text;

export const Colors = {
  light: {
    text: PaletteLight.text,
    background: PaletteLight.background,
    tint: tintColorLight,
    icon: PaletteLight.textSecondary,
    tabIconDefault: PaletteLight.textMuted,
    tabIconSelected: PaletteLight.text,
  },
  dark: {
    text: PaletteDark.text,
    background: PaletteDark.background,
    tint: tintColorDark,
    icon: PaletteDark.textSecondary,
    tabIconDefault: PaletteDark.textMuted,
    tabIconSelected: PaletteDark.text,
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
    mono: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
});
