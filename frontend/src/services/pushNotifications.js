import { getToken, onMessage } from 'firebase/messaging';
import { FIREBASE_VAPID_KEY, getFirebaseMessaging } from '../firebase/config';
import { apiConnector } from './apiConnector';
import { notificationEndpoints } from './apis';

const FCM_TOKEN_KEY = 'ac_fcm_token';
const FCM_SW_URL = '/firebase-messaging-sw.js';
const FCM_SW_SCOPE = '/firebase-cloud-messaging-push-scope';
const FCM_SKIP_KEY = 'ac_fcm_skip';

let inFlight = null;

function isPushServiceError(error) {
  return /push service error|registration failed/i.test(error?.message || String(error || ''));
}

async function isBraveBrowser() {
  try {
    return Boolean(navigator.brave && (await navigator.brave.isBrave()));
  } catch {
    return false;
  }
}

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

async function enablePushNotificationsOnce(authToken) {
  if (!authToken || typeof window === 'undefined') return null;
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  if (!window.isSecureContext) {
    console.warn('[FCM] Push requires HTTPS or localhost');
    return null;
  }

  if (sessionStorage.getItem(FCM_SKIP_KEY) === '1') {
    return null;
  }

  if (await isBraveBrowser()) {
    // Brave blocks Google's FCM endpoint unless "Use Google services for push messaging" is on.
    sessionStorage.setItem(FCM_SKIP_KEY, '1');
    console.info(
      '[FCM] Skipped in Brave. Enable Settings → Privacy → Use Google services for push messaging, then reload.'
    );
    return null;
  }

  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();

  if (permission !== 'granted') {
    return null;
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  const registration = await getMessagingSwRegistration();
  if (!registration?.active) return null;

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
  return fcmToken;
}

/**
 * Request notification permission, obtain an FCM token, and register it with the API.
 * Dedupes concurrent calls (React StrictMode / login + App).
 */
export async function enablePushNotifications(authToken) {
  if (inFlight) return inFlight;

  inFlight = enablePushNotificationsOnce(authToken)
    .catch((error) => {
      if (isPushServiceError(error)) {
        sessionStorage.setItem(FCM_SKIP_KEY, '1');
        console.info(
          '[FCM] Browser push service unavailable. Allow notifications for this site, or in Brave enable Google push messaging.'
        );
      } else {
        console.warn('[FCM] Failed to enable push notifications:', error?.message || error);
      }
      return null;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
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
    sessionStorage.removeItem(FCM_SKIP_KEY);
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
