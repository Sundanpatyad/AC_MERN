import { toast } from "react-hot-toast";
import { MockTestPaymentEndpoints, studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

const { MOCK_TEST_PAYMENT_API, MOCK_TEST_VERIFY_API } = MockTestPaymentEndpoints;
const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints;

const toastOptions = {
    style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
    },
};

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
}

export async function buyItem(token, itemId, itemTypes, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Loading...", toastOptions);
    
    try {
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        
        if (!res) {
            toast.error("RazorPay SDK failed to load", toastOptions);
            return;
        }
        
        const orderResponses = [];
        
        for (const itemType of itemTypes) {
            const PAYMENT_API = itemType === 'course' ? COURSE_PAYMENT_API : MOCK_TEST_PAYMENT_API;
            
            const orderResponse = await apiConnector("POST", PAYMENT_API,
                { itemId },
                {
                    Authorization: `Bearer ${token}`,
                }
            );
            
            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.message);
            }
            
            orderResponses.push(orderResponse.data.message);
        }
        
        const RAZORPAY_KEY = import.meta.env.VITE_APP_RAZORPAY_KEY;
        
        const totalAmount = orderResponses.reduce((sum, order) => sum + order.amount, 0);
        
        const options = {
            key: RAZORPAY_KEY,
            currency: orderResponses[0].currency,
            amount: totalAmount,
            order_id: orderResponses.map(order => order.id).join(','),
            name: "Awakening Classes",
            description: `Thank You for Purchasing ${itemTypes.join(' and ')}`,
            image: rzpLogo,
            prefill: {
                name: userDetails.firstName,
                email: userDetails.email
            },
            handler: function (response) {
                localStorage.setItem('pendingPayment', JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    itemId,
                    itemTypes
                }));

                sendPaymentSuccessEmail(response, totalAmount, token);
                itemTypes.forEach((itemType, index) => {
                    verifyPayment({ ...response, itemId, itemType }, token, navigate, dispatch);
                });
            }
        };
        
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        paymentObject.on("payment.failed", function (response) {
            toast.error("Oops, payment failed", toastOptions);
            console.log("Payment failed: ", response.error);
        });

    }
    catch (error) {
        console.log("PAYMENT API ERROR:", error);
        toast.error(error.response?.data?.message || "Could not make Payment", toastOptions);
    }
    toast.dismiss(toastId);
}

async function sendPaymentSuccessEmail(response, amount, token) {
    try {
        await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount,
        }, {
            Authorization: `Bearer ${token}`
        });
    }
    catch (error) {
        console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
    }
}

export async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....", toastOptions);
    dispatch(setPaymentLoading(true));
    
    try {
        const VERIFY_API = bodyData.itemType === 'course' ? COURSE_VERIFY_API : MOCK_TEST_VERIFY_API;
        
        const response = await apiConnector("POST", VERIFY_API, bodyData, {
            Authorization: `Bearer ${token}`,
        });
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        const itemTypeName = bodyData.itemType === 'course' ? 'course' : 'mock test';
        toast.success(`Payment Successful, you are added to the ${itemTypeName}`, toastOptions);
        
        if (bodyData.itemType === 'course') {
            dispatch(resetCart());
        }

        localStorage.removeItem('pendingPayment');

        if (bodyData.itemType === 'course') {
            navigate("/dashboard/enrolled-courses");
        } else {
            navigate("/mocktest");
        }

        return response;
    } catch (error) {
        console.log("PAYMENT VERIFY ERROR....", error);
        toast.error("Could not verify Payment", toastOptions);
    } finally {
        toast.dismiss(toastId);
        dispatch(setPaymentLoading(false));
    }
}

export async function checkPendingPayment(token, navigate, dispatch) {
    const pendingPayment = localStorage.getItem('pendingPayment');
    if (pendingPayment) {
        const paymentData = JSON.parse(pendingPayment);
        const verificationPromises = paymentData.itemTypes.map(itemType => 
            verifyPayment({ ...paymentData, itemType }, token, navigate, dispatch)
        );
        
        try {
            await Promise.all(verificationPromises);
            return true; // All verifications completed successfully
        } catch (error) {
            console.error("Error verifying pending payments:", error);
            return false; // At least one verification failed
        }
    }
    return true; // No pending payment, consider it as success
}