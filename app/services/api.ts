import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const apiConnector = axios.create({
  timeout: 10000,
});

apiConnector.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      console.log(`[API Request] URL: ${config.url}, Method: ${config.method}`);
      
      if (token) {
        // Remove any surrounding quotes that SecureStore might have added
        let cleanedToken = token.trim();
        if (cleanedToken.startsWith('"') && cleanedToken.endsWith('"')) {
          cleanedToken = cleanedToken.slice(1, -1);
        }
        
        if (cleanedToken) {
          if (!config.headers) {
            config.headers = {} as any;
          }
          config.headers['Authorization'] = `Bearer ${cleanedToken}`;
          console.log(`[API Request] Token found and attached`);
        } else {
          console.log(`[API Request] Token found but was empty after cleaning`);
        }
      } else {
        console.log(`[API Request] No token found in SecureStore`);
      }
    } catch (err) {
      console.error('[API Request] Error in interceptor:', err);
    }
    return config;
  },
  (error) => {
    console.error('[API Request] Interceptor error:', error);
    return Promise.reject(error);
  }
);

// We don't intercept responses for automatic logout yet, as we might want to handle it in components.
