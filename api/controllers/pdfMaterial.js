const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Readable } = require('stream');
const mongoose = require('mongoose');
const PdfMaterial = require('../models/pdfMaterial');
const PdfCategory = require('../models/pdfCategory');
const PdfExam = require('../models/pdfExam');
const PdfPurchase = require('../models/pdfPurchase');
const User = require('../models/user');
const razorpay = require('../config/rajorpay');
const { keepCloudinaryAssets } = require('../config/r2');
const {
  isR2Enabled,
  uploadExpressFileToR2,
  deleteFromR2,
  getPresignedGetUrl,
  getObjectBuffer,
} = require('../utils/r2Storage');
const { uploadImageToCloudinary, deleteResourceFromCloudinary } = require('../utils/imageUploader');

const STAFF = new Set(['Admin', 'Instructor']);

const fileRevision = (material) =>
  crypto
    .createHash('sha1')
    .update(String(material?.r2Key || material?.cloudinaryPublicId || material?._id || ''))
    .digest('hex')
    .slice(0, 16);

const readUser = (req) => {
  try {
    const header = req.header('Authorization') || req.header('authorization');
    const token = header?.replace(/^Bearer\s+/i, '').trim() || req.cookies?.token;
    if (!token || !process.env.JWT_SECRET) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

const bearerUser = (req) => {
  try {
    const header = req.header('Authorization') || req.header('authorization');
    const token = header?.replace(/^Bearer\s+/i, '').trim();
    if (!token || !process.env.JWT_SECRET) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

const isPdf = (file) => {
  const name = String(file?.name || '').toLowerCase();
  const type = String(file?.mimetype || '').toLowerCase();
  return type === 'application/pdf' || name.endsWith('.pdf');
};

const parseMockIds = (value) => {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split(',');
  return list
    .map((id) => String(id).trim())
    .filter((id) => mongoose.Types.ObjectId.isValid(id));
};

const uploadPdf = async (file) => {
  const base = {
    folder: process.env.FOLDER_NAME || 'study-pdfs',
    resource_type: 'raw',
    unique_filename: true,
    overwrite: false,
  };
  let cloudinaryResult;
  try {
    cloudinaryResult = await cloudinary.uploader.upload(file.tempFilePath, {
      ...base,
      type: 'authenticated',
    });
  } catch (error) {
    console.error('Authenticated PDF upload failed, retrying as private:', error?.message);
    cloudinaryResult = await cloudinary.uploader.upload(file.tempFilePath, {
      ...base,
      type: 'private',
    });
  }

  let r2 = null;
  if (isR2Enabled()) {
    try {
      r2 = await uploadExpressFileToR2(file, `${process.env.FOLDER_NAME || 'study-pdfs'}/pdfs`);
    } catch (error) {
      console.error('R2 PDF dual-write failed (Cloudinary kept):', error?.message);
    }
  }

  return {
    ...cloudinaryResult,
    r2Key: r2?.key || '',
  };
};

const countPdfPages = (buffer) => {
  const src = Buffer.isBuffer(buffer) ? buffer.toString('latin1') : String(buffer || '');
  let best = 0;
  for (const match of src.matchAll(/\/Count\s+(\d+)/g)) {
    const n = Number(match[1]);
    if (n > best && n < 2000) best = n;
  }
  if (best > 0) return best;
  const objs = src.match(/\/Type\s*\/Page(?![s\w])/g);
  return objs ? objs.length : 0;
};

const uploadPreview = async (filePath) => {
  const options = {
    folder: `${process.env.FOLDER_NAME || 'study-pdfs'}/previews`,
    resource_type: 'image',
    format: 'pdf',
    unique_filename: true,
    overwrite: false,
  };
  try {
    return await cloudinary.uploader.upload(filePath, {
      ...options,
      type: 'authenticated',
    });
  } catch (error) {
    console.error('Preview upload failed, retrying as private:', error?.message);
    return cloudinary.uploader.upload(filePath, {
      ...options,
      type: 'private',
    });
  }
};

const destroyPreview = async (publicId, type) => {
  if (!publicId || keepCloudinaryAssets()) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      type: type || 'authenticated',
    });
  } catch (error) {
    console.error('Could not delete preview:', error?.message);
  }
};

const previewLocks = new Map();

const downloadOriginalPdf = async (material) => {
  if (material?.r2Key) {
    try {
      const fromR2 = await getObjectBuffer(material.r2Key);
      if (fromR2?.length) return fromR2;
    } catch (error) {
      console.error('R2 PDF download failed, trying Cloudinary:', error?.message);
    }
  }

  if (!material?.cloudinaryPublicId) return null;
  const signedUrl = cloudinary.url(material.cloudinaryPublicId, {
    resource_type: 'raw',
    type: material.cloudinaryType || 'authenticated',
    sign_url: true,
    secure: true,
    expires_at: Math.floor(Date.now() / 1000) + 180,
  });
  const upstream = await fetch(signedUrl);
  if (!upstream.ok) return null;
  return Buffer.from(await upstream.arrayBuffer());
};

const writePreviewFromPdf = async (fresh, buffer) => {
  const tmp = path.join(os.tmpdir(), `ac-preview-${fresh._id}.pdf`);
  fs.writeFileSync(tmp, buffer);
  try {
    const uploaded = await uploadPreview(tmp);
    if (!uploaded?.public_id) return fresh;
    if (fresh.previewPublicId && fresh.previewPublicId !== uploaded.public_id) {
      await destroyPreview(fresh.previewPublicId, fresh.previewType);
    }
    fresh.previewPublicId = uploaded.public_id;
    fresh.previewType = uploaded.type || 'authenticated';
    fresh.pageCount = Number(uploaded.pages) || countPdfPages(buffer) || 0;
    await fresh.save();
    return fresh;
  } finally {
    fs.unlink(tmp, () => {});
  }
};

const readCloudinaryPages = async (material) => {
  if (!material?.previewPublicId) return null;
  try {
    const info = await cloudinary.api.resource(material.previewPublicId, {
      resource_type: 'image',
      type: material.previewType || 'authenticated',
      pages: true,
    });
    return {
      pages: Number(info.pages) || 0,
      format: String(info.format || '').toLowerCase(),
    };
  } catch (error) {
    console.error('readCloudinaryPages:', error?.message);
    return null;
  }
};

const ensurePreview = async (material) => {
  if (material.previewPublicId && Number(material.pageCount) > 1) return material;
  const key = String(material._id);
  if (previewLocks.has(key)) return previewLocks.get(key);

  const job = (async () => {
    const fresh = await PdfMaterial.findById(material._id);
    if (!fresh) return null;
    if (fresh.previewPublicId && Number(fresh.pageCount) > 1) return fresh;

    if (fresh.previewPublicId) {
      const info = await readCloudinaryPages(fresh);
      if (info?.format === 'pdf' && info.pages > 0) {
        if (Number(fresh.pageCount) !== info.pages) {
          fresh.pageCount = info.pages;
          await fresh.save();
        }
        return fresh;
      }
    }

    const buffer = await downloadOriginalPdf(fresh);
    if (!buffer) return fresh;
    return writePreviewFromPdf(fresh, buffer);
  })();

  previewLocks.set(key, job);
  try {
    return await job;
  } finally {
    previewLocks.delete(key);
  }
};

const destroyPdf = async (publicId, type, r2Key) => {
  if (r2Key) await deleteFromR2(r2Key);
  if (!publicId || keepCloudinaryAssets()) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
      type: type || 'authenticated',
    });
  } catch (error) {
    console.error('Could not delete stored PDF:', error?.message);
  }
};

const examRecord = (exam) => {
  if (!exam || !exam._id) return null;
  const access = exam.access === 'paid' && Number(exam.price) > 0 ? 'paid' : 'free';
  return {
    _id: String(exam._id),
    name: exam.name,
    category: exam.category,
    access,
    price: access === 'paid' ? Number(exam.price) || 0 : 0,
  };
};

const ownsExam = (user, examId) =>
  (user?.studyExams || []).some((id) => String(id) === String(examId));

const toPublic = (doc, user) => {
  const exam = examRecord(doc.exam);
  const examOwned = exam ? ownsExam(user, exam._id) : false;
  const staff = STAFF.has(user?.accountType);
  const pdfAccess = doc.access === 'paid' && Number(doc.price) > 0 ? 'paid' : 'free';
  const pdfOwned = (user?.studyPdfs || []).some((id) => String(id) === String(doc._id));
  const soldAsSet = exam?.access === 'paid';
  const access = soldAsSet ? 'paid' : pdfAccess;
  const price = soldAsSet ? exam.price : access === 'paid' ? Number(doc.price) || 0 : 0;
  const canView = staff || (soldAsSet ? examOwned : access === 'free' || pdfOwned);
  return {
    _id: String(doc._id),
    title: doc.title,
    description: doc.description || '',
    category: doc.category,
    exam: exam ? { ...exam, owned: examOwned } : null,
    access,
    price,
    soldAsSet,
    mockTests: (doc.mockTests || []).map((item) =>
      item && item._id
        ? { _id: String(item._id), seriesName: item.seriesName || '' }
        : item
    ),
    canView,
    status: doc.status === 'draft' ? 'draft' : 'published',
    createdAt: doc.createdAt,
  };
};

const loadOwnedIds = async (user) => {
  if (!user?.id) return user;
  const record = await User.findById(user.id).select('studyPdfs studyExams accountType email').lean();
  if (!record) return user;
  return {
    ...user,
    accountType: record.accountType || user.accountType,
    studyPdfs: record.studyPdfs || [],
    studyExams: record.studyExams || [],
    email: record.email || user.email,
  };
};

exports.listPdfs = async (req, res) => {
  try {
    const user = await loadOwnedIds(readUser(req));
    const q = String(req.query.q || '').trim();
    const category = String(req.query.category || '').trim();
    const examId = String(req.query.exam || '').trim();
    const paginate = req.query.page != null && String(req.query.page) !== '';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(24, Math.max(1, parseInt(req.query.limit, 10) || 9));

    const search = {};
    if (q) {
      const pattern = new RegExp(escapeRegExp(q), 'i');
      search.$or = [{ title: pattern }, { description: pattern }, { category: pattern }];
    }
    const includeDrafts = STAFF.has(user?.accountType) && req.query.manage === '1';
    const filter = { ...search };
    if (category && category.toLowerCase() !== 'all') filter.category = category;
    if (examId && mongoose.Types.ObjectId.isValid(examId)) filter.exam = examId;
    if (!includeDrafts) {
      filter.status = { $ne: 'draft' };
      const publishedExamIds = await PdfExam.find({ status: { $ne: 'draft' } }).distinct('_id');
      if (filter.exam) {
        const allowed = publishedExamIds.some((id) => String(id) === String(filter.exam));
        if (!allowed) filter.exam = { $in: [] };
      } else {
        filter.exam = { $in: publishedExamIds };
      }
    }

    const latest = req.query.sort === 'latest';
    const query = PdfMaterial.find(filter)
      .sort(latest ? { createdAt: -1 } : { category: 1, title: 1 })
      .populate('mockTests', 'seriesName')
      .populate('exam', 'name category access price status');

    // Catalog lists: SWR at the HTTP layer (CDN / browser). Auth responses stay private.
    if (!user?.id) {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    } else {
      res.setHeader('Cache-Control', 'private, max-age=30, stale-while-revalidate=120');
    }
    res.setHeader('Vary', 'Authorization');

    if (!paginate) {
      const materials = await query.lean();
      return res.status(200).json({
        success: true,
        data: materials.map((item) => toPublic(item, user)),
      });
    }

    const [total, materials, grouped] = await Promise.all([
      PdfMaterial.countDocuments(filter),
      query.skip((page - 1) * limit).limit(limit).lean(),
      PdfMaterial.aggregate([
        { $match: search },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: materials.map((item) => toPublic(item, user)),
      page,
      limit,
      total,
      hasMore: page * limit < total,
      categories: grouped.map((row) => ({ name: row._id || 'General', count: row.count })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not load study material' });
  }
};

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.listCategories = async (req, res) => {
  try {
    const used = await PdfMaterial.distinct('category');
    await Promise.all(
      used
        .map((name) => String(name || '').trim())
        .filter(Boolean)
        .map((name) =>
          PdfCategory.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true })
        )
    );
    const categories = await PdfCategory.find().sort({ name: 1 }).lean();
    const counts = await PdfExam.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countByName = new Map(counts.map((row) => [row._id, row.count]));
    res.status(200).json({
      success: true,
      data: categories.map((category) => ({
        _id: category._id,
        name: category.name,
        count: countByName.get(category.name) || 0,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not load categories' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const existing = await PdfCategory.findOne({
      name: new RegExp(`^${escapeRegExp(name)}$`, 'i'),
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This category already exists' });
    }
    const category = await PdfCategory.create({ name });
    res.status(201).json({
      success: true,
      data: { _id: category._id, name: category.name, count: 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not create category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await PdfCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const inUse = await PdfExam.countDocuments({ category: category.name });
    if (inUse > 0) {
      return res.status(400).json({
        success: false,
        message: 'Delete the exams in this category first',
      });
    }
    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not delete category' });
  }
};

exports.listForMock = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.mockId)) {
      return res.status(400).json({ success: false, message: 'Invalid mock test' });
    }
    const user = await loadOwnedIds(readUser(req));
    const mockFilter = { mockTests: req.params.mockId, status: { $ne: 'draft' } };
    mockFilter.exam = { $in: await PdfExam.find({ status: { $ne: 'draft' } }).distinct('_id') };
    const materials = await PdfMaterial.find(mockFilter)
      .sort({ title: 1 })
      .populate('mockTests', 'seriesName')
      .populate('exam', 'name category access price')
      .lean();
    res.status(200).json({
      success: true,
      data: materials.map((item) => toPublic(item, user)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not load linked material' });
  }
};

const loadExam = async (examId) => {
  if (!examId || !mongoose.Types.ObjectId.isValid(String(examId))) return null;
  return PdfExam.findById(examId);
};

const examSoldAsSet = (exam) => exam && exam.access === 'paid' && Number(exam.price) > 0;

exports.createPdf = async (req, res) => {
  try {
    const file = req.files?.pdf;
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const exam = await loadExam(req.body.exam);
    let access = req.body.access === 'paid' ? 'paid' : 'free';
    let price = access === 'paid' ? Math.max(0, Number(req.body.price) || 0) : 0;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!exam) {
      return res.status(400).json({ success: false, message: 'Choose an exam' });
    }
    if (examSoldAsSet(exam)) {
      access = 'free';
      price = 0;
    }
    if (!file || !isPdf(file)) {
      return res.status(400).json({ success: false, message: 'Upload a PDF file' });
    }
    if (access === 'paid' && price <= 0) {
      return res.status(400).json({ success: false, message: 'Paid material needs a price' });
    }

    const uploaded = await uploadPdf(file);
    if (!uploaded?.public_id) {
      return res.status(500).json({ success: false, message: 'Could not store the PDF' });
    }

    let preview = null;
    try {
      preview = await uploadPreview(file.tempFilePath);
    } catch (error) {
      console.error('Could not build PDF preview:', error?.message);
    }

    const material = await PdfMaterial.create({
      title,
      description,
      category: exam.category,
      exam: exam._id,
      status: req.body.status === 'published' ? 'published' : 'draft',
      access: price > 0 ? 'paid' : 'free',
      price,
      cloudinaryPublicId: uploaded.public_id,
      cloudinaryType: uploaded.type || 'authenticated',
      r2Key: uploaded.r2Key || '',
      previewPublicId: preview?.public_id || '',
      previewType: preview?.type || 'authenticated',
      mockTests: parseMockIds(req.body.mockTests),
      createdBy: req.user.id,
    });

    const populated = await material.populate([
      { path: 'mockTests', select: 'seriesName' },
      { path: 'exam', select: 'name category access price' },
    ]);
    const user = await loadOwnedIds(req.user);
    res.status(201).json({ success: true, data: toPublic(populated, user) });
  } catch (error) {
    console.error('createPdf:', error);
    res.status(500).json({ success: false, message: 'Could not create study material' });
  }
};

exports.updatePdf = async (req, res) => {
  try {
    const material = await PdfMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Study material not found' });
    }

    if (req.body.title != null) material.title = String(req.body.title).trim();
    if (req.body.description != null) material.description = String(req.body.description).trim();
    if (req.body.mockTests != null) material.mockTests = parseMockIds(req.body.mockTests);

    const nextExam = req.body.exam != null ? await loadExam(req.body.exam) : await loadExam(material.exam);
    if (!nextExam) {
      return res.status(400).json({ success: false, message: 'Choose an exam' });
    }
    material.exam = nextExam._id;
    material.category = nextExam.category;

    let access = req.body.access === 'paid' ? 'paid' : req.body.access === 'free' ? 'free' : material.access;
    let price = access === 'paid'
      ? Math.max(0, Number(req.body.price ?? material.price) || 0)
      : 0;
    if (examSoldAsSet(nextExam)) {
      access = 'free';
      price = 0;
    }
    if (access === 'paid' && price <= 0) {
      return res.status(400).json({ success: false, message: 'Paid material needs a price' });
    }
    material.access = price > 0 ? 'paid' : 'free';
    material.price = price;
    if (req.body.status === 'draft' || req.body.status === 'published') {
      material.status = req.body.status;
    }

    if (!material.title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const file = req.files?.pdf;
    if (file) {
      if (!isPdf(file)) {
        return res.status(400).json({ success: false, message: 'Upload a PDF file' });
      }
      const uploaded = await uploadPdf(file);
      if (!uploaded?.public_id) {
        return res.status(500).json({ success: false, message: 'Could not store the PDF' });
      }
      await destroyPdf(material.cloudinaryPublicId, material.cloudinaryType, material.r2Key);
      await destroyPreview(material.previewPublicId, material.previewType);
      material.cloudinaryPublicId = uploaded.public_id;
      material.cloudinaryType = uploaded.type || 'authenticated';
      material.r2Key = uploaded.r2Key || '';
      material.previewPublicId = '';
      material.pageCount = 0;
      try {
        const preview = await uploadPreview(file.tempFilePath);
        if (preview?.public_id) {
          material.previewPublicId = preview.public_id;
          material.previewType = preview.type || 'authenticated';
        }
      } catch (error) {
        console.error('Could not build PDF preview:', error?.message);
      }
    }

    await material.save();
    const populated = await material.populate([
      { path: 'mockTests', select: 'seriesName' },
      { path: 'exam', select: 'name category access price' },
    ]);
    const user = await loadOwnedIds(req.user);
    res.status(200).json({ success: true, data: toPublic(populated, user) });
  } catch (error) {
    console.error('updatePdf:', error);
    res.status(500).json({ success: false, message: 'Could not update study material' });
  }
};

exports.deletePdf = async (req, res) => {
  try {
    const material = await PdfMaterial.findByIdAndDelete(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Study material not found' });
    }
    await destroyPdf(material.cloudinaryPublicId, material.cloudinaryType, material.r2Key);
    await destroyPreview(material.previewPublicId, material.previewType);
    await User.updateMany(
      { studyPdfs: material._id },
      { $pull: { studyPdfs: material._id } }
    );
    res.status(200).json({ success: true, message: 'Study material deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not delete study material' });
  }
};

const assertCanView = async (material, user) => {
  const fullUser = await loadOwnedIds(user);
  if (STAFF.has(fullUser?.accountType)) return fullUser;
  if (material.status === 'draft') {
    const error = new Error('Study material not found');
    error.status = 404;
    throw error;
  }

  let exam = material.exam;
  if (exam && exam._id && exam.access == null) exam = exam._id;
  if (exam && !exam.access) {
    exam = await PdfExam.findById(exam).select('access price status').lean();
  }
  if (exam && exam.status === 'draft') {
    const error = new Error('Study material not found');
    error.status = 404;
    throw error;
  }
  if (examSoldAsSet(exam)) {
    if (!ownsExam(fullUser, exam._id)) {
      const error = new Error('Purchase required');
      error.status = 403;
      throw error;
    }
    return fullUser;
  }

  const access = material.access === 'paid' && Number(material.price) > 0 ? 'paid' : 'free';
  if (access === 'free') return fullUser;
  const owned = (fullUser?.studyPdfs || []).some((id) => String(id) === String(material._id));
  if (!owned) {
    const error = new Error('Purchase required');
    error.status = 403;
    throw error;
  }
  return fullUser;
};

exports.issueTicket = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || String(req.params.id) === '[object Object]') {
      return res.status(400).json({ success: false, message: 'Could not open this material' });
    }
    const material = await PdfMaterial.findById(req.params.id).select('_id access price status exam cloudinaryPublicId r2Key');
    if (!material) {
      return res.status(404).json({ success: false, message: 'Study material not found' });
    }
    await assertCanView(material, req.user);
    const ticket = jwt.sign(
      { purpose: 'pdf-view', pdfId: String(material._id), uid: String(req.user.id) },
      process.env.JWT_SECRET,
      { expiresIn: '3m' }
    );
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(200).json({ success: true, ticket, revision: fileRevision(material) });
  } catch (error) {
    console.error('issueTicket:', error?.message || error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: status === 403 ? 'Purchase required' : 'Could not open this material',
    });
  }
};

const requireViewer = async (req) => {
  const user = bearerUser(req);
  const ticket = req.header('X-AC-Viewer');
  if (!user?.id || !ticket) {
    const error = new Error('Open this material on the website');
    error.status = 401;
    throw error;
  }
  let decoded;
  try {
    decoded = jwt.verify(ticket, process.env.JWT_SECRET);
  } catch {
    const error = new Error('Open this material on the website');
    error.status = 401;
    throw error;
  }
  if (
    decoded.purpose !== 'pdf-view' ||
    String(decoded.uid) !== String(user.id) ||
    String(decoded.pdfId) !== String(req.params.id)
  ) {
    const error = new Error('Open this material on the website');
    error.status = 403;
    throw error;
  }
  const material = await PdfMaterial.findById(req.params.id);
  if (!material) {
    const error = new Error('Study material not found');
    error.status = 404;
    throw error;
  }
  await assertCanView(material, user);
  return material;
};

const countPages = async (material) => {
  const ready = await ensurePreview(material);
  if (Number(ready?.pageCount) > 0) return Number(ready.pageCount);
  const info = await readCloudinaryPages(ready);
  const count = Number(info?.pages) || 1;
  if (ready && count !== Number(ready.pageCount)) {
    ready.pageCount = count;
    await ready.save();
  }
  return count;
};

exports.pdfPageCount = async (req, res) => {
  try {
    const material = await requireViewer(req);
    const pages = await countPages(material);
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(200).json({ success: true, pages, revision: fileRevision(material) });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: status === 403 ? 'Purchase required' : 'Could not open this material',
    });
  }
};

exports.streamPdfPage = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.params.page, 10) || 1);
    const material = await requireViewer(req);
    const ready = await ensurePreview(material);
    if (!ready?.previewPublicId) return res.status(404).end();

    const signedUrl = cloudinary.url(ready.previewPublicId, {
      resource_type: 'image',
      type: ready.previewType || 'authenticated',
      format: 'jpg',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 180,
      transformation: [{ page, width: 900, crop: 'limit', quality: 'auto:good' }],
    });
    const upstream = await fetch(signedUrl);
    if (!upstream.ok || !upstream.body) return res.status(404).end();

    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    if (!res.headersSent) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        message: status === 403 ? 'Purchase required' : 'Could not open this material',
      });
    }
  }
};

exports.previewPdf = async (req, res) => {
  try {
    const material = await PdfMaterial.findById(req.params.id);
    if (!material) return res.status(404).end();

    const ready = await ensurePreview(material);
    if (!ready?.previewPublicId) return res.status(404).end();

    const signedUrl = cloudinary.url(ready.previewPublicId, {
      resource_type: 'image',
      type: ready.previewType || 'authenticated',
      format: 'jpg',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 300,
      transformation: [{ page: 1, width: 640, crop: 'limit', quality: 'auto:good' }],
    });

    const upstream = await fetch(signedUrl);
    if (!upstream.ok || !upstream.body) return res.status(502).end();

    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    console.error('previewPdf:', error);
    if (!res.headersSent) res.status(500).end();
  }
};

exports.streamPdf = async (req, res) => {
  try {
    const user = bearerUser(req);
    const ticket = req.header('X-AC-Viewer');
    if (!user?.id || !ticket) {
      return res.status(401).json({ success: false, message: 'Open this material on the website' });
    }

    let decoded;
    try {
      decoded = jwt.verify(ticket, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Open this material on the website' });
    }

    if (
      decoded.purpose !== 'pdf-view' ||
      String(decoded.uid) !== String(user.id) ||
      String(decoded.pdfId) !== String(req.params.id)
    ) {
      return res.status(403).json({ success: false, message: 'Open this material on the website' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Could not open this material' });
    }

    const material = await PdfMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Study material not found' });
    }
    await assertCanView(material, user);

    // Prefer buffer download (R2 → Cloudinary). Avoid Readable.fromWeb — flaky on Cloud Run.
    const buffer = await downloadOriginalPdf(material);
    if (!buffer?.length) {
      console.error('streamPdf: empty buffer', {
        id: String(material._id),
        r2Key: material.r2Key || null,
        cloudinaryPublicId: material.cloudinaryPublicId || null,
      });
      return res.status(502).json({ success: false, message: 'Could not open this material' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store, private, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', 'sandbox');
    res.setHeader('Content-Length', String(buffer.length));
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('streamPdf:', error?.message || error);
    if (!res.headersSent) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        message: status === 403 ? 'Purchase required' : 'Could not open this material',
      });
    }
  }
};

exports.createOrder = async (req, res) => {
  try {
    const material = await PdfMaterial.findById(req.params.id).populate('exam', 'access price name status');
    if (!material || material.status === 'draft' || material.exam?.status === 'draft') {
      return res.status(404).json({ success: false, message: 'Study material not found' });
    }
    if (examSoldAsSet(material.exam)) {
      return res.status(400).json({ success: false, message: 'Buy the exam to unlock these PDFs' });
    }
    if (material.access !== 'paid' || Number(material.price) <= 0) {
      return res.status(400).json({ success: false, message: 'This material is free' });
    }
    const user = await loadOwnedIds(req.user);
    const owned = (user.studyPdfs || []).some((id) => String(id) === String(material._id));
    if (owned) {
      return res.status(400).json({ success: false, message: 'Already unlocked' });
    }

    const amount = Math.round(Number(material.price) * 100);
    const order = await razorpay.instance.orders.create({
      amount,
      currency: 'INR',
      receipt: `pdf${String(material._id).slice(-8)}${Date.now()}`.slice(0, 40),
      payment_capture: 1,
      notes: {
        itemType: 'study-pdf',
        userId: String(req.user.id),
        pdfId: String(material._id),
      },
    });

    await PdfPurchase.create({
      user: req.user.id,
      pdf: material._id,
      razorpayOrderId: order.id,
      amount: Number(material.price),
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('createPdfOrder:', error);
    res.status(500).json({ success: false, message: 'Could not start payment' });
  }
};

exports.grantStudyPdfPayment = async ({ orderId, paymentId, notes, session }) => {
  const isStudyNote = notes?.itemType === 'study-pdf' || notes?.itemType === 'study-exam';
  const purchaseQuery = orderId ? PdfPurchase.findOne({ razorpayOrderId: orderId }) : null;
  if (purchaseQuery && session) purchaseQuery.session(session);
  const purchase = purchaseQuery ? await purchaseQuery : null;
  if (!purchase && !isStudyNote) return false;

  if (purchase?.status === 'refunded') return true;
  const userId = purchase?.user || notes?.userId;
  const pdfId = purchase?.pdf || notes?.pdfId;
  const examId = purchase?.exam || notes?.examId;
  if (!userId || (!pdfId && !examId)) return false;

  if (purchase && purchase.status !== 'paid') {
    purchase.status = 'paid';
    if (paymentId) purchase.razorpayPaymentId = paymentId;
    await purchase.save(session ? { session } : undefined);
  } else if (purchase && paymentId && !purchase.razorpayPaymentId) {
    purchase.razorpayPaymentId = paymentId;
    await purchase.save(session ? { session } : undefined);
  }

  if (examId) {
    await User.updateOne(
      { _id: userId },
      { $addToSet: { studyExams: examId } },
      session ? { session } : undefined
    );
    console.log('[Webhook] Study exam unlocked', { userId: String(userId), examId: String(examId), orderId });
    return true;
  }

  await User.updateOne(
    { _id: userId },
    { $addToSet: { studyPdfs: pdfId } },
    session ? { session } : undefined
  );
  console.log('[Webhook] Study material unlocked', { userId: String(userId), pdfId: String(pdfId), orderId });
  return true;
};

exports.refundStudyPdfPayment = async ({ paymentId, session }) => {
  if (!paymentId) return false;
  const purchaseQuery = PdfPurchase.findOne({ razorpayPaymentId: paymentId });
  if (session) purchaseQuery.session(session);
  const purchase = await purchaseQuery;
  if (!purchase || purchase.status === 'refunded') return false;

  purchase.status = 'refunded';
  await purchase.save({ session });
  if (purchase.exam) {
    await User.updateOne(
      { _id: purchase.user },
      { $pull: { studyExams: purchase.exam } },
      { session }
    );
  } else if (purchase.pdf) {
    await User.updateOne(
      { _id: purchase.user },
      { $pull: { studyPdfs: purchase.pdf } },
      { session }
    );
  }
  console.log('[Webhook] Study material refunded', { paymentId });
  return true;
};

exports.verifyOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const purchase = await PdfPurchase.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user.id,
      pdf: req.params.id,
    });
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    purchase.status = 'paid';
    purchase.razorpayPaymentId = razorpay_payment_id;
    await purchase.save();
    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { studyPdfs: purchase.pdf } }
    );

    res.status(200).json({ success: true, message: 'Study material unlocked' });
  } catch (error) {
    console.error('verifyPdfOrder:', error);
    res.status(500).json({ success: false, message: 'Could not verify payment' });
  }
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const publicExam = (exam, user, pdfCount) => {
  const access = examSoldAsSet(exam) ? 'paid' : 'free';
  return {
    _id: String(exam._id),
    name: exam.name,
    category: exam.category,
    description: exam.description || '',
    thumbnail: exam.thumbnail || '',
    access,
    price: access === 'paid' ? Number(exam.price) || 0 : 0,
    pdfCount: pdfCount || 0,
    owned: access === 'paid' ? ownsExam(user, exam._id) : false,
    status: exam.status === 'draft' ? 'draft' : 'published',
  };
};

const examThumbFolder = () =>
  `${process.env.FOLDER_NAME || 'LMS_AC'}-exam-thumbs`;

const isImageFile = (file) => {
  const type = String(file?.mimetype || '').toLowerCase();
  const name = String(file?.name || '').toLowerCase();
  return type.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(name);
};

async function uploadExamThumbnail(file, previousUrl = '') {
  if (!file || !isImageFile(file)) return previousUrl || '';
  const uploaded = await uploadImageToCloudinary(file, examThumbFolder(), 900, 82);
  if (!uploaded?.secure_url) return previousUrl || '';
  if (previousUrl && previousUrl !== uploaded.secure_url) {
    try {
      await deleteResourceFromCloudinary(previousUrl);
    } catch (error) {
      console.error('exam thumbnail cleanup:', error?.message);
    }
  }
  return uploaded.secure_url;
}

exports.listExams = async (req, res) => {
  try {
    const user = await loadOwnedIds(readUser(req));
    const category = String(req.query.category || '').trim();
    const q = String(req.query.q || '').trim();
    const includeDrafts = STAFF.has(user?.accountType) && req.query.manage === '1';
    const filter = {};
    if (!includeDrafts) filter.status = { $ne: 'draft' };
    if (category && category.toLowerCase() !== 'all') filter.category = category;
    if (q) filter.name = { $regex: escapeRegex(q), $options: 'i' };

    const latest = req.query.sort === 'latest';
    const exams = await PdfExam.find(filter)
      .sort(latest ? { createdAt: -1 } : { category: 1, name: 1 })
      .lean();
    const counts = exams.length
      ? await PdfMaterial.aggregate([
          {
            $match: {
              exam: { $in: exams.map((item) => item._id) },
              ...(includeDrafts ? {} : { status: { $ne: 'draft' } }),
            },
          },
          { $group: { _id: '$exam', count: { $sum: 1 } } },
        ])
      : [];
    const countMap = new Map(counts.map((item) => [String(item._id), item.count]));
    const categories = await PdfCategory.find().sort({ name: 1 }).lean();
    const examCounts = await PdfExam.aggregate([
      ...(includeDrafts ? [] : [{ $match: { status: { $ne: 'draft' } } }]),
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const categoryMap = new Map(examCounts.map((item) => [item._id, item.count]));

    // HTTP caching: anonymous lists are public; logged-in lists stay private (owned flags).
    if (!user?.id) {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    } else {
      res.setHeader('Cache-Control', 'private, max-age=30, stale-while-revalidate=120');
    }
    res.setHeader('Vary', 'Authorization');

    res.status(200).json({
      success: true,
      data: exams.map((exam) => publicExam(exam, user, countMap.get(String(exam._id)) || 0)),
      categories: categories
        .map((item) => ({
          _id: item._id,
          name: item.name,
          count: categoryMap.get(item.name) || 0,
        }))
        .filter((item) => includeDrafts || item.count > 0),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not load exams' });
  }
};

exports.createExam = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const category = String(req.body.category || '').trim();
    const description = String(req.body.description || '').trim();
    const access = req.body.access === 'paid' ? 'paid' : 'free';
    const price = access === 'paid' ? Math.max(0, Number(req.body.price) || 0) : 0;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }
    const categoryExists = await PdfCategory.findOne({ name: category });
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Choose a category' });
    }
    if (access === 'paid' && price <= 0) {
      return res.status(400).json({ success: false, message: 'A paid exam needs a price' });
    }
    const duplicate = await PdfExam.findOne({
      category,
      name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' },
    });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'This exam already exists in the category' });
    }

    const thumbnail = await uploadExamThumbnail(req.files?.thumbnail);

    const exam = await PdfExam.create({
      name,
      category,
      description,
      thumbnail: thumbnail || '',
      access: price > 0 ? 'paid' : 'free',
      price,
      status: req.body.status === 'published' ? 'published' : 'draft',
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, data: publicExam(exam, req.user, 0) });
  } catch (error) {
    console.error('createExam:', error);
    res.status(500).json({ success: false, message: 'Could not create exam' });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await PdfExam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    if (req.body.name != null) exam.name = String(req.body.name).trim();
    if (req.body.description != null) exam.description = String(req.body.description).trim();
    if (req.body.category != null) {
      const category = String(req.body.category).trim();
      const categoryExists = await PdfCategory.findOne({ name: category });
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: 'Choose a category' });
      }
      exam.category = category;
    }

    const access = req.body.access === 'paid' ? 'paid' : req.body.access === 'free' ? 'free' : exam.access;
    const price = access === 'paid' ? Math.max(0, Number(req.body.price ?? exam.price) || 0) : 0;
    if (access === 'paid' && price <= 0) {
      return res.status(400).json({ success: false, message: 'A paid exam needs a price' });
    }
    exam.access = price > 0 ? 'paid' : 'free';
    exam.price = price;
    if (req.body.status === 'draft' || req.body.status === 'published') {
      exam.status = req.body.status;
    }
    if (!exam.name || !exam.category) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }

    if (req.files?.thumbnail) {
      exam.thumbnail = await uploadExamThumbnail(req.files.thumbnail, exam.thumbnail || '');
    } else if (req.body.removeThumbnail === '1' || req.body.removeThumbnail === 'true') {
      if (exam.thumbnail) {
        try {
          await deleteResourceFromCloudinary(exam.thumbnail);
        } catch (error) {
          console.error('exam thumbnail remove:', error?.message);
        }
      }
      exam.thumbnail = '';
    }

    await exam.save();
    await PdfMaterial.updateMany(
      { exam: exam._id },
      examSoldAsSet(exam)
        ? { category: exam.category, access: 'free', price: 0 }
        : { category: exam.category }
    );
    const pdfCount = await PdfMaterial.countDocuments({ exam: exam._id });
    res.status(200).json({ success: true, data: publicExam(exam, req.user, pdfCount) });
  } catch (error) {
    console.error('updateExam:', error);
    res.status(500).json({ success: false, message: 'Could not update exam' });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await PdfExam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    const pdfCount = await PdfMaterial.countDocuments({ exam: exam._id });
    if (pdfCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Delete the PDFs in this exam first',
      });
    }
    await exam.deleteOne();
    await User.updateMany({ studyExams: exam._id }, { $pull: { studyExams: exam._id } });
    res.status(200).json({ success: true, message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not delete exam' });
  }
};

exports.createExamOrder = async (req, res) => {
  try {
    const exam = await PdfExam.findById(req.params.id);
    if (!exam || exam.status === 'draft') {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    if (!examSoldAsSet(exam)) {
      return res.status(400).json({ success: false, message: 'This exam is free. Buy individual PDFs if they are paid.' });
    }
    const user = await loadOwnedIds(req.user);
    if (ownsExam(user, exam._id)) {
      return res.status(400).json({ success: false, message: 'Already unlocked' });
    }

    const amount = Math.round(Number(exam.price) * 100);
    const order = await razorpay.instance.orders.create({
      amount,
      currency: 'INR',
      receipt: `exm${String(exam._id).slice(-8)}${Date.now()}`.slice(0, 40),
      payment_capture: 1,
      notes: {
        itemType: 'study-exam',
        userId: String(req.user.id),
        examId: String(exam._id),
      },
    });

    await PdfPurchase.create({
      user: req.user.id,
      exam: exam._id,
      razorpayOrderId: order.id,
      amount: Number(exam.price),
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('createExamOrder:', error);
    res.status(500).json({ success: false, message: 'Could not start payment' });
  }
};

exports.verifyExamOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const purchase = await PdfPurchase.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user.id,
      exam: req.params.id,
    });
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    purchase.status = 'paid';
    purchase.razorpayPaymentId = razorpay_payment_id;
    await purchase.save();
    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { studyExams: purchase.exam } }
    );

    res.status(200).json({ success: true, message: 'Exam unlocked' });
  } catch (error) {
    console.error('verifyExamOrder:', error);
    res.status(500).json({ success: false, message: 'Could not verify payment' });
  }
};
