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

function requestAllowedForMedia(req) {
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

  // Signed query for mobile / downloads (short-lived)
  const exp = Number(req.query.exp);
  const sig = String(req.query.sig || '');
  if (exp && sig && exp * 1000 > Date.now()) {
    const key = req.mediaKey || '';
    const expected = signMediaKey(key, exp);
    if (expected && sig.length === expected.length) {
      try {
        if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return true;
      } catch {
        /* ignore */
      }
    }
  }

  // Authed app / dashboard requests
  const auth = req.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ') && process.env.JWT_SECRET) {
    try {
      const jwt = require('jsonwebtoken');
      jwt.verify(auth.slice(7).trim(), process.env.JWT_SECRET);
      return true;
    } catch {
      /* ignore */
    }
  }

  return false;
}

function signMediaKey(key, exp) {
  const secret = process.env.MEDIA_SIGNING_SECRET || process.env.JWT_SECRET;
  if (!secret || !key || !exp) return '';
  return crypto.createHmac('sha256', secret).update(`${key}:${exp}`).digest('hex').slice(0, 32);
}

function mediaUrlForKey(key) {
  const encoded = String(key)
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `${apiPublicBase()}/api/v1/media/${encoded}`;
}

function signedMediaUrlForKey(key, ttlSeconds = 3600) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = signMediaKey(key, exp);
  const base = mediaUrlForKey(key);
  return `${base}?exp=${exp}&sig=${sig}`;
}

function keyFromMediaUrl(url) {
  if (!url) return null;
  const prefix = `${apiPublicBase()}/api/v1/media/`;
  const raw = String(url);
  if (!raw.startsWith(prefix) && !raw.includes('/api/v1/media/')) {
    return null;
  }
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

module.exports = {
  apiPublicBase,
  allowedMediaOrigins,
  requestAllowedForMedia,
  mediaUrlForKey,
  signedMediaUrlForKey,
  keyFromMediaUrl,
  signMediaKey,
};
