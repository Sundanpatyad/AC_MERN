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

function requestAllowedForMedia(req) {
  // App / signed links (optional)
  if (hasValidMediaSignature(req) || hasValidBearer(req)) return true;

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

function absolutizeMediaInData(data, base, seen = new WeakSet()) {
  if (data == null || typeof data !== 'object') {
    return typeof data === 'string' ? absolutizeMediaString(data, base) : data;
  }
  if (typeof data.toJSON === 'function' && !(data instanceof Date) && !Array.isArray(data)) {
    // Mongoose docs / ObjectId — serialize first when possible is handled by res.json already
  }
  if (seen.has(data)) return data;
  if (Array.isArray(data)) {
    seen.add(data);
    return data.map((item) => absolutizeMediaInData(item, base, seen));
  }
  if (data instanceof Date) return data;
  if (Buffer.isBuffer(data)) return data;
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
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    try {
      return originalJson(absolutizeMediaInData(body, base));
    } catch (error) {
      console.error('mediaUrlResponseMiddleware:', error?.message);
      return originalJson(body);
    }
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
  mediaUrlResponseMiddleware,
};
