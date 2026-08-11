import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { AppPalette } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';

export default function UpdatePasswordScreen() {
  const { token: tokenParam } = useLocalSearchParams();
  const [token, setToken] = useState(tokenParam?.toString() || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam.toString());
    }
  }, [tokenParam]);

  const handleUpdatePassword = async () => {
    if (!token) {
      return;
    }

    if (!password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
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
        router.replace('/(auth)/login');
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
