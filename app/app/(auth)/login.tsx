import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';

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
        const userImage = user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`;
        
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
        text1: error.response?.data?.message || 'Something went wrong' 
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
          <Text style={styles.title}>Welcome Back</Text>
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

          <Button 
            title="Log In" 
            onPress={handleLogin} 
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
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
  signupText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
