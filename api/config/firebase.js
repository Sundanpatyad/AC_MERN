const {
  initializeApp,
  getApps,
  cert,
} = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

let initialized = false;

function loadServiceAccount() {
  // Option A: full service-account JSON string in env
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  // Option B: path to downloaded service-account JSON file
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const fs = require('fs');
    const path = require('path');
    const resolved = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    return JSON.parse(fs.readFileSync(resolved, 'utf8'));
  }

  // Option C: individual fields
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  return null;
}

function initFirebaseAdmin() {
  if (initialized) return getApps().length > 0;

  try {
    if (getApps().length > 0) {
      initialized = true;
      return true;
    }

    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
      console.warn(
        '[Firebase Admin] Not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH, or PROJECT_ID + CLIENT_EMAIL + PRIVATE_KEY to send pushes.'
      );
      initialized = true;
      return false;
    }

    initializeApp({
      credential: cert(serviceAccount),
      projectId:
        serviceAccount.project_id ||
        serviceAccount.projectId ||
        process.env.FIREBASE_PROJECT_ID,
    });

    initialized = true;
    console.log('[Firebase Admin] Initialized successfully');
    return true;
  } catch (error) {
    console.error('[Firebase Admin] Init failed:', error.message);
    initialized = true;
    return false;
  }
}

function getFirebaseMessaging() {
  if (!initFirebaseAdmin() || getApps().length === 0) {
    return null;
  }
  return getMessaging();
}

/**
 * Send a push notification to one or more FCM device tokens.
 * Invalid / expired tokens are returned so callers can prune them.
 */
async function sendToTokens(tokens, { title, body, data = {}, link } = {}) {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    throw new Error(
      'Firebase Admin is not configured on the server. Add a service account key to api/.env (FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY).'
    );
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
    android: {
      priority: 'high',
    },
  };

  const response = await messaging.sendEachForMulticast(message);
  const invalidTokens = [];

  response.responses.forEach((res, idx) => {
    if (!res.success) {
      const code = res.error?.code || '';
      console.warn('[FCM] send failed:', code, res.error?.message);
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
  getMessaging: getFirebaseMessaging,
  sendToTokens,
};
