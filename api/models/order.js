const mongoose = require('mongoose');

// Order Schema
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mockTestIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTestSeries',
        required: true
    }],
    amount: {
        type: Number,
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayPaymentId: {
        type: String,
        sparse: true  // Allows null values while maintaining uniqueness for non-null values
    },
    idempotencyKey: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['created', 'authorized', 'paid', 'failed', 'pending', 'refunded'],
        default: 'created'
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;