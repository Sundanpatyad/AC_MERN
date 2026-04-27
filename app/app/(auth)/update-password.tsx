import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';

export default function UpdatePasswordScreen() {
  const { token: tokenParam } = useLocalSearchParams();
  const [token, setToken] = useState(tokenParam?.toString() || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam.toString());
    }
  }, [tokenParam]);

  const handleUpdatePassword = async () => {
    if (!token) {
      Toast.show({ type: 'error', text1: 'Please provide the reset token' });
      return;
    }

    if (!password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Please fill all password fields' });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiConnector.post(endpoints.RESETPASSWORD_API, {
        token,
        password,
        confirmPassword,
      });

      if (response.data.success) {
        Toast.show({ type: 'success', text1: 'Password reset successfully' });
        router.replace('/(auth)/login');
      } else {
        Toast.show({ type: 'error', text1: response.data.message });
      }
    } catch (error: any) {
      Toast.show({ 
        type: 'error', 
        text1: error.response?.data?.message || 'Failed to update password' 
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
          <Text style={styles.title}>Choose new password</Text>
          <Text style={styles.subtitle}>
            Almost done. Enter your new password and you're all set.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Reset Token"
            placeholder="Paste your reset token here"
            autoCapitalize="none"
            value={token}
            onChangeText={setToken}
          />
          <Input
            label="New Password"
            placeholder="Enter new password"
            isPassword
            value={password}
            onChangeText={setPassword}
          />
          <Input
            label="Confirm New Password"
            placeholder="Confirm new password"
            isPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <Button 
            title="Reset Password" 
            onPress={handleUpdatePassword} 
            isLoading={isLoading} 
            style={{ marginTop: 20 }}
          />

          <View style={styles.footer}>
            <Link href="/(auth)/login">
              <Text style={styles.loginText}>Back to Login</Text>
            </Link>
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
