import { Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { apiConnector } from './api';
import { endpoints } from '../constants/api';
import { useAuthStore } from '../store/authStore';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
} from '../constants/google';

// Android: webClientId from thematic-bonus Android client JSON
// (1004017212123-5go5m596…). iOS uses iosClientId only.
// offlineAccess needs a true Web client — keep off while using Android client ID.
GoogleSignin.configure({
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  ...(Platform.OS === 'android'
    ? {
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
      }
    : {
        offlineAccess: false,
      }),
  scopes: ['profile', 'email', 'openid'],
});

export const handleGoogleLogin = async () => {
  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    // Clear any stale session that can break simulator sign-in
    try {
      await GoogleSignin.signOut();
    } catch {
      // ignore — no prior session
    }

    const signInResult = await GoogleSignin.signIn();
    console.log('[Google Sign-In] result type:', signInResult?.type || 'ok');

    if (signInResult?.type === 'cancelled') {
      return { success: false, message: 'User cancelled the login flow' };
    }

    // Prefer tokens from sign-in payload; fall back to getTokens only when signed in
    let accessToken: string | null = null;
    let idToken: string | null =
      signInResult?.data?.idToken ||
      (signInResult as any)?.idToken ||
      null;

    try {
      const tokens = await GoogleSignin.getTokens();
      accessToken = tokens?.accessToken || null;
      idToken = tokens?.idToken || idToken;
    } catch (tokenError: any) {
      // getTokens fails if sign-in did not complete — surface a clearer message
      if (!idToken) {
        throw tokenError;
      }
      console.warn('[Google Sign-In] getTokens failed, using idToken from signIn:', tokenError?.message);
    }

    console.log('[Google Sign-In] has accessToken:', !!accessToken, 'has idToken:', !!idToken);

    if (!accessToken && !idToken) {
      throw new Error('No Google token received');
    }

    const response = await apiConnector.post(endpoints.GOOGLE_API, {
      accessToken,
      idToken,
    });

    if (response.data.success) {
      const { token: jwtToken, user: userData } = response.data;

      const userImage = userData?.image
        ? userData.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${userData.firstName} ${userData.lastName}`;

      const authStore = useAuthStore.getState();
      await authStore.setToken(jwtToken);
      await authStore.setUser({ ...userData, image: userImage });

      return { success: true };
    }

    return {
      success: false,
      message: response.data.message || 'Google Login failed on server',
    };
  } catch (error: any) {
    let message = 'An unknown error occurred';
    const raw = String(error?.message || error?.code || '');

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      message = 'User cancelled the login flow';
    } else if (error.code === statusCodes.IN_PROGRESS) {
      message = 'Sign in is in progress already';
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      message = 'Play services not available or outdated';
    } else if (raw.includes('URL schemes') || raw.includes('missing support')) {
      message =
        'Google URL scheme missing. Rebuild the iOS app (not just reload): npx expo run:ios';
    } else if (
      raw.includes('DEVELOPER_ERROR') ||
      error.code === '10' ||
      error.code === 10
    ) {
      message =
        'Google Sign-In misconfigured. Check package name, SHA-1, and webClientId.';
    } else {
      message =
        error.response?.data?.message || error.message || 'Google Sign-In failed';
    }

    console.error('Google Sign-In Error:', error);
    return { success: false, message };
  }
};
