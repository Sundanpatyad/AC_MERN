import { getToken, onMessage } from 'firebase/messaging';
import { FIREBASE_VAPID_KEY, getFirebaseMessaging, initFirebaseAnalytics } from '../firebase/config';
import { apiConnector } from './apiConnector';
import { notificationEndpoints } from './apis';

const FCM_TOKEN_KEY = 'ac_fcm_token';
const FCM_SW_URL = '/firebase-messaging-sw.js';
const FCM_SW_SCOPE = '/firebase-cloud-messaging-push-scope';

/** Wait until a service worker registration has an active worker. */
async function waitForActiveServiceWorker(registration, timeoutMs = 10000) {
  if (registration.active) return registration;

  const worker = registration.installing || registration.waiting;
  if (!worker) {
    await navigator.serviceWorker.ready;
    return registration;
  }

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Service worker activation timed out'));
    }, timeoutMs);

    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') {
        clearTimeout(timer);
        resolve();
      }
      if (worker.state === 'redundant') {
        clearTimeout(timer);
        reject(new Error('Service worker became redundant'));
      }
    });
  });

  return registration;
}

async function getMessagingSwRegistration() {
  if (!('serviceWorker' in navigator)) return null;

  // Prefer an existing FCM registration if present
  const existing = await navigator.serviceWorker.getRegistration(FCM_SW_SCOPE);
  if (existing) {
    return waitForActiveServiceWorker(existing);
  }

  const registration = await navigator.serviceWorker.register(FCM_SW_URL, {
    scope: FCM_SW_SCOPE,
    updateViaCache: 'none',
  });

  return waitForActiveServiceWorker(registration);
}

/**
 * Request notification permission, obtain an FCM token, and register it with the API.
 * Always POSTs to the backend so login / session restore stay in sync.
 * Safe to call multiple times; no-ops when unsupported or denied.
 */
export async function enablePushNotifications(authToken) {
  try {
    if (!authToken || typeof window === 'undefined') return null;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;

    // Secure context required (localhost / https)
    if (!window.isSecureContext) {
      console.warn('[FCM] Push requires HTTPS or localhost');
      return null;
    }

    initFirebaseAnalytics().catch(() => {});

    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission not granted');
      return null;
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn('[FCM] Messaging not supported in this browser');
      return null;
    }

    const registration = await getMessagingSwRegistration();
    if (!registration?.active) {
      console.warn('[FCM] Service worker not active');
      return null;
    }

    const fcmToken = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!fcmToken) return null;

    await apiConnector(
      'POST',
      notificationEndpoints.REGISTER_TOKEN,
      { token: fcmToken, platform: 'web' },
      { Authorization: `Bearer ${authToken}` }
    );
    localStorage.setItem(FCM_TOKEN_KEY, fcmToken);
    console.log('[FCM] Web token registered with backend');

    return fcmToken;
  } catch (error) {
    const message = error?.message || String(error);
    console.warn('[FCM] Failed to enable push notifications:', message);

    // Common Chrome/Brave issue — nudge actionable fix
    if (/push service error/i.test(message)) {
      console.warn(
        '[FCM] Tip: In Chrome, open chrome://settings/privacy → Site settings → Notifications, allow this site. In Brave, enable "Use Google services for push messaging". Also clear Site data for this origin and retry.'
      );
    }

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
