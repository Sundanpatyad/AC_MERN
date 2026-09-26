/**
 * Copy existing Cloudinary media → Cloudflare R2 and update MongoDB URLs/keys.
 * Does NOT delete anything from Cloudinary (safe for current users).
 *
 * Usage:
 *   node scripts/migrate-to-r2.js           # run
 *   node scripts/migrate-to-r2.js --dry-run # preview only
 *
 * Requires R2_* env vars (see api/.env) and Cloudinary config.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const User = require('../models/user');
const Course = require('../models/course');
const SubSection = require('../models/subSection');
const { MockTestSeries } = require('../models/mockTestSeries');
const PdfMaterial = require('../models/pdfMaterial');
const { cloudinaryConnect } = require('../config/cloudinary');
const { isR2Enabled } = require('../config/r2');
const {
  uploadBufferToR2,
  isCloudinaryUrl,
  isR2PublicUrl,
} = require('../utils/r2Storage');

const DRY = process.argv.includes('--dry-run');
const folder = process.env.FOLDER_NAME || 'LMS_AC';

cloudinaryConnect();

async function fetchUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, contentType };
}

function guessNameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split('/').pop() || 'file';
  } catch {
    return 'file';
  }
}

async function migratePublicUrl(url, subfolder) {
  if (!url || !isCloudinaryUrl(url) || isR2PublicUrl(url)) {
    return { skipped: true, url };
  }
  const { buffer, contentType } = await fetchUrl(url);
  if (DRY) {
    return { dry: true, url, bytes: buffer.length };
  }
  const uploaded = await uploadBufferToR2(buffer, {
    folder: `${folder}/${subfolder}`,
    originalName: guessNameFromUrl(url),
    contentType,
  });
  return { url: uploaded.url, key: uploaded.key };
}

async function migrateImages() {
  let updated = 0;

  const users = await User.find({ image: /cloudinary\.com/i }).select('_id image');
  for (const user of users) {
    const result = await migratePublicUrl(user.image, 'profiles');
    if (result.url && result.url !== user.image && !result.skipped && !result.dry) {
      user.image = result.url;
      await user.save();
      updated += 1;
    }
    console.log(DRY ? '[dry] user' : 'user', user._id.toString(), result.url || result.skipped);
  }

  const courses = await Course.find({ thumbnail: /cloudinary\.com/i }).select('_id thumbnail');
  for (const course of courses) {
    const result = await migratePublicUrl(course.thumbnail, 'courses');
    if (result.url && result.url !== course.thumbnail && !result.skipped && !result.dry) {
      course.thumbnail = result.url;
      await course.save();
      updated += 1;
    }
    console.log(DRY ? '[dry] course' : 'course', course._id.toString(), result.url || result.skipped);
  }

  const videos = await SubSection.find({ videoUrl: /cloudinary\.com/i }).select('_id videoUrl');
  for (const row of videos) {
    const result = await migratePublicUrl(row.videoUrl, 'videos');
    if (result.url && result.url !== row.videoUrl && !result.skipped && !result.dry) {
      row.videoUrl = result.url;
      await row.save();
      updated += 1;
    }
    console.log(DRY ? '[dry] video' : 'video', row._id.toString(), result.url || result.skipped);
  }

  const seriesList = await MockTestSeries.find({});

  for (const series of seriesList) {
    let dirty = false;
    if (isCloudinaryUrl(series.thumbnail)) {
      const result = await migratePublicUrl(series.thumbnail, 'mock-thumbs');
      if (result.url && !result.skipped && !result.dry) {
        series.thumbnail = result.url;
        dirty = true;
      }
    }

    for (const test of series.mockTests || []) {
      for (const q of test.questions || []) {
        if (isCloudinaryUrl(q.questionImage)) {
          const result = await migratePublicUrl(q.questionImage, 'mock-questions');
          if (result.url && !result.skipped && !result.dry) {
            q.questionImage = result.url;
            dirty = true;
          }
        }
        for (const opt of q.options || []) {
          if (opt && typeof opt === 'object' && isCloudinaryUrl(opt.image)) {
            const result = await migratePublicUrl(opt.image, 'mock-options');
            if (result.url && !result.skipped && !result.dry) {
              opt.image = result.url;
              dirty = true;
            }
          }
        }
      }
    }

    if (!dirty) continue;
    if (dirty && !DRY) {
      await series.save();
      updated += 1;
    }
    console.log(DRY ? '[dry] mock' : 'mock', series._id.toString(), 'updated');
  }

  return updated;
}

async function migratePdfs() {
  let updated = 0;
  const materials = await PdfMaterial.find({
    cloudinaryPublicId: { $exists: true, $ne: '' },
    $or: [{ r2Key: { $exists: false } }, { r2Key: '' }, { r2Key: null }],
  });

  for (const material of materials) {
    try {
      const signedUrl = cloudinary.url(material.cloudinaryPublicId, {
        resource_type: 'raw',
        type: material.cloudinaryType || 'authenticated',
        sign_url: true,
        secure: true,
        expires_at: Math.floor(Date.now() / 1000) + 300,
      });
      const { buffer, contentType } = await fetchUrl(signedUrl);
      if (DRY) {
        console.log('[dry] pdf', material._id.toString(), buffer.length, 'bytes');
        continue;
      }
      const uploaded = await uploadBufferToR2(buffer, {
        folder: `${folder}/pdfs`,
        originalName: `${material._id}.pdf`,
        contentType: contentType.includes('pdf') ? 'application/pdf' : contentType,
      });
      material.r2Key = uploaded.key;
      await material.save();
      updated += 1;
      console.log('pdf', material._id.toString(), uploaded.key);
    } catch (error) {
      console.error('pdf fail', material._id.toString(), error.message);
    }
  }

  return updated;
}

async function main() {
  if (!isR2Enabled()) {
    console.error('R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.DATABASE_URL);
  console.log(DRY ? 'Dry run — no DB writes' : 'Migrating Cloudinary → R2 (Cloudinary kept)');

  const images = await migrateImages();
  const pdfs = await migratePdfs();

  console.log(`Done. Docs updated: images/series≈${images}, pdfs=${pdfs}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
