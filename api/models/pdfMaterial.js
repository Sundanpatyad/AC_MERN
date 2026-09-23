const mongoose = require('mongoose');

const pdfMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    category: { type: String, required: true, trim: true },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PdfExam',
    },
    access: { type: String, enum: ['free', 'paid'], default: 'free' },
    price: { type: Number, default: 0, min: 0 },
    cloudinaryPublicId: { type: String, required: true },
    cloudinaryType: { type: String, default: 'authenticated' },
    previewPublicId: { type: String, default: '' },
    previewType: { type: String, default: 'authenticated' },
    pageCount: { type: Number, default: 0 },
    mockTests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTestSeries',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

pdfMaterialSchema.index({ category: 1, createdAt: -1 });
pdfMaterialSchema.index({ exam: 1, title: 1 });
pdfMaterialSchema.index({ mockTests: 1 });

module.exports = mongoose.model('PdfMaterial', pdfMaterialSchema);
