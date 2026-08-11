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
import { Palette } from '../../constants/theme';

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiConnector.post(endpoints.SENDOTP_API, {
        email,
        checkUserPresent: true,
      });

      if (response.data.success) {
        Toast.show({ type: 'success', text1: 'OTP Sent Successfully' });
        router.push({
          pathname: '/(auth)/verify-email',
          params: { ...formData, accountType: 'Student' },
        });
      } else {
        Toast.show({ type: 'error', text1: response.data.message });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Failed to send OTP',
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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join us and start learning today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="First Name"
                  placeholder="First name"
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="Last Name"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                />
              </View>
            </View>

            <Input
              label="Email Address"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <Input
              label="Password"
              placeholder="Create password"
              isPassword
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
            />
            <Input
              label="Confirm Password"
              placeholder="Confirm password"
              isPassword
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            />

            <Button title="Sign Up" onPress={handleSignup} isLoading={isLoading} style={styles.cta} />

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
                  Toast.show({ type: 'success', text1: 'Google Signup Successful' });
                  router.replace('/(tabs)');
                } else {
                  Toast.show({ type: 'error', text1: result.message });
                }
              }}
              variant="secondary"
              disabled={isLoading}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login">
                <Text style={styles.loginText}>Log In</Text>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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
  loginText: {
    color: Palette.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
