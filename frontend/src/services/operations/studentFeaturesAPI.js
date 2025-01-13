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
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

        if (!res) {
            toast.error("RazorPay SDK failed to load", toastOptions);
            return;
        }

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

            const orderData = orderResponse.data.message;
            const RAZORPAY_KEY = import.meta.env.VITE_APP_RAZORPAY_KEY;

            const options = {
                key: RAZORPAY_KEY,
                currency: orderData.currency,
                amount: orderData.amount,
                order_id: orderData.id,
                name: "Awakening Classes",
                description: `Thank You for Purchasing the ${itemType}`,
                image: rzpLogo,
                prefill: {
                    name: userDetails.firstName,
                    email: userDetails.email
                },
                handler: function (response) {
                    const itemTypeName = itemType === 'course' ? 'course' : 'mock test';
                    toast.success(`Payment Successful, you are added to the ${itemTypeName}`, toastOptions);
                    
                    if (itemType === 'course') {
                        dispatch(resetCart());
                    }
                    
                    window.location.reload();
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            paymentObject.on("payment.failed", function (response) {
                toast.error("Oops, payment failed", toastOptions);
            });
        }
    }
    catch (error) {
        toast.error(error.response?.data?.message || "Could not make Payment", toastOptions);
    } finally {
        toast.dismiss(toastId);
    }
}