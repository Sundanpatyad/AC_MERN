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
  brand: string;
  brandSoft: string;
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
  /** Header mesh — website cream/ink + brand red */
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
  black: '#14130F',
  background: '#14130F',
  backgroundElevated: '#1C1B16',
  surface: '#1C1B16',
  surfaceRaised: '#25241E',
  border: '#2E2C24',
  borderStrong: 'rgba(225,224,204,0.16)',
  text: '#E1E0CC',
  textSecondary: '#B5B39F',
  textMuted: '#8A8778',
  accent: '#E1E0CC',
  accentMuted: '#B5B39F',
  danger: '#FF4444',
  brand: '#FF0000',
  brandSoft: 'rgba(255, 0, 0, 0.16)',
  success: '#30D158',
  warning: '#FFD60A',
  glow: 'rgba(225,224,204,0.08)',
  overlay: 'rgba(20, 19, 15, 0.65)',
  tabBar: 'rgba(28,27,22,0.92)',
  tabBarPill: '#E1E0CC',
  tabBarIndicator: '#14130F',
  tabBarIconActive: '#E1E0CC',
  tabBarIconInactive: '#14130F',
  tabBarPillBorder: 'transparent',
  primaryGradient: ['#E1E0CC', '#F0EFDE'],
  primaryButtonText: '#14130F',
  primaryShadow: '#E1E0CC',
  statusBarStyle: 'light',
  meshMagenta: 'rgba(255, 0, 0, 0.16)',
  meshPurple: 'rgba(225, 224, 204, 0.08)',
  meshCream: 'rgba(225, 224, 204, 0.12)',
  meshHot: 'rgba(255, 0, 0, 0.10)',
  meshBase: '#14130F',
  meshGlow: ['#1C1B16', '#14130F', '#25241E'],
  meshWash: ['rgba(255,0,0,0.18)', 'rgba(255,0,0,0.06)', 'transparent'],
  glowTop: ['rgba(225,224,204,0.10)', 'rgba(255,0,0,0.08)', 'transparent'],
  glowBottom: ['transparent', 'rgba(255,0,0,0.12)'],
  gridLine: '#E1E0CC',
  gridOpacity: 0.04,
  refreshTint: '#E1E0CC',
};

export const PaletteLight: AppPalette = {
  black: '#16150F',
  background: '#E8E6D4',
  backgroundElevated: '#F3F1E0',
  surface: '#F3F1E0',
  surfaceRaised: '#DDDAC4',
  border: '#CFCBB3',
  borderStrong: 'rgba(22,21,15,0.16)',
  text: '#16150F',
  textSecondary: '#5A584C',
  textMuted: '#8A8778',
  accent: '#16150F',
  accentMuted: '#5A584C',
  danger: '#FF0000',
  brand: '#FF0000',
  brandSoft: 'rgba(255, 0, 0, 0.10)',
  success: '#34C759',
  warning: '#FF9500',
  glow: 'rgba(22,21,15,0.06)',
  overlay: 'rgba(22, 21, 15, 0.45)',
  tabBar: 'rgba(243,241,224,0.94)',
  tabBarPill: '#16150F',
  tabBarIndicator: '#E8E6D4',
  tabBarIconActive: '#16150F',
  tabBarIconInactive: '#E1E0CC',
  tabBarPillBorder: 'transparent',
  primaryGradient: ['#16150F', '#0C0B08'],
  primaryButtonText: '#E8E6D4',
  primaryShadow: '#16150F',
  statusBarStyle: 'dark',
  meshMagenta: 'rgba(255, 0, 0, 0.12)',
  meshPurple: 'rgba(255, 255, 255, 0.35)',
  meshCream: 'rgba(243, 241, 224, 0.7)',
  meshHot: 'rgba(255, 0, 0, 0.08)',
  meshBase: '#E8E6D4',
  meshGlow: ['#F3F1E0', '#E8E6D4', '#DDDAC4'],
  meshWash: ['rgba(255,0,0,0.12)', 'rgba(255,0,0,0.04)', 'transparent'],
  glowTop: ['rgba(255,255,255,0.42)', 'rgba(255,0,0,0.08)', 'transparent'],
  glowBottom: ['transparent', 'rgba(255,0,0,0.08)'],
  gridLine: '#16150F',
  gridOpacity: 0.045,
  refreshTint: '#16150F',
};

/** @deprecated Prefer useTheme().colors — kept as dark default for legacy static styles. */
export const Palette = PaletteDark;

export function resolvePalette(scheme: ColorScheme): AppPalette {
  return scheme === 'light' ? PaletteLight : PaletteDark;
}

const tintColorLight = PaletteLight.brand;
const tintColorDark = PaletteDark.brand;

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
