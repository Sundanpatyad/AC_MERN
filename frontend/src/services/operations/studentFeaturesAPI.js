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

// ================ buyCourse ================ 
export async function buyItem(token, itemId, itemTypes, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Loading...", toastOptions);
    
    console.log("These are the itemTypes: ", itemTypes);
    
    try {
        // Load the script
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        
        if (!res) {
            toast.error("RazorPay SDK failed to load", toastOptions);
            return;
        }
        
        // Initialize an array to store all order responses
        const orderResponses = [];
        
        // Iterate through each item type and initiate orders
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
        
        // Calculate total amount
        const totalAmount = orderResponses.reduce((sum, order) => sum + order.amount, 0);
        
        // Options
        const options = {
            key: RAZORPAY_KEY,
            currency: orderResponses[0].currency, // Assuming all orders use the same currency
            amount: totalAmount,
            order_id: orderResponses.map(order => order.id).join(','), // Join all order IDs
            name: "Awakening Classes",
            description: `Thank You for Purchasing ${itemTypes.join(' and ')}`,
            image: rzpLogo,
            prefill: {
                name: userDetails.firstName,
                email: userDetails.email
            },
            handler: function (response) {
                // Send successful mail
                sendPaymentSuccessEmail(response, totalAmount, token);
                // Verify payment for each item type
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

// ================ send Payment Success Email ================
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

// ================ verify payment ================
async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....", toastOptions);
    dispatch(setPaymentLoading(true));

    try {
        // Determine the API endpoint based on the item type
        const VERIFY_API = bodyData.itemType === 'course' ? COURSE_VERIFY_API : MOCK_TEST_VERIFY_API;

        const response = await apiConnector("POST", VERIFY_API, bodyData, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        const itemTypeName = bodyData.itemType === 'course' ? 'course' : 'mock test';
        toast.success(`Payment Successful, you are added to the ${itemTypeName}`, toastOptions);
        

        // Navigate to the appropriate dashboard page
        if (bodyData.itemType === 'course') {
            navigate("/dashboard/enrolled-courses");
        } else {
            navigate("/mocktest"); // Adjust this path as needed
        }

        // Reset cart if necessary (you might want to handle this differently for mock tests)
        if (bodyData) {
            dispatch(resetCart());
        }
    }
    catch (error) {
        console.log("PAYMENT VERIFY ERROR....", error);
        toast.error("Could not verify Payment", toastOptions);
    }
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
}
