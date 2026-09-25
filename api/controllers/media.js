const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getR2Client, getBucket, isR2Enabled, getPublicBaseUrl } = require('../config/r2');
const { getPresignedGetUrl, r2DevUrlForKey } = require('../utils/r2Storage');
const { requestAllowedForMedia } = require('../utils/mediaAccess');

function serveMode() {
  const mode = String(process.env.MEDIA_SERVE_MODE || 'redirect').toLowerCase();
  return mode === 'proxy' ? 'proxy' : 'redirect';
}

/**
 * GET /api/v1/media/*
 * Access check, then redirect to a short-lived R2 URL (fast) or proxy bytes.
 */
exports.streamMedia = async (req, res) => {
  try {
    if (!isR2Enabled()) {
      return res.status(503).type('text').send('Media storage is not configured');
    }

    const key = String(req.params[0] || '')
      .split('/')
      .map((p) => {
        try {
          return decodeURIComponent(p);
        } catch {
          return p;
        }
      })
      .join('/');

    if (!key || key.includes('..')) {
      return res.status(400).type('text').send('Invalid media path');
    }

    req.mediaKey = key;

    if (!requestAllowedForMedia(req)) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(403).type('text').send('This file can only be viewed on Awakening Classes');
    }

    const mobile = require('../utils/mediaAccess').isMobileApiClient(req);
    // React Native Image is unreliable with cross-host 302 → always proxy for apps
    const useRedirect = serveMode() === 'redirect' && !mobile;

    if (useRedirect) {
      const ttl = Math.max(60, Number(process.env.MEDIA_REDIRECT_TTL_SEC) || 3600);
      let target = await getPresignedGetUrl(key, ttl);

      if (!target && process.env.MEDIA_USE_PUBLIC_URL === 'true' && getPublicBaseUrl()) {
        target = r2DevUrlForKey(key);
      }

      if (target) {
        res.setHeader('Cache-Control', 'private, max-age=60');
        res.setHeader('Vary', 'Sec-Fetch-Dest, Sec-Fetch-Mode, Referer');
        return res.redirect(302, target);
      }
    }

    const result = await getR2Client().send(
      new GetObjectCommand({
        Bucket: getBucket(),
        Key: key,
      })
    );

    if (result.ContentType) res.setHeader('Content-Type', result.ContentType);
    if (result.ContentLength != null) res.setHeader('Content-Length', String(result.ContentLength));
    res.setHeader('Cache-Control', 'private, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('Vary', 'Sec-Fetch-Dest, Sec-Fetch-Mode, Referer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    result.Body.pipe(res);
  } catch (error) {
    console.error('streamMedia:', error?.message);
    if (!res.headersSent) {
      const status = error?.$metadata?.httpStatusCode === 404 ? 404 : 500;
      res.status(status).type('text').send(status === 404 ? 'Not found' : 'Could not load media');
    }
  }
};
