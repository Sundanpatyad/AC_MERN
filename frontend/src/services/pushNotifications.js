import { getToken, onMessage } from 'firebase/messaging';
import { FIREBASE_VAPID_KEY, getFirebaseMessaging, initFirebaseAnalytics } from '../firebase/config';
import { apiConnector } from './apiConnector';
import { notificationEndpoints } from './apis';

const FCM_TOKEN_KEY = 'ac_fcm_token';

async function getMessagingSwRegistration() {
  if (!('serviceWorker' in navigator)) return null;

  const existing = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
  if (existing) return existing;

  return navigator.serviceWorker.register('/firebase-messaging-sw.js');
}

/**
 * Request notification permission, obtain an FCM token, and register it with the API.
 * Safe to call multiple times; no-ops when unsupported or denied.
 */
export async function enablePushNotifications(authToken) {
  try {
    if (!authToken || typeof window === 'undefined') return null;
    if (!('Notification' in window)) return null;

    initFirebaseAnalytics().catch(() => {});

    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

    if (permission !== 'granted') return null;

    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const registration = await getMessagingSwRegistration();
    if (!registration) return null;

    const fcmToken = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!fcmToken) return null;

    const prev = localStorage.getItem(FCM_TOKEN_KEY);
    if (prev !== fcmToken) {
      await apiConnector(
        'POST',
        notificationEndpoints.REGISTER_TOKEN,
        { token: fcmToken, platform: 'web' },
        { Authorization: `Bearer ${authToken}` }
      );
      localStorage.setItem(FCM_TOKEN_KEY, fcmToken);
    }

    return fcmToken;
  } catch (error) {
    console.warn('[FCM] Failed to enable push notifications:', error?.message || error);
    return null;
  }
}

/** Remove this browser's FCM token from the backend (e.g. on logout). */
export async function disablePushNotifications(authToken) {
  try {
    const fcmToken = localStorage.getItem(FCM_TOKEN_KEY);
    if (!fcmToken) return;

    if (authToken) {
      await apiConnector(
        'DELETE',
        notificationEndpoints.UNREGISTER_TOKEN,
        { token: fcmToken },
        { Authorization: `Bearer ${authToken}` }
      );
    }
  } catch (error) {
    console.warn('[FCM] Failed to unregister push token:', error?.message || error);
  } finally {
    localStorage.removeItem(FCM_TOKEN_KEY);
  }
}

/** Foreground messages while the tab is open (optional UI hook). */
export async function listenForForegroundMessages(handler) {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return () => {};

    return onMessage(messaging, (payload) => {
      if (typeof handler === 'function') handler(payload);
    });
  } catch {
    return () => {};
  }
}
