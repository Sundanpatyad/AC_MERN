import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { AppPalette } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';

export default function VerifyEmailScreen() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleVerify = async () => {
    if (!otp) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiConnector.post(endpoints.SIGNUP_API, {
        accountType: params.accountType,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        password: params.password,
        confirmPassword: params.confirmPassword,
        otp,
      });

      if (response.data.success) {
        router.replace('/(auth)/login');
      }
    } catch (error: any) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await apiConnector.post(endpoints.SENDOTP_API, {
        email: params.email,
        checkUserPresent: true,
      });
    } catch (error: any) {
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
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            A verification code has been sent to you. Enter the code below.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Verification Code"
            placeholder="Enter 6-digit OTP"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            style={{ fontSize: 20, letterSpacing: 6, textAlign: 'center' }}
          />

          <Button 
            title="Verify Email" 
            onPress={handleVerify} 
            isLoading={isLoading} 
            style={{ marginTop: 20 }}
          />

          <View style={styles.footer}>
            <Button 
              title="Resend Code" 
              onPress={handleResendOtp} 
              variant="ghost"
              textStyle={{ fontSize: 14 }}
            />
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
      alignItems: 'center',
      marginTop: 16,
    },
  });
}
