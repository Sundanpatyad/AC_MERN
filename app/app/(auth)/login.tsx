import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';
import { Palette } from '../../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
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

        Toast.show({ type: 'success', text1: 'Login Successful' });
        router.replace('/(tabs)');
      } else {
        Toast.show({ type: 'error', text1: response.data.message || 'Login failed' });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Something went wrong',
      });
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
          <View style={styles.header}>
            <BrandLogo size={88} style={styles.logo} />
            <Text style={styles.brand}>Awakening Classes</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in to continue your learning journey</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              isPassword
              value={password}
              onChangeText={setPassword}
            />

            <Link href="/(auth)/forgot-password" style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Link>

            <Button title="Log In" onPress={handleLogin} isLoading={isLoading} style={styles.cta} />

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <Button
              title="Continue with Google"
              onPress={async () => {
                const { handleGoogleLogin } = await import('../../services/googleAuth');
                setIsLoading(true);
                const result = await handleGoogleLogin();
                setIsLoading(false);

                if (result.success) {
                  Toast.show({ type: 'success', text1: 'Google Login Successful' });
                  router.replace('/(tabs)');
                } else {
                  Toast.show({ type: 'error', text1: result.message });
                }
              }}
              variant="secondary"
              disabled={isLoading}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/signup">
                <Text style={styles.signupText}>Sign Up</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 48,
  },
  header: {
    marginBottom: 36,
    alignItems: 'flex-start',
  },
  logo: {
    marginBottom: 18,
  },
  brand: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textSecondary,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 8,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 16,
    color: Palette.textSecondary,
    lineHeight: 22,
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
    color: Palette.text,
    fontSize: 14,
    fontWeight: '600',
  },
  cta: {
    marginTop: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Palette.borderStrong,
  },
  dividerText: {
    color: Palette.textMuted,
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    color: Palette.textSecondary,
    fontSize: 14,
  },
  signupText: {
    color: Palette.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
