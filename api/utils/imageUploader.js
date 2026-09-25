const cloudinary = require('cloudinary').v2;
const { keepCloudinaryAssets } = require('../config/r2');
const {
  isR2Enabled,
  uploadExpressFileToR2,
  deleteFromR2,
  keyFromPublicUrl,
  isCloudinaryUrl,
} = require('./r2Storage');

/**
 * Dual-write media: always Cloudinary (for now), plus R2 when configured.
 * secure_url prefers protected API media URL (website-only), not public R2.
 */
exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  try {
    const options = { folder, resource_type: 'auto' };
    if (height) options.height = height;
    if (quality) options.quality = quality;

    const cloudinaryResult = await cloudinary.uploader.upload(file.tempFilePath, options);
    if (!cloudinaryResult) return null;

    let r2 = null;
    if (isR2Enabled()) {
      try {
        r2 = await uploadExpressFileToR2(file, folder);
      } catch (error) {
        console.error('R2 dual-write failed (Cloudinary kept):', error?.message);
      }
    }

    // Images: protected media URL. Videos: same (stream via /api/v1/media).
    const secureUrl = r2?.url || cloudinaryResult.secure_url;

    return {
      ...cloudinaryResult,
      secure_url: secureUrl,
      cloudinary_url: cloudinaryResult.secure_url,
      r2Key: r2?.key || null,
      r2_url: r2?.url || null,
    };
  } catch (error) {
    console.error('Media upload failed:', error?.message);
    return null;
  }
};

exports.deleteResourceFromCloudinary = async (urlOrPublicId) => {
  if (!urlOrPublicId) return;

  const r2Key = keyFromPublicUrl(urlOrPublicId);
  if (r2Key) {
    await deleteFromR2(r2Key);
  }

  if (keepCloudinaryAssets()) {
    // Transition mode: leave Cloudinary objects in place for existing users.
    return { skipped: true, reason: 'KEEP_CLOUDINARY_ASSETS' };
  }

  try {
    // Legacy callers sometimes pass a full URL; destroy expects public_id.
    let publicId = urlOrPublicId;
    if (isCloudinaryUrl(urlOrPublicId)) {
      const match = String(urlOrPublicId).match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
      if (match?.[1]) publicId = match[1];
    }
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Error deleting Cloudinary resource ${urlOrPublicId}:`, error?.message);
    throw error;
  }
};
