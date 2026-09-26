const crypto = require('crypto');

function apiPublicBase() {
  return String(
    process.env.API_PUBLIC_URL ||
      process.env.BACKEND_URL ||
      `http://localhost:${process.env.PORT || 8000}`
  ).replace(/\/$/, '');
}

function allowedMediaOrigins() {
  const fromEnv = String(process.env.MEDIA_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const defaults = [
    process.env.FRONTEND_URL,
    'https://awakeningclasses.in',
    'https://www.awakeningclasses.in',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ];

  return [...new Set([...defaults, ...fromEnv].filter(Boolean).map((u) => String(u).replace(/\/$/, '')))];
}

function originFromUrl(value) {
  try {
    const u = new URL(value);
    return `${u.protocol}//${u.host}`;
  } catch {
    return '';
  }
}

/** True when user opened the URL as a page (new tab / address bar), not as <img>/<video>. */
function isTopLevelNavigation(req) {
  const dest = String(req.get('sec-fetch-dest') || '').toLowerCase();
  const mode = String(req.get('sec-fetch-mode') || '').toLowerCase();
  return dest === 'document' || mode === 'navigate';
}

function hasValidMediaSignature(req) {
  const exp = Number(req.query.exp);
  const sig = String(req.query.sig || '');
  if (!exp || !sig || exp * 1000 <= Date.now()) return false;
  const key = req.mediaKey || '';
  const expected = signMediaKey(key, exp);
  if (!expected || sig.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

function hasValidBearer(req) {
  const auth = req.get('authorization') || '';
  if (!auth.toLowerCase().startsWith('bearer ') || !process.env.JWT_SECRET) return false;
  try {
    const jwt = require('jsonwebtoken');
    jwt.verify(auth.slice(7).trim(), process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

function isMobileApiClient(req) {
  const client = String(req.get('x-ac-client') || '').toLowerCase();
  if (client === 'app' || client === 'mobile' || client === 'awakening-app') return true;
  const ua = String(req.get('user-agent') || '');
  // React Native / Expo image & API clients (not desktop Chrome)
  if (/okhttp/i.test(ua)) return true;
  if (/Expo/i.test(ua)) return true;
  if (/CFNetwork/i.test(ua) && !/Chrome|Firefox|Safari\/[\d.]+$/.test(ua)) return true;
  return false;
}

function requestAllowedForMedia(req) {
  // App / signed links
  if (hasValidMediaSignature(req) || hasValidBearer(req)) return true;

  // React Native Image requests (no Referer) — allow native clients only
  if (isMobileApiClient(req) && !isTopLevelNavigation(req)) return true;

  // Block "Open image in new tab" / paste in address bar (browser sends navigate/document)
  if (isTopLevelNavigation(req)) return false;

  const origins = allowedMediaOrigins();
  const referer = req.get('referer') || req.get('referrer') || '';
  const origin = req.get('origin') || '';

  const refOrigin = originFromUrl(referer);
  if (refOrigin && origins.some((o) => refOrigin === o || refOrigin.startsWith(`${o}:`))) {
    return true;
  }
  if (origin && origins.some((o) => origin === o || origin.replace(/\/$/, '') === o)) {
    return true;
  }

  return false;
}

function signMediaKey(key, exp) {
  const secret = process.env.MEDIA_SIGNING_SECRET || process.env.JWT_SECRET;
  if (!secret || !key || !exp) return '';
  return crypto.createHmac('sha256', secret).update(`${key}:${exp}`).digest('hex').slice(0, 32);
}

/** Path only — store this in MongoDB (no host). */
function mediaUrlForKey(key) {
  const encoded = String(key)
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `/api/v1/media/${encoded}`;
}

function requestApiBase(req) {
  if (!req) return apiPublicBase();
  const proto = String(req.get('x-forwarded-proto') || req.protocol || 'http').split(',')[0].trim();
  const host = String(req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim();
  if (!host) return apiPublicBase();
  return `${proto}://${host}`.replace(/\/$/, '');
}

/** Turn relative /api/v1/media/... into absolute for the current API host. */
function absolutizeMediaString(value, base) {
  if (typeof value !== 'string' || !value.includes('/api/v1/media/')) return value;
  const root = String(base || apiPublicBase()).replace(/\/$/, '');
  if (value.startsWith('/api/v1/media/')) return `${root}${value}`;
  const idx = value.indexOf('/api/v1/media/');
  return `${root}${value.slice(idx)}`;
}

function toRelativeMediaPath(value) {
  if (typeof value !== 'string' || !value.includes('/api/v1/media/')) return value;
  const idx = value.indexOf('/api/v1/media/');
  return value.slice(idx);
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** Keep Mongo ObjectIds / special types intact (Object.entries turns them into {}). */
function preserveSpecialValue(value) {
  if (value == null || typeof value !== 'object') return null;
  if (value instanceof Date || Buffer.isBuffer(value)) return value;
  if (typeof value.toHexString === 'function') return value.toHexString();
  if (value._bsontype === 'ObjectID' || value._bsontype === 'ObjectId') return String(value);
  if (typeof value === 'object' && value.id && !isPlainObject(value) && typeof value.toString === 'function') {
    const asString = value.toString();
    if (/^[a-f\d]{24}$/i.test(asString)) return asString;
  }
  return null;
}

function absolutizeMediaInData(data, base, seen = new WeakSet()) {
  if (data == null || typeof data !== 'object') {
    return typeof data === 'string' ? absolutizeMediaString(data, base) : data;
  }

  const special = preserveSpecialValue(data);
  if (special !== null) return special;

  if (seen.has(data)) return data;

  if (Array.isArray(data)) {
    seen.add(data);
    return data.map((item) => absolutizeMediaInData(item, base, seen));
  }

  // Mongoose documents: serialize then walk plain JSON
  if (typeof data.toJSON === 'function' && !isPlainObject(data)) {
    try {
      return absolutizeMediaInData(data.toJSON(), base, seen);
    } catch {
      /* fall through */
    }
  }

  if (!isPlainObject(data)) return data;

  seen.add(data);
  const out = {};
  for (const [key, val] of Object.entries(data)) {
    out[key] = absolutizeMediaInData(val, base, seen);
  }
  return out;
}

function signedMediaUrlForKey(key, ttlSeconds = 3600) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = signMediaKey(key, exp);
  return `${mediaUrlForKey(key)}?exp=${exp}&sig=${sig}`;
}

function signMediaString(value, base, ttlSeconds) {
  if (typeof value !== 'string' || !value.includes('/api/v1/media/')) return value;
  if (/[?&]sig=/.test(value)) return absolutizeMediaString(value, base);
  const key = keyFromMediaUrl(value);
  if (!key) return absolutizeMediaString(value, base);
  const root = String(base || apiPublicBase()).replace(/\/$/, '');
  return `${root}${signedMediaUrlForKey(key, ttlSeconds)}`;
}

function signMediaUrlsInData(data, base, ttlSeconds, seen = new WeakSet()) {
  if (data == null || typeof data !== 'object') {
    return typeof data === 'string' ? signMediaString(data, base, ttlSeconds) : data;
  }

  const special = preserveSpecialValue(data);
  if (special !== null) return special;

  if (seen.has(data)) return data;

  if (Array.isArray(data)) {
    seen.add(data);
    return data.map((item) => signMediaUrlsInData(item, base, ttlSeconds, seen));
  }

  if (typeof data.toJSON === 'function' && !isPlainObject(data)) {
    try {
      return signMediaUrlsInData(data.toJSON(), base, ttlSeconds, seen);
    } catch {
      /* fall through */
    }
  }

  if (!isPlainObject(data)) return data;

  seen.add(data);
  const out = {};
  for (const [key, val] of Object.entries(data)) {
    out[key] = signMediaUrlsInData(val, base, ttlSeconds, seen);
  }
  return out;
}

/**
 * App: swap /api/v1/media URLs for short-lived R2 URLs so Image loads from CDN
 * (no Node proxy hop). Local crypto only — no extra network round-trip.
 */
async function rewriteMediaToPresignedR2(data, ttlSeconds, seen = new WeakSet(), cache = new Map()) {
  const { getPresignedGetUrl } = require('./r2Storage');

  const presign = async (key) => {
    if (cache.has(key)) return cache.get(key);
    const pending = getPresignedGetUrl(key, ttlSeconds).then((url) => url || null);
    cache.set(key, pending);
    return pending;
  };

  const walk = async (node) => {
    if (node == null || typeof node !== 'object') {
      if (typeof node === 'string' && node.includes('/api/v1/media/')) {
        const key = keyFromMediaUrl(node);
        if (!key) return node;
        const url = await presign(key);
        return url || signMediaString(node, apiPublicBase(), ttlSeconds);
      }
      return node;
    }

    const special = preserveSpecialValue(node);
    if (special !== null) return special;
    if (seen.has(node)) return node;

    if (Array.isArray(node)) {
      seen.add(node);
      return Promise.all(node.map((item) => walk(item)));
    }

    if (typeof node.toJSON === 'function' && !isPlainObject(node)) {
      try {
        return walk(node.toJSON());
      } catch {
        /* fall through */
      }
    }

    if (!isPlainObject(node)) return node;

    seen.add(node);
    const out = {};
    await Promise.all(
      Object.entries(node).map(async ([key, val]) => {
        out[key] = await walk(val);
      })
    );
    return out;
  };

  return walk(data);
}

function keyFromMediaUrl(url) {
  if (!url) return null;
  const raw = String(url);
  if (!raw.includes('/api/v1/media/')) return null;
  const idx = raw.indexOf('/api/v1/media/');
  let pathPart = raw.slice(idx + '/api/v1/media/'.length).split('?')[0];
  try {
    pathPart = pathPart
      .split('/')
      .map((p) => decodeURIComponent(p))
      .join('/');
  } catch {
    /* keep */
  }
  return pathPart || null;
}

/** Express middleware: expand relative media paths using this request's host. */
function mediaUrlResponseMiddleware(req, res, next) {
  const base = requestApiBase(req);
  const signForApp = isMobileApiClient(req);
  // Cap at 7d (S3/R2 SigV4 max); shorter = safer if URL is shared
  const ttl = Math.min(
    604800,
    Math.max(300, Number(process.env.MEDIA_APP_URL_TTL_SEC) || 3600)
  );
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    Promise.resolve()
      .then(async () => {
        let data = absolutizeMediaInData(body, base);
        if (signForApp) {
          data = await rewriteMediaToPresignedR2(data, ttl);
        }
        return originalJson(data);
      })
      .catch((error) => {
        console.error('mediaUrlResponseMiddleware:', error?.message);
        try {
          originalJson(body);
        } catch {
          /* already sent */
        }
      });
  };
  next();
}

module.exports = {
  apiPublicBase,
  allowedMediaOrigins,
  requestAllowedForMedia,
  mediaUrlForKey,
  signedMediaUrlForKey,
  keyFromMediaUrl,
  signMediaKey,
  requestApiBase,
  absolutizeMediaString,
  absolutizeMediaInData,
  toRelativeMediaPath,
  rewriteMediaToPresignedR2,
  mediaUrlResponseMiddleware,
  isMobileApiClient,
};
