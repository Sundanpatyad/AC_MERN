const cloudinary = require('cloudinary').v2;
const { keepCloudinaryAssets } = require('../config/r2');
const {
  isR2Enabled,
  uploadExpressFileToR2,
  deleteFromR2,
  keyFromPublicUrl,
  isCloudinaryUrl,
} = require('./r2Storage');
const { compressUploadedImage } = require('./compressImage');

/**
 * Dual-write media: always Cloudinary (for now), plus R2 when configured.
 * Images are compressed first (smaller size, high quality).
 * secure_url prefers protected API media path (website-only).
 */
exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  try {
    const mime = String(file?.mimetype || '');
    const isImage = mime.startsWith('image/');

    if (isImage) {
      // height arg historically used as max edge (e.g. 1200); ignore bogus quality>100
      const maxEdge = Number(height) > 100 ? Number(height) : undefined;
      const jpegQuality = Number(quality) > 0 && Number(quality) <= 100 ? Number(quality) : undefined;
      await compressUploadedImage(file, { maxEdge, quality: jpegQuality });
    }

    const options = { folder, resource_type: 'auto' };
    if (isImage && Number(height) > 100) {
      // Cloudinary side: optional bound (already resized locally)
      options.height = Number(height);
      options.crop = 'limit';
    }
    if (isImage && Number(quality) > 0 && Number(quality) <= 100) {
      options.quality = Number(quality);
    }

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
    return { skipped: true, reason: 'KEEP_CLOUDINARY_ASSETS' };
  }

  try {
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
