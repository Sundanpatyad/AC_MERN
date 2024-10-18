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

// ================ buyItem ================ 
export async function buyItem(token, itemId, itemTypes, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Loading...", toastOptions);
    
    try {
        // Load the Razorpay SDK
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        
        if (!res) {
            toast.error("RazorPay SDK failed to load", toastOptions);
            return;
        }
        
        // Process each item type separately
        for (const itemType of itemTypes) {
            const PAYMENT_API = itemType === 'course' ? COURSE_PAYMENT_API : MOCK_TEST_PAYMENT_API;
            
            // Create an order for each item type
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

            // Configure the Razorpay options for this order
            const options = {
                key: RAZORPAY_KEY,
                currency: orderData.currency,
                amount: orderData.amount,  // Amount is in smallest unit (e.g. paise)
                order_id: orderData.id,    // Order ID from Razorpay
                name: "Awakening Classes",
                description: `Thank You for Purchasing the ${itemType}`,
                image: rzpLogo,
                prefill: {
                    name: userDetails.firstName,
                    email: userDetails.email
                },
                handler: function (response) {
                    // On successful payment, verify the payment and send confirmation email
                    verifyPayment({ ...response, itemId, itemType }, token, navigate, dispatch);
                }
            };

            // Open Razorpay payment window
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            paymentObject.on("payment.failed", function (response) {
                toast.error("Oops, payment failed", toastOptions);
                //console.log("Payment failed: ", response.error);
            });
        }
    }
    catch (error) {
        // Handle errors gracefully
        toast.error(error.response?.data?.message || "Could not make Payment", toastOptions);
    } finally {
        toast.dismiss(toastId);
    }
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
        // Handle email send error
        //console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
    }
}

// ================ verifyPayment ================ 
export default async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....", toastOptions);
    dispatch(setPaymentLoading(true));
    
    try {
        // Determine the correct API based on the item type
        const VERIFY_API = bodyData.itemType === 'course' ? COURSE_VERIFY_API : MOCK_TEST_VERIFY_API;
        
        const response = await apiConnector("POST", VERIFY_API, bodyData, {
            Authorization: `Bearer ${token}`,
        });
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        const itemTypeName = bodyData.itemType === 'course' ? 'course' : 'mock test';
        toast.success(`Payment Successful, you are added to the ${itemTypeName}`, toastOptions);
        
        // Reset the cart after payment verification
        if (bodyData.itemType) {
            dispatch(resetCart());
        }

        // Redirect the user to the appropriate page
        if (response.data.success) {
           setTimeout(()=> {
            window.location.reload();
           },1000)
        } else {
            navigate("/dashboard/enrolled-courses");  // Adjust this path as necessary
        }

        return response;
    } catch (error) {
        // Handle verification error
        toast.error("Could not verify Payment", toastOptions);
    } finally {
        toast.dismiss(toastId);
        dispatch(setPaymentLoading(false));
    }
}
