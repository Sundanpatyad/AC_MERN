const instance = require('../config/rajorpay');
const crypto = require('crypto');
const mailSender = require('../utils/mailSender');
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail');
require('dotenv').config();

const User = require('../models/user');
const Course = require('../models/course');
const CourseProgress = require("../models/courseProgress")


function courseIdsFrom(itemId) {
    const raw = Array.isArray(itemId) ? itemId : String(itemId || '').split(',');
    return [...new Set(raw.map((id) => String(id || '').trim()).filter(Boolean))];
}

function isEnrolled(studentsEnrolled, userId) {
    const uid = String(userId);
    return (studentsEnrolled || []).some((id) => String(id?._id || id) === uid);
}

exports.capturePayment = async (req, res) => {
    const courseIds = courseIdsFrom(req.body.itemId);
    const userId = req.user.id;

    if (courseIds.length === 0) {
        return res.json({ success: false, message: "Please provide Course Id" });
    }

    let totalAmount = 0;

    try {
        const courses = await Course.find({ _id: { $in: courseIds } });
        if (courses.length !== courseIds.length) {
            return res.status(404).json({ success: false, message: "Could not find the course" });
        }

        if (courses.some((course) => isEnrolled(course.studentsEnrolled, userId))) {
            return res.status(400).json({ success: false, message: "Student is already Enrolled" });
        }

        totalAmount = courses.reduce((sum, course) => sum + (Number(course.price) || 0), 0);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

    const currency = "INR";
    const amountPaise = Math.round(Number(totalAmount) * 100);
    if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
        return res.status(400).json({ success: false, message: "Invalid course price" });
    }

    const options = {
        amount: amountPaise,
        currency,
        receipt: `course_${String(userId).slice(-8)}_${Date.now()}`.slice(0, 40),
        payment_capture: 1,
        notes: {
            userId: String(userId),
            courseId: courseIds.join(','),
            itemType: 'course',
        },
    }

    try {
        const paymentResponse = await instance.instance.orders.create(options);
        res.status(200).json({
            success: true,
            message: "Order created successfully",
            data: {
                orderId: paymentResponse.id,
                amount: paymentResponse.amount,
                currency: paymentResponse.currency || currency,
                key: process.env.RAZORPAY_KEY,
            },
        })
    } catch (error) {
        console.error('[Course Payment Capture] Error:', error.message);
        return res.status(500).json({ success: false, message: "Could not Initiate Order" });
    }
}

exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, itemId } = req.body;
    const userId = req.user.id;
    const courseIds = courseIdsFrom(itemId);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || courseIds.length === 0 || !userId) {
        return res.status(400).json({ success: false, message: "Payment Failed, data not found" });
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        try {
            for (const courseId of courseIds) {
                await exports.enrollStudent(courseId, userId);
            }
            return res.status(200).json({ success: true, message: "Payment Verified" });
        } catch (error) {
            console.error('[Course Payment Verify] Enroll error:', error.message);
            return res.status(500).json({ success: false, message: "Payment verified but enrollment failed. Contact support." });
        }
    }
    return res.status(400).json({ success: false, message: "Payment Failed" });
}

exports.enrollStudent = async (courseId, userId) => {
    const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $addToSet: { studentsEnrolled: userId } },
        { new: true },
    )

    if (!enrolledCourse) {
        throw new Error("Course not Found");
    }

    const alreadyHasProgress = await CourseProgress.findOne({ courseID: courseId, userId });
    const courseProgress = alreadyHasProgress || await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
    })

    await User.findByIdAndUpdate(
        userId,
        {
            $addToSet: {
                courses: courseId,
                courseProgress: courseProgress._id,
            },
        },
        { new: true }
    )

    try {
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Successfully Enrolled into ${enrolledCourse.courseName}`,
            courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
        )
    } catch (mailError) {
        console.error('[Course Enroll] Mail failed:', mailError.message);
    }
}

exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body;
    const userId = req.user.id;

    if (!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({ success: false, message: "Please provide all the fields" });
    }

    try {
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Received`,
            paymentSuccessEmail(`${enrolledStudent.firstName}`,
                amount / 100, orderId, paymentId)
        )
        res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        //console.log("error in sending mail", error)
        return res.status(500).json({ success: false, message: "Could not send email" })
    }
}


// ================ verify Signature ================
// exports.verifySignature = async (req, res) => {
//     const webhookSecret = '12345678';

//     const signature = req.headers['x-rajorpay-signature'];

//     const shasum = crypto.createHmac('sha256', webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest('hex');


//     if (signature === digest) {
//         //console.log('Payment is Authorized');

//         const { courseId, userId } = req.body.payload.payment.entity.notes;

//         try {
//             const enrolledCourse = await Course.findByIdAndUpdate({ _id: courseId },
//                 { $push: { studentsEnrolled: userId } },
//                 { new: true });

//             // wrong upper ?

//             if (!enrolledCourse) {
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Course not found'
//                 });
//             }

//             // add course id to user course list
//             const enrolledStudent = await User.findByIdAndUpdate(userId,
//                 { $push: { courses: courseId } },
//                 { new: true });

//             // send enrolled mail

//             // return response
//             res.status(200).json({
//                 success: true,
//                 message: 'Signature Verified and Course Added'
//             })
//         }

//         catch (error) {
//             //console.log('Error while verifing rajorpay signature');
//             //console.log(error);
//             return res.status(500).json({
//                 success: false,
//                 error: error.messsage,
//                 message: 'Error while verifing rajorpay signature'
//             });
//         }
//     }

//     else {
//         return res.status(400).json({
//             success: false,
//             message: 'Invalid signature'
//         });
//     }
// }