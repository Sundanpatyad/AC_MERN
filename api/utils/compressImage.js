const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function isCompressibleImage(mime) {
  const type = String(mime || '').toLowerCase();
  if (!type.startsWith('image/')) return false;
  // Keep animated GIF / SVG as-is
  if (type === 'image/gif' || type === 'image/svg+xml') return false;
  return true;
}

/**
 * Compress image in-place on express-fileupload temp file.
 * Shrinks dimensions + re-encodes; aims for smaller bytes with high visual quality.
 */
async function compressUploadedImage(file, options = {}) {
  if (!file?.tempFilePath || !isCompressibleImage(file.mimetype)) {
    return { compressed: false, file };
  }

  const maxEdge = Math.max(
    320,
    Number(options.maxEdge) ||
      Number(process.env.IMAGE_MAX_EDGE) ||
      1600
  );
  // High visual quality; still much smaller than phone camera originals
  const quality = Math.min(
    95,
    Math.max(
      60,
      Number(options.quality) || Number(process.env.IMAGE_JPEG_QUALITY) || 82
    )
  );

  const inputPath = file.tempFilePath;
  const before = fs.statSync(inputPath).size;

  try {
    const image = sharp(inputPath, { failOn: 'none' }).rotate();
    const meta = await image.metadata();

    let pipeline = image;
    if ((meta.width && meta.width > maxEdge) || (meta.height && meta.height > maxEdge)) {
      pipeline = pipeline.resize({
        width: maxEdge,
        height: maxEdge,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const hasAlpha = Boolean(meta.hasAlpha);
    const outExt = hasAlpha ? '.webp' : '.jpg';
    const outPath = path.join(
      path.dirname(inputPath),
      `${path.basename(inputPath, path.extname(inputPath))}.ac${outExt}`
    );

    if (hasAlpha) {
      await pipeline.webp({ quality, effort: 4, alphaQuality: 90 }).toFile(outPath);
      file.mimetype = 'image/webp';
      file.name = String(file.name || 'image').replace(/\.[^.]+$/i, '.webp');
    } else {
      await pipeline
        .jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:2:0' })
        .toFile(outPath);
      file.mimetype = 'image/jpeg';
      file.name = String(file.name || 'image').replace(/\.[^.]+$/i, '.jpg');
    }

    const after = fs.statSync(outPath).size;
    // Only keep compressed file if it is actually smaller (or close with resize)
    if (after < before * 0.98 || after < before) {
      fs.unlinkSync(inputPath);
      fs.renameSync(outPath, inputPath);
      file.tempFilePath = inputPath;
      file.size = after;
      return {
        compressed: true,
        before,
        after,
        savedPct: Math.round((1 - after / before) * 100),
        file,
      };
    }

    fs.unlinkSync(outPath);
    return { compressed: false, before, after, file, reason: 'already-small' };
  } catch (error) {
    console.error('Image compress skipped:', error?.message);
    return { compressed: false, file, error: error?.message };
  }
}

module.exports = {
  compressUploadedImage,
  isCompressibleImage,
};
