const Order = require('../models/order');
const PaymentVerification = require('../models/paymentVerification');
const { MockTestSeries } = require('../models/mockTestSeries');
const crypto = require('crypto');
const { default: mongoose } = require('mongoose');
const User = require('../models/user');
const instance = require('../config/rajorpay');

// Helper function to generate idempotency key
function generateIdempotencyKey(userId, itemIds) {
    const data = `${userId}-${itemIds.sort().join('-')}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Helper function to verify Razorpay signature
function verifyRazorpaySignature(orderId, paymentId, signature) {
    try {
        const text = `${orderId}|${paymentId}`;
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');
        return generatedSignature === signature;
    } catch (error) {
        console.error('Error verifying signature:', error);
        return false;
    }
}

// Helper function to verify webhook signature
function verifyWebhookSignature(body, signature) {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(JSON.stringify(body));
        const digest = shasum.digest('hex');
        return signature === digest;
    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        return false;
    }
}

// Capture the payment and Initiate the 'Razorpay order' for mock tests
exports.captureMockTestPayment = async (req, res) => {
    const { itemId } = req.body;
    const mockTestIds = Array.isArray(itemId) ? itemId : [itemId];
    const userId = req.user.id;
    const idempotencyKey = req.headers['idempotency-key'] || generateIdempotencyKey(userId, mockTestIds);

    console.log('[Payment Capture] User ID:', userId);
    console.log('[Payment Capture] Mock Test IDs:', mockTestIds);

    if (mockTestIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide Mock Test Series Id"
        });
    }

    try {
        // Check if this operation was already processed
        const existingOrder = await Order.findOne({ idempotencyKey });
        if (existingOrder) {
            console.log('[Payment Capture] Order already exists:', existingOrder.razorpayOrderId);
            return res.status(200).json({
                success: true,
                message: "Order already processed",
                order: existingOrder
            });
        }

        // Validate mock tests and calculate total amount
        const result = await MockTestSeries.aggregate([
            {
                $match: {
                    _id: { $in: mockTestIds.map(id => new mongoose.Types.ObjectId(id)) },
                    studentsEnrolled: { $ne: new mongoose.Types.ObjectId(userId) }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$price" },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (result.length === 0 || result[0].count !== mockTestIds.length) {
            return res.status(400).json({
                success: false,
                message: "One or more mock tests are unavailable or already purchased"
            });
        }

        const totalAmount = result[0].totalAmount;
        const currency = "INR";

        // Create Razorpay order with metadata
        const options = {
            amount: totalAmount * 100, // Amount in paise
            currency,
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: userId.toString(),
                mockTestIds: mockTestIds.join(','),
                itemCount: mockTestIds.length
            }
        };

        const paymentResponse = await instance.instance.orders.create(options);
        console.log('[Payment Capture] Razorpay Order Created:', paymentResponse.id);

        // Save the order with the idempotency key
        const order = await Order.create({
            userId,
            mockTestIds,
            amount: totalAmount,
            razorpayOrderId: paymentResponse.id,
            idempotencyKey,
            metadata: {
                mockTestCount: mockTestIds.length,
                currency
            }
        });

        console.log('[Payment Capture] Order saved to database:', order._id);

        res.status(200).json({
            success: true,
            message: "Order created successfully",
            data: {
                orderId: paymentResponse.id,
                amount: totalAmount,
                currency,
                key: process.env.RAZORPAY_KEY_ID
            }
        });

    } catch (error) {
        console.error('[Payment Capture] Error:', error);
        return res.status(500).json({
            success: false,
            message: "Could not initiate order",
            error: error.message
        });
    }
};

// Manual payment verification endpoint (for frontend verification)
exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    console.log('[Payment Verify] Order ID:', razorpay_order_id);
    console.log('[Payment Verify] Payment ID:', razorpay_payment_id);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
            success: false,
            message: "Missing required payment parameters"
        });
    }

    const session = await mongoose.startSession();

    try {
        await session.startTransaction();

        // Verify signature
        const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (!isValid) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // Find the order
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id }).session(session);

        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if already verified
        const existingVerification = await PaymentVerification.findOne({
            razorpayOrderId: razorpay_order_id
        }).session(session);

        if (existingVerification) {
            await session.commitTransaction();
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                data: existingVerification
            });
        }

        // Update order status
        order.status = 'paid';
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save({ session });

        // Enroll user in mock tests
        await MockTestSeries.bulkWrite([
            {
                updateMany: {
                    filter: {
                        _id: { $in: order.mockTestIds.map(id => new mongoose.Types.ObjectId(id)) },
                        studentsEnrolled: { $ne: new mongoose.Types.ObjectId(order.userId) }
                    },
                    update: {
                        $addToSet: { studentsEnrolled: new mongoose.Types.ObjectId(order.userId) }
                    }
                }
            }
        ], { session });

        // Update user's mock tests
        await User.findByIdAndUpdate(
            order.userId,
            {
                $addToSet: {
                    mocktests: { $each: order.mockTestIds.map(id => new mongoose.Types.ObjectId(id)) }
                }
            },
            { session }
        );

        // Create payment verification record
        const verification = await PaymentVerification.create([{
            userId: order.userId,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            mockTestIds: order.mockTestIds,
            amount: order.amount,
            status: 'completed'
        }], { session });

        await session.commitTransaction();

        console.log('[Payment Verify] Payment verified successfully:', verification[0]._id);

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                mockTestsEnrolled: order.mockTestIds.length
            }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('[Payment Verify] Error:', error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

// Comprehensive Razorpay webhook handler
exports.handleRazorpayWebhook = async (req, res) => {
    const MAX_RETRIES = 3;
    const INITIAL_DELAY = 1000;

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function processWebhookWithRetry(attempt = 1) {
        const session = await mongoose.startSession();
        let transactionStarted = false;

        try {
            // Verify webhook signature
            const signature = req.headers['x-razorpay-signature'];

            if (!verifyWebhookSignature(req.body, signature)) {
                console.error('[Webhook] Invalid webhook signature');
                return res.status(400).json({
                    success: false,
                    message: 'Invalid webhook signature'
                });
            }

            const { event, payload } = req.body;
            const eventId = req.body.event_id || `${event}_${Date.now()}`;

            console.log('[Webhook] Event:', event);
            console.log('[Webhook] Event ID:', eventId);

            // Check if webhook already processed (idempotency)
            const existingWebhook = await PaymentVerification.findOne({ webhookEventId: eventId });
            if (existingWebhook) {
                console.log('[Webhook] Event already processed:', eventId);
                return res.status(200).json({
                    success: true,
                    message: 'Webhook already processed'
                });
            }

            // Start transaction
            await session.startTransaction();
            transactionStarted = true;

            switch (event) {
                case 'payment.authorized': {
                    const paymentEntity = payload.payment.entity;
                    console.log('[Webhook] Payment Authorized:', paymentEntity.id);

                    const order = await Order.findOne({
                        razorpayOrderId: paymentEntity.order_id
                    }).session(session);

                    if (!order) {
                        throw new Error('Order not found for authorized payment');
                    }

                    // Update order status
                    order.status = 'authorized';
                    order.razorpayPaymentId = paymentEntity.id;
                    await order.save({ session });

                    // Create verification record
                    await PaymentVerification.create([{
                        userId: order.userId,
                        razorpayOrderId: paymentEntity.order_id,
                        razorpayPaymentId: paymentEntity.id,
                        webhookEventId: eventId,
                        mockTestIds: order.mockTestIds,
                        amount: paymentEntity.amount / 100,
                        status: 'authorized',
                        paymentMethod: paymentEntity.method,
                        webhookProcessedAt: new Date(),
                        metadata: {
                            event: 'payment.authorized',
                            email: paymentEntity.email,
                            contact: paymentEntity.contact
                        }
                    }], { session });

                    console.log('[Webhook] Payment authorized and recorded');
                    break;
                }

                case 'payment.captured': {
                    const paymentEntity = payload.payment.entity;
                    console.log('[Webhook] Payment Captured:', paymentEntity.id);

                    const order = await Order.findOne({
                        razorpayOrderId: paymentEntity.order_id
                    }).session(session);

                    if (!order) {
                        throw new Error('Order not found for captured payment');
                    }

                    // Check for existing verification
                    const existingVerification = await PaymentVerification.findOne({
                        razorpayOrderId: paymentEntity.order_id,
                        status: 'completed'
                    }).session(session);

                    if (existingVerification) {
                        await session.commitTransaction();
                        return res.status(200).json({
                            success: true,
                            message: 'Payment already processed'
                        });
                    }

                    // Update order status
                    order.status = 'paid';
                    order.razorpayPaymentId = paymentEntity.id;
                    await order.save({ session });

                    // Enroll user in mock tests
                    await MockTestSeries.bulkWrite([
                        {
                            updateMany: {
                                filter: {
                                    _id: { $in: order.mockTestIds.map(id => new mongoose.Types.ObjectId(id)) },
                                    studentsEnrolled: { $ne: new mongoose.Types.ObjectId(order.userId) }
                                },
                                update: {
                                    $addToSet: { studentsEnrolled: new mongoose.Types.ObjectId(order.userId) }
                                }
                            }
                        }
                    ], { session });

                    // Update user's mock tests
                    await User.bulkWrite([
                        {
                            updateOne: {
                                filter: { _id: new mongoose.Types.ObjectId(order.userId) },
                                update: {
                                    $addToSet: {
                                        mocktests: { $each: order.mockTestIds.map(id => new mongoose.Types.ObjectId(id)) }
                                    }
                                }
                            }
                        }
                    ], { session });

                    // Create or update payment verification record
                    await PaymentVerification.findOneAndUpdate(
                        { razorpayPaymentId: paymentEntity.id },
                        {
                            userId: order.userId,
                            razorpayOrderId: paymentEntity.order_id,
                            razorpayPaymentId: paymentEntity.id,
                            webhookEventId: eventId,
                            mockTestIds: order.mockTestIds,
                            amount: paymentEntity.amount / 100,
                            status: 'completed',
                            paymentMethod: paymentEntity.method,
                            webhookProcessedAt: new Date(),
                            metadata: {
                                event: 'payment.captured',
                                email: paymentEntity.email,
                                contact: paymentEntity.contact
                            }
                        },
                        { upsert: true, session }
                    );

                    console.log('[Webhook] Payment captured and user enrolled');
                    break;
                }

                case 'payment.failed': {
                    const paymentEntity = payload.payment.entity;
                    console.log('[Webhook] Payment Failed:', paymentEntity.id);

                    const order = await Order.findOne({
                        razorpayOrderId: paymentEntity.order_id
                    }).session(session);

                    if (order) {
                        order.status = 'failed';
                        order.razorpayPaymentId = paymentEntity.id;
                        await order.save({ session });
                    }

                    // Create verification record for failed payment
                    await PaymentVerification.create([{
                        userId: order ? order.userId : paymentEntity.notes?.userId,
                        razorpayOrderId: paymentEntity.order_id,
                        razorpayPaymentId: paymentEntity.id,
                        webhookEventId: eventId,
                        mockTestIds: order ? order.mockTestIds : [],
                        amount: paymentEntity.amount / 100,
                        status: 'failed',
                        paymentMethod: paymentEntity.method,
                        failureReason: paymentEntity.error_description || paymentEntity.error_reason,
                        webhookProcessedAt: new Date(),
                        metadata: {
                            event: 'payment.failed',
                            errorCode: paymentEntity.error_code,
                            errorSource: paymentEntity.error_source,
                            errorStep: paymentEntity.error_step
                        }
                    }], { session });

                    console.log('[Webhook] Failed payment recorded');
                    break;
                }

                case 'order.paid': {
                    const orderEntity = payload.order.entity;
                    console.log('[Webhook] Order Paid:', orderEntity.id);

                    const order = await Order.findOne({
                        razorpayOrderId: orderEntity.id
                    }).session(session);

                    if (order && order.status !== 'paid') {
                        order.status = 'paid';
                        await order.save({ session });
                        console.log('[Webhook] Order status updated to paid');
                    }

                    break;
                }

                case 'payment.pending': {
                    const paymentEntity = payload.payment.entity;
                    console.log('[Webhook] Payment Pending:', paymentEntity.id);

                    const order = await Order.findOne({
                        razorpayOrderId: paymentEntity.order_id
                    }).session(session);

                    if (order) {
                        order.status = 'pending';
                        order.razorpayPaymentId = paymentEntity.id;
                        await order.save({ session });
                    }

                    // Create verification record for pending payment
                    await PaymentVerification.create([{
                        userId: order ? order.userId : paymentEntity.notes?.userId,
                        razorpayOrderId: paymentEntity.order_id,
                        razorpayPaymentId: paymentEntity.id,
                        webhookEventId: eventId,
                        mockTestIds: order ? order.mockTestIds : [],
                        amount: paymentEntity.amount / 100,
                        status: 'pending',
                        paymentMethod: paymentEntity.method,
                        webhookProcessedAt: new Date(),
                        metadata: {
                            event: 'payment.pending',
                            email: paymentEntity.email,
                            contact: paymentEntity.contact
                        }
                    }], { session });

                    console.log('[Webhook] Pending payment recorded');
                    break;
                }

                case 'refund.created':
                case 'refund.processed': {
                    const refundEntity = payload.refund.entity;
                    console.log('[Webhook] Refund Event:', event, refundEntity.id);

                    const paymentId = refundEntity.payment_id;

                    // Find the order by payment ID
                    const order = await Order.findOne({
                        razorpayPaymentId: paymentId
                    }).session(session);

                    if (order) {
                        order.status = 'refunded';
                        order.refundId = refundEntity.id;
                        order.refundAmount = refundEntity.amount / 100;
                        await order.save({ session });
                    }

                    // Update payment verification
                    await PaymentVerification.findOneAndUpdate(
                        { razorpayPaymentId: paymentId },
                        {
                            status: 'refunded',
                            refundId: refundEntity.id,
                            refundAmount: refundEntity.amount / 100,
                            webhookEventId: eventId,
                            webhookProcessedAt: new Date(),
                            metadata: {
                                event,
                                refundStatus: refundEntity.status,
                                refundSpeed: refundEntity.speed_processed
                            }
                        },
                        { session }
                    );

                    console.log('[Webhook] Refund processed and recorded');
                    break;
                }

                default:
                    console.log('[Webhook] Unhandled event type:', event);
            }

            await session.commitTransaction();
            return res.status(200).json({
                success: true,
                message: 'Webhook processed successfully'
            });

        } catch (error) {
            if (transactionStarted) {
                try {
                    await session.abortTransaction();
                } catch (abortError) {
                    console.error('[Webhook] Error aborting transaction:', abortError);
                }
            }

            // Retry on transient errors
            if (
                error.code === 112 &&
                error.errorLabels?.includes('TransientTransactionError') &&
                attempt < MAX_RETRIES
            ) {
                console.log(`[Webhook] Retry attempt ${attempt} after write conflict`);
                await sleep(INITIAL_DELAY * Math.pow(2, attempt - 1));
                return processWebhookWithRetry(attempt + 1);
            }

            throw error;
        } finally {
            session.endSession();
        }
    }

    try {
        return await processWebhookWithRetry();
    } catch (error) {
        console.error('[Webhook] Processing error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing webhook',
            error: error.message
        });
    }
};

// Get payment status by order ID
exports.getPaymentStatus = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findOne({ razorpayOrderId: orderId })
            .populate('mockTestIds', 'seriesName price')
            .lean();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const verification = await PaymentVerification.findOne({
            razorpayOrderId: orderId
        }).lean();

        res.status(200).json({
            success: true,
            data: {
                order,
                verification,
                status: order.status
            }
        });

    } catch (error) {
        console.error('[Payment Status] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching payment status',
            error: error.message
        });
    }
};