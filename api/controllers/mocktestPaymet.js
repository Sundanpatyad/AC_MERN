const Order = require('../models/order');
const PaymentVerification = require('../models/paymentVerification');
const { MockTestSeries } = require('../models/mockTestSeries');
const crypto = require('crypto');
const { default: mongoose } = require('mongoose');
const User = require('../models/user');
const instance = require('../config/rajorpay');
const { enrollStudent } = require('./payments');

const TERMINAL_PAID = new Set(['paid', 'refunded']);

function generateIdempotencyKey(userId, itemIds) {
    const data = `${userId}-${[...itemIds].sort().join('-')}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

function verifyRazorpaySignature(orderId, paymentId, signature) {
    try {
        const text = `${orderId}|${paymentId}`;
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(text)
            .digest('hex');
        return generatedSignature === signature;
    } catch (error) {
        console.error('[Payment] Error verifying signature:', error.message);
        return false;
    }
}

function parseWebhookRequest(req) {
    const signature = req.headers['x-razorpay-signature'];
    let raw;
    let payload;

    if (Buffer.isBuffer(req.body)) {
        raw = req.body;
        payload = JSON.parse(req.body.toString('utf8'));
    } else if (typeof req.body === 'string') {
        raw = Buffer.from(req.body, 'utf8');
        payload = JSON.parse(req.body);
    } else {
        raw = Buffer.from(JSON.stringify(req.body || {}));
        payload = req.body || {};
    }

    return { raw, payload, signature };
}

function verifyWebhookSignature(rawBody, signature) {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret || !signature || !rawBody) return false;
        const digest = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');
        const a = Buffer.from(digest);
        const b = Buffer.from(String(signature));
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch (error) {
        console.error('[Webhook] Error verifying signature:', error.message);
        return false;
    }
}

async function enrollCourseFromNotes(notes) {
    const courseIds = String(notes?.courseId || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    const userId = notes?.userId;
    if (courseIds.length === 0 || !userId) return false;
    if (notes.itemType && notes.itemType !== 'course') return false;
    for (const courseId of courseIds) {
        await enrollStudent(courseId, userId);
    }
    console.log('[Payment] Course enrolled from Razorpay notes', { courseIds, userId });
    return true;
}

function frontendBaseUrl() {
    return String(process.env.FRONTEND_URL || 'https://awakeningclasses.in').replace(/\/$/, '');
}

function redirectToPaymentResult(res, status, orderId) {
    const params = new URLSearchParams({ status });
    if (orderId) params.set('orderId', orderId);
    return res.redirect(302, `${frontendBaseUrl()}/payment-result?${params.toString()}`);
}

function normalizeItemIds(itemId) {
    const raw = Array.isArray(itemId) ? itemId.flat(Infinity) : [itemId];
    return [...new Set(
        raw
            .map((id) => (id == null ? '' : String(id).trim()))
            .filter(Boolean)
    )];
}

function toObjectIdOrNull(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
    const oid = new mongoose.Types.ObjectId(String(id));
    return String(oid) === String(id) ? oid : null;
}

function isUserEnrolled(studentsEnrolled, userId) {
    const uid = String(userId);
    return (studentsEnrolled || []).some((enrolled) => String(enrolled?._id || enrolled) === uid);
}

function toPaise(amountRupees) {
    const paise = Math.round(Number(amountRupees) * 100);
    if (!Number.isInteger(paise) || paise <= 0) {
        throw new Error('Invalid amount: must be a positive integer in paise');
    }
    return paise;
}

async function enrollUserInMockTests(order, session) {
    const seriesIds = order.mockTestIds.map((id) => new mongoose.Types.ObjectId(id));
    const userId = new mongoose.Types.ObjectId(order.userId);

    await MockTestSeries.bulkWrite([
        {
            updateMany: {
                filter: {
                    _id: { $in: seriesIds },
                    studentsEnrolled: { $ne: userId }
                },
                update: {
                    $addToSet: { studentsEnrolled: userId }
                }
            }
        }
    ], { session });

    await User.findByIdAndUpdate(
        order.userId,
        { $addToSet: { mocktests: { $each: seriesIds } } },
        { session }
    );
}

async function fulfillPaidOrder({
    order,
    paymentId,
    signature,
    session,
    extra = {}
}) {
    if (order.status !== 'paid') {
        order.status = 'paid';
    }
    if (paymentId) {
        order.razorpayPaymentId = paymentId;
    }
    await order.save({ session });

    await enrollUserInMockTests(order, session);

    const paymentKey = paymentId || order.razorpayPaymentId || `order_${order.razorpayOrderId}`;

    const verificationDoc = {
        userId: order.userId,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: paymentKey,
        mockTestIds: order.mockTestIds,
        amount: extra.amount != null ? extra.amount : order.amount,
        status: 'completed',
        metadata: extra.metadata || { event: extra.event || 'fulfill' }
    };
    if (signature) verificationDoc.razorpaySignature = signature;
    if (extra.webhookEventId) {
        verificationDoc.webhookEventId = extra.webhookEventId;
        verificationDoc.webhookProcessedAt = new Date();
    }
    if (extra.paymentMethod) verificationDoc.paymentMethod = extra.paymentMethod;

    await PaymentVerification.findOneAndUpdate(
        { razorpayPaymentId: paymentKey },
        verificationDoc,
        { upsert: true, session, setDefaultsOnInsert: true }
    );
}

exports.captureMockTestPayment = async (req, res) => {
    const mockTestIds = normalizeItemIds(req.body?.itemId);
    const userId = req.user.id;
    const idempotencyKey = req.headers['idempotency-key'] || generateIdempotencyKey(userId, mockTestIds);

    console.log('[Payment Capture] User ID:', userId, 'Mock Test IDs:', mockTestIds);

    if (mockTestIds.length === 0) {
        return res.status(400).json({
            success: false,
            code: 'MISSING_ITEM_ID',
            message: "Please provide Mock Test Series Id"
        });
    }

    const objectIds = mockTestIds.map(toObjectIdOrNull);
    if (objectIds.some((id) => !id)) {
        return res.status(400).json({
            success: false,
            code: 'INVALID_ITEM_ID',
            message: "Invalid mock test series id"
        });
    }

    try {
        const seriesList = await MockTestSeries.find({ _id: { $in: objectIds } })
            .select('price studentsEnrolled status')
            .lean();

        if (seriesList.length !== mockTestIds.length) {
            return res.status(400).json({
                success: false,
                code: 'NOT_FOUND',
                message: "One or more mock tests were not found"
            });
        }

        if (seriesList.some((series) => isUserEnrolled(series.studentsEnrolled, userId))) {
            return res.status(400).json({
                success: false,
                code: 'ALREADY_ENROLLED',
                message: "You already have access to this mock test"
            });
        }

        const existingOrder = await Order.findOne({ idempotencyKey });
        if (existingOrder) {
            if (existingOrder.status === 'paid') {
                let restored = false;
                const session = await mongoose.startSession();
                try {
                    await session.startTransaction();
                    await fulfillPaidOrder({
                        order: existingOrder,
                        paymentId: existingOrder.razorpayPaymentId,
                        session,
                        extra: { event: 'repair_paid_unenrolled' }
                    });
                    await session.commitTransaction();
                    restored = true;
                } catch (repairError) {
                    try {
                        await session.abortTransaction();
                    } catch (_) { /* ignore */ }
                    console.error('[Payment Capture] Failed to restore paid access:', repairError.message);
                } finally {
                    session.endSession();
                }

                if (restored) {
                    return res.status(200).json({
                        success: true,
                        code: 'ALREADY_PAID',
                        message: "Payment already completed. Access has been unlocked.",
                        data: { alreadyPaid: true }
                    });
                }

                return res.status(500).json({
                    success: false,
                    message: "Payment was received earlier but access could not be unlocked. Contact support with your order ID."
                });
            }

            console.log('[Payment Capture] Reusing unpaid order:', existingOrder.razorpayOrderId, 'status:', existingOrder.status);
            return res.status(200).json({
                success: true,
                message: "Order already processed",
                data: {
                    orderId: existingOrder.razorpayOrderId,
                    amount: toPaise(existingOrder.amount),
                    currency: existingOrder.metadata?.currency || "INR",
                    key: process.env.RAZORPAY_KEY,
                }
            });
        }

        const totalAmount = seriesList.reduce((sum, series) => sum + (Number(series.price) || 0), 0);
        if (!(totalAmount > 0)) {
            return res.status(400).json({
                success: false,
                code: 'FREE_ITEM',
                message: "This mock test is free. Enroll without payment."
            });
        }

        const currency = "INR";
        const amountPaise = toPaise(totalAmount);

        const options = {
            amount: amountPaise,
            currency,
            receipt: `receipt_${String(userId).slice(-8)}_${Date.now()}`.slice(0, 40),
            payment_capture: 1,
            notes: {
                userId: userId.toString(),
                mockTestIds: mockTestIds.join(','),
                itemCount: String(mockTestIds.length)
            }
        };

        const paymentResponse = await instance.instance.orders.create(options);
        console.log('[Payment Capture] Razorpay Order Created:', paymentResponse.id, 'amount:', paymentResponse.amount);

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

        console.log('[Payment Capture] Order saved:', order._id);

        res.status(200).json({
            success: true,
            message: "Order created successfully",
            data: {
                orderId: paymentResponse.id,
                amount: paymentResponse.amount,
                currency: paymentResponse.currency || currency,
                key: process.env.RAZORPAY_KEY,
            }
        });

    } catch (error) {
        if (error?.code === 11000) {
            const raced = await Order.findOne({
                idempotencyKey: req.headers['idempotency-key'] || generateIdempotencyKey(userId, mockTestIds)
            });
            if (raced) {
                return res.status(200).json({
                    success: true,
                    message: "Order already processed",
                    data: {
                        orderId: raced.razorpayOrderId,
                        amount: toPaise(raced.amount),
                        currency: raced.metadata?.currency || "INR",
                        key: process.env.RAZORPAY_KEY,
                    }
                });
            }
        }
        console.error('[Payment Capture] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: "Could not initiate order"
        });
    }
};

exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    console.log('[Payment Verify] Order ID:', razorpay_order_id, 'Payment ID:', razorpay_payment_id);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
            success: false,
            message: "Missing required payment parameters"
        });
    }

    const session = await mongoose.startSession();

    try {
        await session.startTransaction();

        const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValid) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id }).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (String(order.userId) !== String(req.user.id)) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: "Order does not belong to this user"
            });
        }

        const existingCompleted = await PaymentVerification.findOne({
            razorpayOrderId: razorpay_order_id,
            status: 'completed'
        }).session(session);

        if (existingCompleted || order.status === 'paid') {
            if (order.status !== 'paid') {
                await fulfillPaidOrder({
                    order,
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature,
                    session,
                    extra: { event: 'verify_repeat' }
                });
            }
            await session.commitTransaction();
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                data: {
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    mockTestsEnrolled: order.mockTestIds.length
                }
            });
        }

        await fulfillPaidOrder({
            order,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            session,
            extra: { event: 'frontend_verify' }
        });

        await session.commitTransaction();

        console.log('[Payment Verify] Payment verified successfully:', razorpay_order_id);

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
        console.error('[Payment Verify] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed"
        });
    } finally {
        session.endSession();
    }
};

exports.handleRazorpayCallback = async (req, res) => {
    const source = { ...req.body, ...req.query };
    const razorpay_order_id = source.razorpay_order_id;
    const razorpay_payment_id = source.razorpay_payment_id;
    const razorpay_signature = source.razorpay_signature;

    console.log('[Payment Callback] Order ID:', razorpay_order_id, 'Payment ID:', razorpay_payment_id);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return redirectToPaymentResult(res, 'failed', razorpay_order_id);
    }

    if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
        console.error('[Payment Callback] Invalid signature');
        return redirectToPaymentResult(res, 'failed', razorpay_order_id);
    }

    const session = await mongoose.startSession();
    try {
        await session.startTransaction();
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id }).session(session);
        if (!order) {
            await session.abortTransaction();
            try {
                const rzpOrder = await instance.instance.orders.fetch(razorpay_order_id);
                const enrolled = await enrollCourseFromNotes(rzpOrder?.notes);
                return redirectToPaymentResult(res, enrolled ? 'success' : 'failed', razorpay_order_id);
            } catch (fallbackError) {
                console.error('[Payment Callback] No mock order and course fallback failed:', fallbackError.message);
                return redirectToPaymentResult(res, 'failed', razorpay_order_id);
            }
        }

        const alreadyDone = await PaymentVerification.findOne({
            razorpayOrderId: razorpay_order_id,
            status: 'completed'
        }).session(session);

        if (!alreadyDone || order.status !== 'paid') {
            await fulfillPaidOrder({
                order,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                session,
                extra: { event: 'callback' }
            });
        }

        await session.commitTransaction();
        return redirectToPaymentResult(res, 'success', razorpay_order_id);
    } catch (error) {
        try {
            await session.abortTransaction();
        } catch (_) { /* ignore */ }
        console.error('[Payment Callback] Error:', error.message);
        return redirectToPaymentResult(res, 'pending', razorpay_order_id);
    } finally {
        session.endSession();
    }
};

exports.handleRazorpayWebhook = async (req, res) => {
    const MAX_RETRIES = 3;
    const INITIAL_DELAY = 1000;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let parsed;
    try {
        parsed = parseWebhookRequest(req);
    } catch (error) {
        console.error('[Webhook] Could not parse body:', error.message);
        return res.status(400).json({ success: false, message: 'Invalid webhook body' });
    }

    if (!verifyWebhookSignature(parsed.raw, parsed.signature)) {
        console.error('[Webhook] Invalid webhook signature');
        return res.status(400).json({
            success: false,
            message: 'Invalid webhook signature'
        });
    }

    const { event, payload } = parsed.payload;
    const eventId = req.headers['x-razorpay-event-id']
        || parsed.payload.event_id
        || `${event}_${payload?.payment?.entity?.id || payload?.order?.entity?.id || Date.now()}`;

    console.log('[Webhook] Event:', event, 'Event ID:', eventId);

    async function processWebhookWithRetry(attempt = 1) {
        const session = await mongoose.startSession();
        let transactionStarted = false;

        try {
            const existingWebhook = await PaymentVerification.findOne({ webhookEventId: eventId });
            if (existingWebhook) {
                console.log('[Webhook] Event already processed:', eventId);
                return res.status(200).json({
                    success: true,
                    message: 'Webhook already processed'
                });
            }

            await session.startTransaction();
            transactionStarted = true;

            switch (event) {
                case 'payment.authorized': {
                    const paymentEntity = payload.payment.entity;
                    console.log('[Webhook] Payment Authorized:', paymentEntity.id, 'method:', paymentEntity.method);

                    const order = await Order.findOne({
                        razorpayOrderId: paymentEntity.order_id
                    }).session(session);

                    if (!order) {
                        console.warn('[Webhook] Order not found for authorized payment', paymentEntity.order_id);
                        break;
                    }

                    if (!TERMINAL_PAID.has(order.status)) {
                        order.status = 'authorized';
                        order.razorpayPaymentId = paymentEntity.id;
                        await order.save({ session });
                    }

                    await PaymentVerification.findOneAndUpdate(
                        { razorpayPaymentId: paymentEntity.id },
                        {
                            userId: order.userId,
                            razorpayOrderId: paymentEntity.order_id,
                            razorpayPaymentId: paymentEntity.id,
                            webhookEventId: eventId,
                            mockTestIds: order.mockTestIds,
                            amount: paymentEntity.amount / 100,
                            status: order.status === 'paid' ? 'completed' : 'authorized',
                            paymentMethod: paymentEntity.method,
                            webhookProcessedAt: new Date(),
                            metadata: {
                                event: 'payment.authorized',
                                email: paymentEntity.email,
                                contact: paymentEntity.contact
                            }
                        },
                        { upsert: true, session }
                    );
                    break;
                }

                case 'payment.captured': {
                    const paymentEntity = payload.payment.entity;
                    console.log('[Webhook] Payment Captured:', paymentEntity.id, 'method:', paymentEntity.method, 'order:', paymentEntity.order_id);

                    const order = await Order.findOne({
                        razorpayOrderId: paymentEntity.order_id
                    }).session(session);

                    if (!order) {
                        try {
                            const enrolled = await enrollCourseFromNotes(paymentEntity.notes);
                            if (!enrolled) {
                                console.warn('[Webhook] Order not found for captured payment', paymentEntity.order_id);
                            }
                        } catch (courseError) {
                            console.error('[Webhook] Course enroll from notes failed:', courseError.message);
                            throw courseError;
                        }
                        break;
                    }

                    const existingVerification = await PaymentVerification.findOne({
                        razorpayOrderId: paymentEntity.order_id,
                        status: 'completed'
                    }).session(session);

                    if (existingVerification && order.status === 'paid') {
                        await session.commitTransaction();
                        return res.status(200).json({
                            success: true,
                            message: 'Payment already processed'
                        });
                    }

                    await fulfillPaidOrder({
                        order,
                        paymentId: paymentEntity.id,
                        session,
                        extra: {
                            webhookEventId: eventId,
                            amount: paymentEntity.amount / 100,
                            paymentMethod: paymentEntity.method,
                            event: 'payment.captured',
                            metadata: {
                                event: 'payment.captured',
                                email: paymentEntity.email,
                                contact: paymentEntity.contact
                            }
                        }
                    });
                    break;
                }

                case 'payment.failed': {
                    const paymentEntity = payload.payment.entity;
                    console.log(
                        '[Webhook] Payment Failed:',
                        paymentEntity.id,
                        'method:', paymentEntity.method,
                        'code:', paymentEntity.error_code,
                        'reason:', paymentEntity.error_reason,
                        'desc:', paymentEntity.error_description,
                        'source:', paymentEntity.error_source,
                        'step:', paymentEntity.error_step
                    );

                    const order = await Order.findOne({
                        razorpayOrderId: paymentEntity.order_id
                    }).session(session);

                    if (order && order.status === 'paid') {
                        console.log('[Webhook] Ignoring failed event for already-paid order', order.razorpayOrderId);
                        break;
                    }

                    if (order && !TERMINAL_PAID.has(order.status)) {
                        order.status = 'failed';
                        order.razorpayPaymentId = paymentEntity.id;
                        await order.save({ session });
                    }

                    if (!order) {
                        console.warn('[Webhook] Failed payment has no matching order', paymentEntity.order_id);
                        break;
                    }

                    await PaymentVerification.findOneAndUpdate(
                        { razorpayPaymentId: paymentEntity.id },
                        {
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
                                errorStep: paymentEntity.error_step,
                                errorReason: paymentEntity.error_reason
                            }
                        },
                        { upsert: true, session }
                    );
                    break;
                }

                case 'order.paid': {
                    const orderEntity = payload.order.entity;
                    console.log('[Webhook] Order Paid:', orderEntity.id);

                    const order = await Order.findOne({
                        razorpayOrderId: orderEntity.id
                    }).session(session);

                    if (!order) {
                        try {
                            await enrollCourseFromNotes(orderEntity.notes);
                        } catch (courseError) {
                            console.error('[Webhook] Course enroll on order.paid failed:', courseError.message);
                        }
                    } else if (order.status !== 'paid') {
                        await fulfillPaidOrder({
                            order,
                            paymentId: order.razorpayPaymentId || `order_paid_${orderEntity.id}`,
                            session,
                            extra: {
                                webhookEventId: eventId,
                                amount: orderEntity.amount_paid ? orderEntity.amount_paid / 100 : order.amount,
                                event: 'order.paid',
                                metadata: { event: 'order.paid' }
                            }
                        });
                    }
                    break;
                }

                case 'payment.pending': {
                    const paymentEntity = payload.payment.entity;
                    console.log('[Webhook] Payment Pending:', paymentEntity.id, 'method:', paymentEntity.method);

                    const order = await Order.findOne({
                        razorpayOrderId: paymentEntity.order_id
                    }).session(session);

                    if (order && order.status === 'paid') {
                        break;
                    }

                    if (!order) {
                        console.warn('[Webhook] Pending payment has no matching order', paymentEntity.order_id);
                        break;
                    }

                    if (order) {
                        order.status = 'pending';
                        order.razorpayPaymentId = paymentEntity.id;
                        await order.save({ session });
                    }

                    await PaymentVerification.findOneAndUpdate(
                        { razorpayPaymentId: paymentEntity.id },
                        {
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
                        },
                        { upsert: true, session }
                    );
                    break;
                }

                case 'refund.created':
                case 'refund.processed': {
                    const refundEntity = payload.refund.entity;
                    console.log('[Webhook] Refund Event:', event, refundEntity.id);

                    const paymentId = refundEntity.payment_id;
                    const order = await Order.findOne({
                        razorpayPaymentId: paymentId
                    }).session(session);

                    if (order) {
                        order.status = 'refunded';
                        order.refundId = refundEntity.id;
                        order.refundAmount = refundEntity.amount / 100;
                        await order.save({ session });
                    }

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
                    console.error('[Webhook] Error aborting transaction:', abortError.message);
                }
            }

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
        console.error('[Webhook] Processing error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error processing webhook'
        });
    }
};

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

        if (String(order.userId) !== String(req.user.id) && req.user.accountType !== 'Admin') {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const verification = await PaymentVerification.findOne({
            razorpayOrderId: orderId,
            status: 'completed'
        }).lean() || await PaymentVerification.findOne({ razorpayOrderId: orderId })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: {
                orderId: order.razorpayOrderId,
                status: order.status,
                amount: order.amount,
                paymentId: order.razorpayPaymentId,
                paymentMethod: verification?.paymentMethod,
                failureReason: verification?.failureReason,
                mockTestsEnrolled: order.status === 'paid' ? order.mockTestIds.length : 0,
            }
        });

    } catch (error) {
        console.error('[Payment Status] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error fetching payment status'
        });
    }
};
