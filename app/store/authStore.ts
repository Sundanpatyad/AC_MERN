import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: string;
  image: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,
  setToken: async (token) => {
    set({ token });
    if (token) {
      await SecureStore.setItemAsync('token', token);
    } else {
      await SecureStore.deleteItemAsync('token');
    }
  },
  setUser: async (user) => {
    set({ user });
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem('user');
    }
  },
  setLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    set({ token: null, user: null });
    await SecureStore.deleteItemAsync('token');
    await AsyncStorage.removeItem('user');
  },
  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userStr = await AsyncStorage.getItem('user');
      
      let cleanedToken = null;
      if (token) {
        cleanedToken = token.replace(/^"(.*)"$/, '$1');
      }

      set({
        token: cleanedToken,
        user: userStr ? JSON.parse(userStr) : null,
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to hydrate auth state', e);
      set({ isLoading: false });
    }
  },
}));
