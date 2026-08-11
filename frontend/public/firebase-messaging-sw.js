/* eslint-disable no-undef */
// Firebase Cloud Messaging service worker — handles background push on the website.
importScripts('https://www.gstatic.com/firebasejs/11.10.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyB8uwBnEelfhcri8OA3cQii_SHvFnq4YHg',
  authDomain: 'awakening-classes.firebaseapp.com',
  projectId: 'awakening-classes',
  storageBucket: 'awakening-classes.firebasestorage.app',
  messagingSenderId: '93363345121',
  appId: '1:93363345121:web:e6a62194a168a79f6d09a0',
  measurementId: 'G-QLLN9DC2JK',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  const title = notification.title || 'Awakening Classes';
  const options = {
    body: notification.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
