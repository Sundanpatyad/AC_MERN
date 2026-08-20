import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { useNativeBottomInset } from '../../lib/safeArea';
import { AppPalette } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();
  const bottomInset = useNativeBottomInset();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleResetPassword = async () => {
    if (!email) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiConnector.post(endpoints.RESETPASSTOKEN_API, {
        email,
      });
      console.log(response.data);

      if (response.data.success) {
        if (response.data.token) {
          router.push({
            pathname: '/(auth)/update-password',
            params: { token: response.data.token }
          });
        } else {
          setEmailSent(true);
        }
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
      style={styles.container}
    >
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 24 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {!emailSent ? 'Reset Password' : 'Check Email'}
          </Text>
          <Text style={styles.subtitle}>
            {!emailSent
              ? "Have no fear. We'll email you instructions to reset your password. If you don't have access to your email we can try account recovery."
              : `We have sent the reset email to ${email}. Please check your inbox and copy the token.`
            }
          </Text>
        </View>

        <View style={styles.form}>
          {!emailSent && (
            <Input
              label="Email Address"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          )}

          <Button
            title={!emailSent ? 'Submit' : 'Resend Email'}
            onPress={handleResetPassword}
            isLoading={isLoading}
            style={{ marginTop: 20 }}
          />

          <View style={styles.footer}>
            {emailSent ? (
              <Link href="/(auth)/update-password">
                <Text style={styles.loginText}>I have a token</Text>
              </Link>
            ) : (
              <Link href="/(auth)/login">
                <Text style={styles.loginText}>Back to Login</Text>
              </Link>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    header: {
      marginBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    form: {
      gap: 4,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
    },
    loginText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
}
