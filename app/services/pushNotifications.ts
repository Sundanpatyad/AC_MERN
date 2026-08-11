import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { apiConnector } from './api';
import { endpoints } from '../constants/api';

const FCM_TOKEN_KEY = 'ac_fcm_token';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null | undefined;
let handlerConfigured = false;

/**
 * Lazy-load expo-notifications so Expo Go / unrebuilt native clients
 * don't crash the whole app on import.
 */
function getNotifications(): NotificationsModule | null {
  if (notificationsModule !== undefined) return notificationsModule;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-notifications') as NotificationsModule;
    // Touch a native export so missing native binaries throw here, not later.
    void mod.getPermissionsAsync;
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
    console.warn(
      '[FCM] Native push unavailable (rebuild with `npx expo run:android`):',
      error?.message || error
    );
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
  // Simulators / Expo Go without native FCM still reach here; token fetch will no-op.
  if (Constants.isDevice === false) {
    console.warn('[FCM] Push notifications require a physical device');
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
 * Requires a dev/production build with google-services.json.
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
    console.warn('[FCM] Failed to get device push token:', error?.message || error);
    return null;
  }
}

/** Request permission, obtain FCM token, and register it with the API. */
export async function enablePushNotifications(): Promise<string | null> {
  try {
    const fcmToken = await getNativePushToken();
    if (!fcmToken) return null;

    const prev = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (prev !== fcmToken) {
      await apiConnector.post(endpoints.REGISTER_FCM_TOKEN, {
        token: fcmToken,
        platform: pushPlatform(),
      });
      await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
    }

    return fcmToken;
  } catch (error: any) {
    console.warn('[FCM] Failed to enable push notifications:', error?.message || error);
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
