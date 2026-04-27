import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Please enter your email' });
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
          Toast.show({ type: 'success', text1: 'Bypassing email... redirecting' });
          router.push({
            pathname: '/(auth)/update-password',
            params: { token: response.data.token }
          });
        } else {
          setEmailSent(true);
          Toast.show({ type: 'success', text1: 'Reset Email Sent' });
        }
      } else {
        Toast.show({ type: 'error', text1: response.data.message });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Failed to send reset email'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    lineHeight: 24,
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
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
