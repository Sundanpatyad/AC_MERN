import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { useNativeBottomInset } from '../../lib/safeArea';
import { showMessage } from '../../providers/DialogProvider';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

export default function SignupScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();
  const bottomInset = useNativeBottomInset();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const onGoogle = async () => {
    if (isLoading) return;
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
          title: 'Sign up unavailable',
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
          title: 'Sign up failed',
          message: result.message,
          tone: 'danger',
        });
      }
    } catch (error: any) {
      await showMessage({
        title: 'Sign up failed',
        message: error?.message || 'Google Sign-In could not start.',
        tone: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={[styles.content, { paddingBottom: 24 + bottomInset }]}>
        <View>
          <View style={styles.brandRow}>
            <BrandLogo size={32} />
            <Text style={styles.brand}>Awakening Classes</Text>
          </View>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Join with Google and start preparing for your exams.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.googleBtn, { opacity: isLoading ? 0.7 : 1 }]}
          onPress={onGoogle}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <>
              <Ionicons name="logo-google" size={18} color={colors.text} />
              <Text style={styles.googleText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.secure}>Secure sign-up powered by Google</Text>
        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Use and Privacy Policy.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login">
            <Text style={styles.loginText}>Log In</Text>
          </Link>
        </View>
      </View>
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 20,
    },
    brand: {
      fontSize: 13,
      fontFamily: Fonts.bold,
      color: colors.textSecondary,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    title: {
      fontSize: 30,
      fontFamily: Fonts.bold,
      color: colors.text,
      marginBottom: 8,
      letterSpacing: -0.6,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 28,
    },
    googleBtn: {
      height: 52,
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    googleText: {
      color: colors.text,
      fontSize: 15,
      fontFamily: Fonts.semiBold,
    },
    secure: {
      marginTop: 16,
      textAlign: 'center',
      fontSize: 12,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
    },
    terms: {
      marginTop: 10,
      textAlign: 'center',
      fontSize: 12,
      fontFamily: Fonts.sans,
      color: colors.textMuted,
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontFamily: Fonts.sans,
    },
    loginText: {
      color: colors.text,
      fontSize: 14,
      fontFamily: Fonts.bold,
    },
  });
}
