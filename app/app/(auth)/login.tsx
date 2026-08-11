import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';
import { AppPalette } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiConnector.post(endpoints.LOGIN_API, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        const userImage =
          user?.image ||
          `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`;

        await setToken(token);
        await setUser({ ...user, image: userImage });

        router.replace('/(tabs)');
      }
    } catch (error: any) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <View style={styles.header}>
              <View style={styles.brandRow}>
                <BrandLogo size={22} />
                <Text style={styles.brand}>AWAKENING CLASSES</Text>
              </View>

              <Text style={styles.title}>Log in</Text>
              <Text style={styles.terms}>By logging in, you agree to our Terms of Use.</Text>
            </View>

            <View style={styles.form}>
              <Input
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Input
                placeholder="Your password"
                isPassword
                value={password}
                onChangeText={setPassword}
              />

              <Link href="/(auth)/forgot-password" style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Link>

              <Button
                title="Log in"
                onPress={handleLogin}
                isLoading={isLoading}
                style={styles.cta}
              />

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Or</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialStack}>
                <SocialButton
                  icon={
                    <Ionicons name="logo-google" size={18} color={colors.text} />
                  }
                  title="Sign in with google"
                  onPress={async () => {
                    setIsLoading(true);
                    const { handleGoogleLogin } = await import('../../services/googleAuth');
                    const result = await handleGoogleLogin();
                    setIsLoading(false);

                    if (result.success) {
                      router.replace('/(tabs)');
                    }
                  }}
                  disabled={isLoading}
                />
              </View>

              <Text style={styles.privacyText}>
                For more information, please see our Privacy policy.
              </Text>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Link href="/(auth)/signup">
                  <Text style={styles.signupText}>Sign Up</Text>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    flex: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 18,
      paddingVertical: 26,
    },
    header: {
      marginBottom: 10,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    brand: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
      letterSpacing: -0.4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    terms: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 18,
      marginBottom: 6,
    },
    form: {
      gap: 2,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginTop: 8,
      marginBottom: 4,
    },
    forgotPasswordText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    cta: {
      marginTop: 16,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    divider: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.borderStrong,
    },
    dividerText: {
      color: colors.textMuted,
      paddingHorizontal: 16,
      fontSize: 12,
      fontWeight: '600',
    },
    socialStack: {
      gap: 10,
      marginTop: 6,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    signupText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    privacyText: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 6,
    },
  });
}

function SocialButton({
  icon,
  title,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    btn: {
      height: 44,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    btnText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
  });

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon}
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
}
