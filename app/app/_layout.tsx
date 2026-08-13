import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Text, TextInput } from 'react-native';
import 'react-native-reanimated';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { AppThemeProvider, useTheme } from '../providers/AppThemeProvider';
import { DialogProvider } from '../providers/DialogProvider';
import { Fonts } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

// Default app typeface (React 19 types omit defaultProps)
const TextAny = Text as typeof Text & { defaultProps?: { style?: unknown } };
const TextInputAny = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };
TextAny.defaultProps = {
  ...TextAny.defaultProps,
  style: [{ fontFamily: Fonts.sans }, TextAny.defaultProps?.style],
};
TextInputAny.defaultProps = {
  ...TextInputAny.defaultProps,
  style: [{ fontFamily: Fonts.sans }, TextInputAny.defaultProps?.style],
};

function RootNavigator() {
  const { colors, isDark } = useTheme();
  const { isLoading, token } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateTheme = useThemeStore((s) => s.hydrate);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    const init = async () => {
      await Promise.all([hydrateAuth(), hydrateTheme()]);
      setIsReady(true);
    };
    init();
  }, [hydrateAuth, hydrateTheme]);

  useEffect(() => {
    if (isReady && !isLoading && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isReady, isLoading, fontsLoaded]);

  useEffect(() => {
    if (isLoading || !isReady || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, segments, isLoading, isReady, fontsLoaded, router]);

  // Register FCM device token once the user is authenticated
  useEffect(() => {
    if (!token || isLoading || !isReady || !fontsLoaded) return;
    import('../services/pushNotifications')
      .then(({ enablePushNotifications }) => enablePushNotifications())
      .catch(() => {});
  }, [token, isLoading, isReady, fontsLoaded]);

  const navigationTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
        primary: colors.text,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    }),
    [colors, isDark]
  );

  if (!isReady || isLoading || !fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colors.statusBarStyle} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <DialogProvider>
        <RootNavigator />
      </DialogProvider>
    </AppThemeProvider>
  );
}
