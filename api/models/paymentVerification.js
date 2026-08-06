const mongoose = require('mongoose');

const paymentVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        index: true
    },
    razorpayPaymentId: {
        type: String,
        required: true,
        index: true
    },
    razorpaySignature: {
        type: String,
        required: false
    },
    webhookEventId: {
        type: String,
        unique: true,
        sparse: true  // For webhook idempotency
    },
    mockTestIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTestSeries',
        default: []
    }],
    amount: {
        type: Number,
        required: false
    },
    status: {
        type: String,
        required: true,
        enum: ['authorized', 'completed', 'failed', 'pending', 'refunded'],
        default: 'completed'
    },
    paymentMethod: {
        type: String,
        required: false
    },
    failureReason: {
        type: String,
        required: false
    },
    metadata: {
        type: Object,
        default: {}
    },
    refundId: {
        type: String,
        sparse: true
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    webhookProcessedAt: {
        type: Date,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const PaymentVerification = mongoose.model('PaymentVerification', paymentVerificationSchema);

module.exports = PaymentVerification;