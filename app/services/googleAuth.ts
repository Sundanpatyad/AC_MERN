import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { apiConnector } from './api';
import { endpoints } from '../constants/api';
import { useAuthStore } from '../store/authStore';

// Configure Google Sign-In
// Note: You MUST update webClientId with your actual Android/iOS client ID from Google Cloud Console
GoogleSignin.configure({
  webClientId: '217412143147-6l1q2l190t36rp0452f3hl5mtl3nrhjq.apps.googleusercontent.com', // Using the web client ID from frontend for now, but native needs its own
  offlineAccess: true,
});

export const handleGoogleLogin = async () => {
  try {
    // 1. Check if device supports Google Play services
    await GoogleSignin.hasPlayServices();
    
    // 2. Trigger native Google Sign-in modal
    const userInfo = await GoogleSignin.signIn();
    
    // 3. Extract the token
    const { accessToken, idToken } = await GoogleSignin.getTokens();
    
    if (!accessToken && !idToken) {
      throw new Error('No Google token received');
    }

    // 4. Send to backend
    const response = await apiConnector.post(endpoints.GOOGLE_API, {
      accessToken: accessToken || idToken, // Try access_token first, fallback to id_token
    });

    if (response.data.success) {
      const { token: jwtToken, user: userData } = response.data;
      
      const userImage = userData?.image 
        ? userData.image 
        : `https://api.dicebear.com/5.x/initials/svg?seed=${userData.firstName} ${userData.lastName}`;

      // 5. Save to Zustand store
      const authStore = useAuthStore.getState();
      await authStore.setToken(jwtToken);
      await authStore.setUser({ ...userData, image: userImage });
      
      return { success: true };
    } else {
      return { success: false, message: response.data.message || 'Google Login failed on server' };
    }
  } catch (error: any) {
    let message = 'An unknown error occurred';
    
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      message = 'User cancelled the login flow';
    } else if (error.code === statusCodes.IN_PROGRESS) {
      message = 'Sign in is in progress already';
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      message = 'Play services not available or outdated';
    } else {
      message = error.response?.data?.message || error.message || 'Google Sign-In failed';
    }
    
    console.error('Google Sign-In Error:', error);
    return { success: false, message };
  }
};
