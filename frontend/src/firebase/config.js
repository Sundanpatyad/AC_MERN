import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB8uwBnEelfhcri8OA3cQii_SHvFnq4YHg',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'awakening-classes.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'awakening-classes',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'awakening-classes.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '93363345121',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID || '1:93363345121:web:e6a62194a168a79f6d09a0',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-QLLN9DC2JK',
};

export const firebaseApp = initializeApp(firebaseConfig);

/** Web Push certificate key pair (VAPID) from Firebase Console → Cloud Messaging */
export const FIREBASE_VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BKjNki5VhP2M2qHlkdatXWsKHHmyBzOFXgVaF4YQRC8X7ol_FW5uvuwwuFDNMd57d7-hPo7F5obYiDzbSi0axwE';

let messagingPromise = null;
let analyticsPromise = null;

export function getFirebaseMessaging() {
  if (!messagingPromise) {
    messagingPromise = isMessagingSupported().then((ok) =>
      ok ? getMessaging(firebaseApp) : null
    );
  }
  return messagingPromise;
}

export function initFirebaseAnalytics() {
  if (!analyticsPromise) {
    analyticsPromise = isAnalyticsSupported().then((ok) =>
      ok ? getAnalytics(firebaseApp) : null
    );
  }
  return analyticsPromise;
}
