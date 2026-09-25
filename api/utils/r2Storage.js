const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const {
  isR2Enabled,
  getR2Client,
  getBucket,
  getPublicBaseUrl,
} = require('../config/r2');

function sanitizeSegment(value) {
  return String(value || 'file')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'file';
}

function buildObjectKey(folder, originalName, mimeType) {
  const extFromName = path.extname(originalName || '').toLowerCase();
  const extFromMime =
    mimeType === 'application/pdf'
      ? '.pdf'
      : mimeType?.startsWith('image/')
        ? `.${mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'}`
        : mimeType?.startsWith('video/')
          ? '.mp4'
          : '';
  const ext = extFromName || extFromMime || '';
  const base = sanitizeSegment(path.basename(originalName || 'upload', extFromName));
  const id = crypto.randomBytes(8).toString('hex');
  const prefix = sanitizeSegment(folder || process.env.FOLDER_NAME || 'uploads');
  return `${prefix}/${Date.now()}-${id}-${base}${ext}`;
}

function publicUrlForKey(key) {
  // Prefer protected API URL so images only load on our website (Referer check).
  // Direct R2 public links are not stored in DB.
  const { mediaUrlForKey } = require('./mediaAccess');
  return mediaUrlForKey(key);
}

function r2DevUrlForKey(key) {
  return `${getPublicBaseUrl()}/${String(key).replace(/^\//, '')}`;
}

async function uploadBufferToR2(buffer, { key, contentType, folder, originalName }) {
  if (!isR2Enabled()) return null;
  const client = getR2Client();
  const objectKey = key || buildObjectKey(folder, originalName, contentType);

  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: objectKey,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
    })
  );

  return {
    key: objectKey,
    url: publicUrlForKey(objectKey),
    contentType: contentType || 'application/octet-stream',
  };
}

async function uploadFileToR2(filePath, options = {}) {
  const buffer = fs.readFileSync(filePath);
  return uploadBufferToR2(buffer, options);
}

async function uploadExpressFileToR2(file, folder) {
  if (!file?.tempFilePath || !isR2Enabled()) return null;
  return uploadFileToR2(file.tempFilePath, {
    folder,
    originalName: file.name,
    contentType: file.mimetype,
  });
}

async function deleteFromR2(key) {
  if (!key || !isR2Enabled()) return;
  try {
    await getR2Client().send(
      new DeleteObjectCommand({
        Bucket: getBucket(),
        Key: key,
      })
    );
  } catch (error) {
    console.error('R2 delete failed:', error?.message);
  }
}

async function getPresignedGetUrl(key, expiresIn = 120) {
  if (!key || !isR2Enabled()) return null;
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  return getSignedUrl(getR2Client(), command, { expiresIn });
}

async function getObjectBuffer(key) {
  if (!key || !isR2Enabled()) return null;
  const result = await getR2Client().send(
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
  const chunks = [];
  for await (const chunk of result.Body) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function isCloudinaryUrl(url) {
  return /res\.cloudinary\.com|cloudinary\.com/i.test(String(url || ''));
}

function isR2PublicUrl(url) {
  const base = getPublicBaseUrl();
  if (!base || !url) return false;
  return String(url).startsWith(base);
}

function keyFromPublicUrl(url) {
  const { keyFromMediaUrl } = require('./mediaAccess');
  const fromMedia = keyFromMediaUrl(url);
  if (fromMedia) return fromMedia;

  const base = getPublicBaseUrl();
  if (!base || !url || !String(url).startsWith(base)) return null;
  return String(url).slice(base.length).replace(/^\//, '').split('?')[0];
}

module.exports = {
  isR2Enabled,
  buildObjectKey,
  publicUrlForKey,
  r2DevUrlForKey,
  uploadBufferToR2,
  uploadFileToR2,
  uploadExpressFileToR2,
  deleteFromR2,
  getPresignedGetUrl,
  getObjectBuffer,
  isCloudinaryUrl,
  isR2PublicUrl,
  keyFromPublicUrl,
};
