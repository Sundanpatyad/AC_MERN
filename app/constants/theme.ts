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
  /** Floating pill tab bar */
  tabBarPill: string;
  tabBarIndicator: string;
  tabBarIconActive: string;
  tabBarIconInactive: string;
  tabBarPillBorder: string;
  primaryGradient: [string, string];
  primaryButtonText: string;
  primaryShadow: string;
  statusBarStyle: 'light' | 'dark';
  /** Aurora mesh blobs — soft overlapping glows at the top of screens */
  meshMagenta: string;
  meshPurple: string;
  meshCream: string;
  meshHot: string;
  /** Header mesh — Zentra-style blue glow */
  meshBase: string;
  meshGlow: [string, string, string];
  meshWash: [string, string, string];
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
  tabBarPill: '#111111',
  tabBarIndicator: '#FFFFFF',
  tabBarIconActive: '#111111',
  tabBarIconInactive: '#FFFFFF',
  tabBarPillBorder: 'transparent',
  primaryGradient: ['#FFFFFF', '#D1D1D6'],
  primaryButtonText: '#000000',
  primaryShadow: '#FFFFFF',
  statusBarStyle: 'light',
  meshMagenta: 'rgba(255, 255, 255, 0.12)',
  meshPurple: 'rgba(255, 255, 255, 0.06)',
  meshCream: 'rgba(255, 255, 255, 0.1)',
  meshHot: 'rgba(255, 255, 255, 0.08)',
  meshBase: '#F8FBFF',
  meshGlow: ['rgba(191, 219, 254, 0.7)', 'rgba(239, 246, 255, 0.5)', 'transparent'],
  meshWash: ['rgba(219, 234, 254, 0.85)', 'rgba(255, 255, 255, 0.9)', 'transparent'],
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
  tabBarPill: '#FFFFFF',
  tabBarIndicator: '#111111',
  tabBarIconActive: '#FFFFFF',
  tabBarIconInactive: '#111111',
  tabBarPillBorder: 'rgba(0,0,0,0.1)',
  primaryGradient: ['#1C1C1E', '#3A3A3C'],
  primaryButtonText: '#FFFFFF',
  primaryShadow: '#000000',
  statusBarStyle: 'dark',
  meshMagenta: 'rgba(0, 0, 0, 0.04)',
  meshPurple: 'rgba(0, 0, 0, 0.03)',
  meshCream: 'rgba(255, 255, 255, 0.5)',
  meshHot: 'rgba(0, 0, 0, 0.02)',
  meshBase: '#F8FBFF',
  meshGlow: ['rgba(191, 219, 254, 0.65)', 'rgba(239, 246, 255, 0.45)', 'transparent'],
  meshWash: ['rgba(219, 234, 254, 0.8)', 'rgba(255, 255, 255, 0.92)', 'transparent'],
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
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Fonts = {
  sans: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  serif: 'Inter_600SemiBold',
  rounded: 'Inter_500Medium',
  mono: Platform.select({
    ios: 'ui-monospace',
    default: 'monospace',
    web: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  }) as string,
} as const;

/** App type scale — Inter 400 / 500 / 600 / 700 */
export const Type = {
  display: {
    fontFamily: Fonts.medium,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  hero: {
    fontFamily: Fonts.sans,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.6,
  },
  heroEmphasis: {
    fontFamily: Fonts.semiBold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.6,
  },
  h1: {
    fontFamily: Fonts.semiBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: Fonts.semiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  title: {
    fontFamily: Fonts.medium,
    fontSize: 17,
    lineHeight: 23,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    lineHeight: 20,
  },
  buttonSmall: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  nav: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  link: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
} as const;
