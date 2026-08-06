const express = require('express');
const router = express.Router();

const { capturePayment, verifyPayment } = require('../controllers/payments');
const { auth, isAdmin, isInstructor, isStudent } = require('../middleware/auth');
const {
    captureMockTestPayment,
    handleRazorpayWebhook,
    verifyPayment: verifyMockPayment,
    getPaymentStatus
} = require('../controllers/mocktestPaymet');
const mockTestPurchasersController = require('../controllers/paymentList');


// Course payment routes
router.post('/capturePayment', auth, isStudent, capturePayment);

// Mock test payment routes
router.post('/captureMockPayment', auth, isStudent, captureMockTestPayment);
router.post('/verifyMockPayment', auth, isStudent, verifyMockPayment);
router.get('/paymentStatus/:orderId', auth, getPaymentStatus);

// Webhook route (no auth required - verified by signature)
router.post('/webhook', handleRazorpayWebhook);

// Admin routes
router.get('/listPayment', auth, mockTestPurchasersController.listPurchasers);


module.exports = router;

