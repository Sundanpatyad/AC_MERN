import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';
import { BASE_URL } from '../constants/api';
import { resolveMediaUrl } from '../utils/mediaUrl';

export const apiConnector = axios.create({
  timeout: 10000,
  headers: {
    'X-AC-Client': 'awakening-app',
  },
});

/** Endpoints where 401 is expected (wrong password, etc.) — do not sign out. */
const SKIP_LOGOUT_ON_401 = [
  '/api/v1/auth/login',
  '/api/v1/auth/signup',
  '/api/v1/auth/google',
  '/api/v1/auth/sendotp',
  '/api/v1/auth/reset-password-token',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/changepassword',
  '/api/v1/usage/session/',
];

let isHandlingUnauthorized = false;

function shouldLogoutOn401(url: string | undefined, hadAuthHeader: boolean): boolean {
  if (!url || SKIP_LOGOUT_ON_401.some((path) => url.includes(path))) {
    return false;
  }
  const { token } = useAuthStore.getState();
  return hadAuthHeader || !!token;
}

function absolutizeMediaInClient(data: unknown, seen = new WeakSet<object>()): unknown {
  if (data == null || typeof data !== 'object') {
    if (typeof data !== 'string' || !data.includes('/api/v1/media/')) return data;
    return resolveMediaUrl(data) || data;
  }
  if (seen.has(data as object)) return data;
  if (Array.isArray(data)) {
    seen.add(data);
    return data.map((item) => absolutizeMediaInClient(item, seen));
  }
  seen.add(data as object);
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    out[key] = absolutizeMediaInClient(val, seen);
  }
  return out;
}

apiConnector.interceptors.request.use(
  async (config) => {
    try {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers['X-AC-Client'] = 'awakening-app';

      const token = await SecureStore.getItemAsync('token');
      console.log(`[API Request] URL: ${config.url}, Method: ${config.method}`);

      if (token) {
        let cleanedToken = token.trim();
        if (cleanedToken.startsWith('"') && cleanedToken.endsWith('"')) {
          cleanedToken = cleanedToken.slice(1, -1);
        }

        if (cleanedToken) {
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

apiConnector.interceptors.response.use(
  (response) => {
    if (response?.data) {
      response.data = absolutizeMediaInClient(response.data);
    }
    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      const url = error?.config?.url as string | undefined;
      const headers = error?.config?.headers ?? {};
      const hadAuthHeader = Boolean(headers.Authorization || headers.authorization);

      if (shouldLogoutOn401(url, hadAuthHeader) && !isHandlingUnauthorized) {
        isHandlingUnauthorized = true;
        try {
          await useAuthStore.getState().logout();
        } catch (logoutError) {
          console.error('[API Response] Logout after 401 failed:', logoutError);
        } finally {
          isHandlingUnauthorized = false;
        }
      }
    }
    return Promise.reject(error);
  }
);
