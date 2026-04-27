import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';

export default function VerifyEmailScreen() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleVerify = async () => {
    if (!otp) {
      Toast.show({ type: 'error', text1: 'Please enter the OTP' });
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
        Toast.show({ type: 'success', text1: 'Account Created Successfully' });
        router.replace('/(auth)/login');
      } else {
        Toast.show({ type: 'error', text1: response.data.message });
      }
    } catch (error: any) {
      Toast.show({ 
        type: 'error', 
        text1: error.response?.data?.message || 'Invalid OTP' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await apiConnector.post(endpoints.SENDOTP_API, {
        email: params.email,
        checkUserPresent: true,
      });

      if (response.data.success) {
        Toast.show({ type: 'success', text1: 'OTP Resent Successfully' });
      }
    } catch (error: any) {
      Toast.show({ 
        type: 'error', 
        text1: error.response?.data?.message || 'Failed to resend OTP' 
      });
    }
  };

  return (
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
            style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center' }}
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
    alignItems: 'center',
    marginTop: 16,
  },
});
