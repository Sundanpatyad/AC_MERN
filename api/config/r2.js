const { S3Client } = require('@aws-sdk/client-s3');

let client = null;

function isR2Enabled() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_URL
  );
}

function getR2Client() {
  if (!isR2Enabled()) return null;
  if (client) return client;

  const endpoint =
    process.env.R2_ENDPOINT ||
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  return client;
}

function keepCloudinaryAssets() {
  const raw = process.env.KEEP_CLOUDINARY_ASSETS;
  if (raw == null || raw === '') return true;
  return !['0', 'false', 'no'].includes(String(raw).toLowerCase());
}

module.exports = {
  isR2Enabled,
  getR2Client,
  keepCloudinaryAssets,
  getBucket: () => process.env.R2_BUCKET,
  getPublicBaseUrl: () => String(process.env.R2_PUBLIC_URL || '').replace(/\/$/, ''),
};
