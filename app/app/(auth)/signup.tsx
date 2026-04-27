import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';

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
        // Navigate to verify email with form data
        router.push({
          pathname: '/(auth)/verify-email',
          params: { ...formData, accountType: 'Student' }
        });
      } else {
        Toast.show({ type: 'error', text1: response.data.message });
      }
    } catch (error: any) {
      Toast.show({ 
        type: 'error', 
        text1: error.response?.data?.message || 'Failed to send OTP' 
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
          <Text style={styles.title}>Create Account</Text>
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

          <Button 
            title="Sign Up" 
            onPress={handleSignup} 
            isLoading={isLoading} 
            style={{ marginTop: 20 }}
          />

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
  },
  form: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#a1a1aa',
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  loginText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
