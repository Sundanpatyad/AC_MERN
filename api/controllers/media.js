const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getR2Client, getBucket, isR2Enabled } = require('../config/r2');
const { requestAllowedForMedia } = require('../utils/mediaAccess');

/**
 * GET /api/v1/media/*
 * Streams a private R2 object only when the request comes from an allowed
 * website (Referer/Origin), or has a valid signed query / Bearer token.
 * Opening the raw link in a new tab / other browser → 403.
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

    const result = await getR2Client().send(
      new GetObjectCommand({
        Bucket: getBucket(),
        Key: key,
      })
    );

    if (result.ContentType) res.setHeader('Content-Type', result.ContentType);
    if (result.ContentLength != null) res.setHeader('Content-Length', String(result.ContentLength));
    // no-store so "open in new tab" cannot reuse a cached copy from <img>
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Vary', 'Sec-Fetch-Dest, Sec-Fetch-Mode, Referer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; img-src 'self'; media-src 'self'; sandbox"
    );

    result.Body.pipe(res);
  } catch (error) {
    console.error('streamMedia:', error?.message);
    if (!res.headersSent) {
      const status = error?.$metadata?.httpStatusCode === 404 ? 404 : 500;
      res.status(status).type('text').send(status === 404 ? 'Not found' : 'Could not load media');
    }
  }
};
