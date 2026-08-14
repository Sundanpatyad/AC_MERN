import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { MeshHero } from '../../components/ui/MeshHero';
import { showMessage } from '../../providers/DialogProvider';
import { useTheme } from '../../providers/AppThemeProvider';
import { AppPalette, Fonts, Type } from '../../constants/theme';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const onGoogle = async () => {
    if (isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsLoading(true);
    try {
      const googleAuth = await import('../../services/googleAuth');
      const imported = googleAuth as {
        handleGoogleLogin?: unknown;
        default?: { handleGoogleLogin?: unknown } | ((...args: never[]) => unknown);
      };
      const handleGoogleLogin =
        imported.handleGoogleLogin ??
        (typeof imported.default === 'function'
          ? imported.default
          : imported.default?.handleGoogleLogin);

      if (typeof handleGoogleLogin !== 'function') {
        await showMessage({
          title: 'Sign in unavailable',
          message: 'Google Sign-In is not available. Use a development build, not Expo Go.',
          tone: 'danger',
        });
        return;
      }

      const result = await (handleGoogleLogin as () => Promise<{
        success: boolean;
        message?: string;
      }>)();

      if (result.success) {
        router.replace('/(tabs)');
        return;
      }

      const cancelled = (result.message || '').toLowerCase().includes('cancel');
      if (!cancelled && result.message) {
        await showMessage({
          title: 'Sign in failed',
          message: result.message,
          tone: 'danger',
        });
      }
    } catch (error: any) {
      await showMessage({
        title: 'Sign in failed',
        message: error?.message || 'Google Sign-In could not start.',
        tone: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <MeshHero
        fadeTo={colors.background}
        style={{ paddingTop: insets.top + 16, paddingBottom: 28 }}
      >
        <Text style={styles.brand}>Awakening Classes</Text>
        <Text style={styles.headline}>
          Learn more.{'\n'}
          <Text style={styles.headlineMuted}>Achieve more.</Text>
        </Text>
      </MeshHero>

      <View style={styles.body}>
        <View style={styles.mock} pointerEvents="none">
          <View style={styles.mockTop}>
            <Text style={styles.mockMeta}>Full Mock · Q 12 / 100</Text>
            <Text style={styles.mockTimer}>29:41</Text>
          </View>
          <Text style={styles.mockQuestion}>If x² + 5x + 6 = 0, the roots are</Text>
          {[
            { label: 'A', text: '−2 and −3', selected: true },
            { label: 'B', text: '−1 and −6', selected: false },
            { label: 'C', text: '2 and 3', selected: false },
            { label: 'D', text: '1 and 6', selected: false },
          ].map((option) => (
            <View
              key={option.label}
              style={[styles.mockOption, option.selected && styles.mockOptionOn]}
            >
              <View style={[styles.mockRadio, option.selected && styles.mockRadioOn]}>
                <Text style={[styles.mockLabel, option.selected && styles.mockLabelOn]}>
                  {option.label}
                </Text>
              </View>
              <Text style={[styles.mockOptionText, option.selected && styles.mockOptionTextOn]}>
                {option.text}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
          <Pressable
            onPress={onGoogle}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Login with Google"
            style={({ pressed }) => [
              styles.cta,
              { opacity: isLoading ? 0.72 : pressed ? 0.9 : 1 },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={isDark ? '#111111' : '#FFFFFF'} />
            ) : (
              <>
                <View style={styles.googleMark}>
                  <Image
                    source={require('../../assets/images/google-g.png')}
                    style={styles.googleIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.ctaText}>Login with Google</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.footer}>
            By continuing you confirm that you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Use</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: AppPalette, isDark: boolean) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    brand: {
      ...Type.h3,
      paddingHorizontal: 24,
      color: '#0F172A',
      marginBottom: 18,
    },
    headline: {
      ...Type.hero,
      paddingHorizontal: 24,
      color: '#0F172A',
    },
    headlineMuted: {
      ...Type.heroEmphasis,
      color: 'rgba(15,23,42,0.55)',
    },
    body: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: 'space-between',
    },
    mock: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mockTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    mockMeta: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: Fonts.medium,
    },
    mockTimer: {
      color: colors.text,
      fontSize: 13,
      fontFamily: Fonts.semiBold,
    },
    mockQuestion: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 22,
      fontFamily: Fonts.semiBold,
      marginBottom: 12,
    },
    mockOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 40,
      borderRadius: 12,
      paddingHorizontal: 10,
      marginBottom: 6,
      backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
    },
    mockOptionOn: {
      backgroundColor: isDark ? '#FFFFFF' : '#111111',
    },
    mockRadio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
    },
    mockRadioOn: {
      backgroundColor: isDark ? '#111111' : '#FFFFFF',
    },
    mockLabel: {
      fontSize: 11,
      fontFamily: Fonts.semiBold,
      color: colors.textSecondary,
    },
    mockLabelOn: {
      color: isDark ? '#FFFFFF' : '#111111',
    },
    mockOptionText: {
      fontSize: 14,
      fontFamily: Fonts.medium,
      color: colors.text,
    },
    mockOptionTextOn: {
      color: isDark ? '#111111' : '#FFFFFF',
    },
    actions: {
      paddingTop: 16,
    },
    cta: {
      height: 56,
      borderRadius: 999,
      backgroundColor: isDark ? '#FFFFFF' : '#1C1C1E',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    googleMark: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleIcon: {
      width: 16,
      height: 16,
    },
    ctaText: {
      ...Type.button,
      color: isDark ? '#111111' : '#FFFFFF',
    },
    footer: {
      ...Type.caption,
      marginTop: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    footerLink: {
      ...Type.link,
      color: colors.text,
      textDecorationLine: 'underline',
    },
  });
}
