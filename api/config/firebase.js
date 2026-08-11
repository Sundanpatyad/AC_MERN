const admin = require('firebase-admin');

let initialized = false;

function initFirebaseAdmin() {
  if (initialized) return admin.apps.length > 0;

  try {
    if (admin.apps.length > 0) {
      initialized = true;
      return true;
    }

    // Option A: full service-account JSON string in env
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
      initialized = true;
      console.log('[Firebase Admin] Initialized from FIREBASE_SERVICE_ACCOUNT_JSON');
      return true;
    }

    // Option B: individual fields
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      initialized = true;
      console.log('[Firebase Admin] Initialized from FIREBASE_* env fields');
      return true;
    }

    console.warn(
      '[Firebase Admin] Not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON (or PROJECT_ID + CLIENT_EMAIL + PRIVATE_KEY) to send pushes.'
    );
    initialized = true;
    return false;
  } catch (error) {
    console.error('[Firebase Admin] Init failed:', error.message);
    initialized = true;
    return false;
  }
}

function getMessaging() {
  if (!initFirebaseAdmin() || admin.apps.length === 0) {
    return null;
  }
  return admin.messaging();
}

/**
 * Send a push notification to one or more FCM device tokens.
 * Invalid / expired tokens are returned so callers can prune them.
 */
async function sendToTokens(tokens, { title, body, data = {}, link } = {}) {
  const messaging = getMessaging();
  if (!messaging) {
    throw new Error('Firebase Admin is not configured on the server');
  }

  const uniqueTokens = [...new Set((tokens || []).filter(Boolean))];
  if (uniqueTokens.length === 0) {
    return { successCount: 0, failureCount: 0, invalidTokens: [] };
  }

  const message = {
    tokens: uniqueTokens,
    notification: {
      title: title || 'Awakening Classes',
      body: body || '',
    },
    data: Object.fromEntries(
      Object.entries({ ...data, ...(link ? { url: link } : {}) }).map(([k, v]) => [
        k,
        String(v ?? ''),
      ])
    ),
    webpush: {
      fcmOptions: link ? { link } : undefined,
      notification: {
        icon: '/logo.png',
      },
    },
  };

  const response = await messaging.sendEachForMulticast(message);
  const invalidTokens = [];

  response.responses.forEach((res, idx) => {
    if (!res.success) {
      const code = res.error?.code || '';
      if (
        code.includes('registration-token-not-registered') ||
        code.includes('invalid-registration-token') ||
        code.includes('invalid-argument')
      ) {
        invalidTokens.push(uniqueTokens[idx]);
      }
    }
  });

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    invalidTokens,
  };
}

module.exports = {
  initFirebaseAdmin,
  getMessaging,
  sendToTokens,
};
