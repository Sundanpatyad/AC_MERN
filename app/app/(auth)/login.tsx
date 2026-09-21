import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNativeBottomInset } from '../../lib/safeArea';
import * as Haptics from 'expo-haptics';

import { MeshHero } from '../../components/ui/MeshHero';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { Input } from '../../components/ui/Input';
import { showMessage } from '../../providers/DialogProvider';
import { useTheme } from '../../providers/AppThemeProvider';
import { AppPalette, Fonts, Type } from '../../constants/theme';
import { loginWithPassword } from '../../services/emailAuth';

type Busy = 'email' | 'google' | null;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<Busy>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = useNativeBottomInset();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const onEmailLogin = async () => {
    if (busy) return;
    const trimmed = email.trim();
    if (!trimmed || !password) {
      await showMessage({
        title: 'Missing details',
        message: 'Enter email and password to continue.',
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setBusy('email');
    try {
      const result = await loginWithPassword(trimmed, password);
      if (result.success) {
        router.replace('/(tabs)');
        return;
      }
      await showMessage({
        title: 'Sign in failed',
        message: result.message || 'Check your email and password.',
        tone: 'danger',
      });
    } catch (error: any) {
      await showMessage({
        title: 'Sign in failed',
        message: error?.response?.data?.message || error?.message || 'Could not sign in.',
        tone: 'danger',
      });
    } finally {
      setBusy(null);
    }
  };

  const onGoogle = async () => {
    if (busy) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setBusy('google');
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
          message: 'Google Sign-In is not available. Use email and password, or a development build.',
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
      setBusy(null);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style={colors.statusBarStyle} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: bottomInset + 16 }}
        >
          <MeshHero
            fadeTo={colors.background}
            divided={false}
            style={{ paddingTop: insets.top + 16, paddingBottom: 24 }}
          >
            <View style={styles.brandRow}>
              <BrandLogo size={36} />
              <Text style={styles.brand}>Awakening Classes</Text>
            </View>
            <Text style={styles.headline}>
              Learn more.{'\n'}
              <Text style={styles.headlineMuted}>Achieve more.</Text>
            </Text>
          </MeshHero>

          <View style={styles.body}>
            <Input
              label="Email"
              placeholder="you@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="username"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />
            <Input
              label="Password"
              placeholder="Password"
              isPassword
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={onEmailLogin}
            />

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable hitSlop={8} style={styles.forgotWrap}>
                <Text style={styles.forgot}>Forgot password?</Text>
              </Pressable>
            </Link>

            <Pressable
              onPress={onEmailLogin}
              disabled={!!busy}
              accessibilityRole="button"
              accessibilityLabel="Log in"
              style={({ pressed }) => [
                styles.cta,
                { opacity: busy === 'email' ? 0.72 : pressed ? 0.9 : 1 },
              ]}
            >
              {busy === 'email' ? (
                <ActivityIndicator color={colors.primaryButtonText} />
              ) : (
                <Text style={styles.ctaText}>Log in</Text>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <Pressable
              onPress={onGoogle}
              disabled={!!busy}
              accessibilityRole="button"
              accessibilityLabel="Login with Google"
              style={({ pressed }) => [
                styles.googleBtn,
                { opacity: busy === 'google' ? 0.72 : pressed ? 0.9 : 1 },
              ]}
            >
              {busy === 'google' ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <>
                  <View style={styles.googleMark}>
                    <Image
                      source={require('../../assets/images/google-g.png')}
                      style={styles.googleIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.googleText}>Continue with Google</Text>
                </>
              )}
            </Pressable>

            <Text style={styles.footer}>
              By continuing you confirm that you agree to our{' '}
              <Text style={styles.footerLink}>Terms of Use</Text> and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 24,
      marginBottom: 18,
    },
    brand: {
      ...Type.h3,
      color: colors.text,
      marginBottom: 0,
    },
    headline: {
      ...Type.hero,
      paddingHorizontal: 24,
      color: colors.text,
    },
    headlineMuted: {
      ...Type.heroEmphasis,
      color: colors.textSecondary,
    },
    body: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 8,
    },
    forgotWrap: {
      alignSelf: 'flex-end',
      marginBottom: 14,
      marginTop: 2,
    },
    forgot: {
      fontSize: 13,
      fontFamily: Fonts.medium,
      color: colors.textSecondary,
    },
    cta: {
      height: 56,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaText: {
      ...Type.button,
      color: colors.primaryButtonText,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginVertical: 18,
    },
    divider: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 12,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
    },
    googleBtn: {
      height: 52,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
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
    googleText: {
      ...Type.button,
      color: colors.text,
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
