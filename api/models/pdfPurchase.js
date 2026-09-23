const mongoose = require('mongoose');

const pdfPurchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pdf: { type: mongoose.Schema.Types.ObjectId, ref: 'PdfMaterial', required: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: '' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PdfPurchase', pdfPurchaseSchema);
