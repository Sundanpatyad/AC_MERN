import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { apiConnector } from './api';
import { endpoints } from '../constants/api';

const FCM_TOKEN_KEY = 'ac_fcm_token';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null | undefined;
let handlerConfigured = false;
let warnedUnavailable = false;

function warnOnce(message: string) {
  if (warnedUnavailable) return;
  warnedUnavailable = true;
  console.warn(message);
}

/** True only in a custom/dev/production binary that includes FCM native code. */
function isNativePushSupported(): boolean {
  // Expo Go (storeClient) does not ship ExpoPushTokenManager / custom FCM.
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return false;
  }

  // Avoid require('expo-notifications') when the native binary was not rebuilt.
  const pushManager = requireOptionalNativeModule('ExpoPushTokenManager');
  return pushManager != null;
}

/**
 * Lazy-load expo-notifications only when the native module exists.
 * Never call require() in Expo Go — that throws ExpoPushTokenManager errors.
 */
function getNotifications(): NotificationsModule | null {
  if (notificationsModule !== undefined) return notificationsModule;

  if (!isNativePushSupported()) {
    warnOnce(
      '[FCM] Push disabled in this client. Use a native build: npx expo run:android'
    );
    notificationsModule = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-notifications') as NotificationsModule;
    if (!mod?.getPermissionsAsync || !mod?.getDevicePushTokenAsync) {
      notificationsModule = null;
      return null;
    }

    notificationsModule = mod;

    if (!handlerConfigured) {
      handlerConfigured = true;
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    }

    return notificationsModule;
  } catch (error: any) {
    warnOnce(`[FCM] Native push unavailable: ${error?.message || error}`);
    notificationsModule = null;
    return null;
  }
}

function pushPlatform(): 'android' | 'ios' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

async function ensureAndroidChannel(Notifications: NotificationsModule) {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#8B0000',
  });
}

async function requestPermission(Notifications: NotificationsModule): Promise<boolean> {
  if (Constants.isDevice === false) {
    warnOnce('[FCM] Push notifications require a physical device');
    return false;
  }

  await ensureAndroidChannel(Notifications);

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const asked = await Notifications.requestPermissionsAsync();
    status = asked.status;
  }
  return status === 'granted';
}

/**
 * Get the native FCM / APNs device token (not an Expo push token).
 * No-ops safely in Expo Go / unrebuilt clients.
 */
export async function getNativePushToken(): Promise<string | null> {
  try {
    const Notifications = getNotifications();
    if (!Notifications) return null;

    const granted = await requestPermission(Notifications);
    if (!granted) return null;

    const devicePush = await Notifications.getDevicePushTokenAsync();
    return typeof devicePush.data === 'string' ? devicePush.data : null;
  } catch (error: any) {
    warnOnce(`[FCM] Failed to get device push token: ${error?.message || error}`);
    return null;
  }
}

/**
 * Request permission, obtain FCM token, and register it with the API.
 * Safe to call after login; returns null when native push is unavailable.
 */
export async function enablePushNotifications(): Promise<string | null> {
  try {
    if (!isNativePushSupported()) {
      warnOnce(
        '[FCM] Skipping token registration (Expo Go / missing native module). Rebuild with npx expo run:android'
      );
      return null;
    }

    const fcmToken = await getNativePushToken();
    if (!fcmToken) return null;

    await apiConnector.post(endpoints.REGISTER_FCM_TOKEN, {
      token: fcmToken,
      platform: pushPlatform(),
    });
    await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
    console.log('[FCM] Token registered with backend');
    return fcmToken;
  } catch (error: any) {
    warnOnce(`[FCM] Failed to enable push notifications: ${error?.message || error}`);
    return null;
  }
}

/** Remove this device's FCM token from the backend (e.g. on logout). */
export async function disablePushNotifications(): Promise<void> {
  try {
    const fcmToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (!fcmToken) return;

    await apiConnector.delete(endpoints.UNREGISTER_FCM_TOKEN, {
      data: { token: fcmToken },
    });
  } catch (error: any) {
    console.warn('[FCM] Failed to unregister push token:', error?.message || error);
  } finally {
    await AsyncStorage.removeItem(FCM_TOKEN_KEY);
  }
}
