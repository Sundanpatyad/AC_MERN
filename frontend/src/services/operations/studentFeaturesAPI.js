import { toast } from "react-hot-toast";
import { MockTestPaymentEndpoints, studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png";
import { resetCart } from "../../slices/cartSlice";

const { MOCK_TEST_PAYMENT_API } = MockTestPaymentEndpoints;
const { COURSE_PAYMENT_API } = studentEndpoints;

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
        // Load Razorpay SDK
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        console.log("Razorpay SDK loaded:", res);

        if (!res) {
            toast.error("RazorPay SDK failed to load. Please check your internet connection.", toastOptions);
            return;
        }

        // Check if Razorpay is available
        if (!window.Razorpay) {
            toast.error("Razorpay is not available. Please refresh the page.", toastOptions);
            return;
        }

        for (const itemType of itemTypes) {
            const PAYMENT_API = itemType === 'course' ? COURSE_PAYMENT_API : MOCK_TEST_PAYMENT_API;
            console.log("Payment API:", PAYMENT_API);
            console.log("Item Type:", itemType);
            console.log("Item ID:", itemId);

            // Create order
            const orderResponse = await apiConnector("POST", PAYMENT_API,
                { itemId },
                {
                    Authorization: `Bearer ${token}`,
                }
            );

            console.log("Order Response:", orderResponse);

            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.message || "Failed to create order");
            }

            // CRITICAL FIX: The order data is in orderResponse.data.data, not orderResponse.data.message
            const orderData = orderResponse.data.data;
            console.log("Order Data:", orderData);

            if (!orderData) {
                throw new Error("Order data is missing from the response");
            }

            // Prefer the key returned with the order so checkout always matches
            // the account that created the order (avoids live/test key mismatch).
            const RAZORPAY_KEY =
                orderData.key ||
                import.meta.env.VITE_APP_RAZORPAY_KEY;

            if (!RAZORPAY_KEY) {
                toast.error("Razorpay key is not configured. Please contact support.", toastOptions);
                return;
            }

            // Validate required order data fields
            if (!orderData.orderId && !orderData.id) {
                throw new Error("Order ID is missing from the response");
            }

            const orderId = orderData.orderId || orderData.id;
            // Razorpay expects amount in paise; backend returns paymentResponse.amount.
            const amountInPaise = Number(orderData.amount);

            if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
                throw new Error("Invalid payment amount from server");
            }

            const options = {
                key: RAZORPAY_KEY,
                currency: orderData.currency || "INR",
                amount: amountInPaise,
                order_id: orderId,
                name: "Awakening Classes",
                description: `Thank You for Purchasing the ${itemType}`,
                image: rzpLogo,
                prefill: {
                    name: userDetails.firstName || userDetails.name,
                    email: userDetails.email
                },
                handler: async function (response) {
                    console.log("Payment Success Response:", response);
                    try {
                        if (itemType !== 'course') {
                            await apiConnector(
                                "POST",
                                MockTestPaymentEndpoints.MOCK_TEST_VERIFY_API,
                                {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                },
                                { Authorization: `Bearer ${token}` }
                            );
                        }
                        const itemTypeName = itemType === 'course' ? 'course' : 'mock test';
                        toast.success(`Payment Successful, you are added to the ${itemTypeName}`, toastOptions);

                        if (itemType === 'course') {
                            dispatch(resetCart());
                        }

                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } catch (verifyError) {
                        console.error("Payment verify failed:", verifyError);
                        toast.error(
                            verifyError.response?.data?.message ||
                            "Payment received but verification failed. Contact support if access is missing.",
                            toastOptions
                        );
                    }
                },
                modal: {
                    ondismiss: function () {
                        console.log("Payment modal closed");
                        toast.error("Payment cancelled", toastOptions);
                    }
                }
            };

            console.log("Razorpay Options:", { ...options, key: "***HIDDEN***" });

            // Create and open Razorpay payment modal
            const paymentObject = new window.Razorpay(options);

            paymentObject.on("payment.failed", function (response) {
                console.error("Payment Failed:", response);
                toast.error(`Payment failed: ${response.error?.description || "Unknown error"}`, toastOptions);
            });

            paymentObject.open();
            console.log("Razorpay modal opened");
        }
    }
    catch (error) {
        console.error("Payment Error:", error);
        const errorMessage = error.response?.data?.message || error.message || "Could not make Payment";
        toast.error(errorMessage, toastOptions);
    } finally {
        toast.dismiss(toastId);
    }
}