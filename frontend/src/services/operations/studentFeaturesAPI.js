import { toast } from "react-hot-toast";
import { MockTestPaymentEndpoints, studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";
import Cookies from 'js-cookie';

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

// Function to set payment info in cookies
function setPaymentInfoCookie(paymentInfo) {
    var now = new Date();

    // Set the expiration time to 5 minutes from now
    now.setTime(now.getTime() + (5 * 60 * 1000));
    Cookies.set('paymentInfo', JSON.stringify(paymentInfo), { expires: now }); // Expires in 1 day
}

// Function to get payment info from cookies
function getPaymentInfoCookie() {
    const paymentInfo = Cookies.get('paymentInfo');
    return paymentInfo ? JSON.parse(paymentInfo) : null;
}

// Function to clear payment info from cookies
function clearPaymentInfoCookie() {
    Cookies.remove('paymentInfo');
}

// ================ buyItem ================ 
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
                    // Store payment info in cookies before verification
                    setPaymentInfoCookie({
                        ...response,
                        itemId,
                        itemType,
                        amount: orderData.amount
                    });
                    verifyPayment({ ...response, itemId, itemType }, token, navigate, dispatch);
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            paymentObject.on("payment.failed", function (response) {
                toast.error("Oops, payment failed", toastOptions);
                clearPaymentInfoCookie();
            });
        }
    }
    catch (error) {
        toast.error(error.response?.data?.message || "Could not make Payment", toastOptions);
    } finally {
        toast.dismiss(toastId);
    }
}

// ================ verifyPayment ================ 
export async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....", toastOptions);
    // dispatch(setPaymentLoading(true));   

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

        if (bodyData.itemType) {
            dispatch(resetCart());
        }
        console.log(response  ,    "res")
        
        // if (response.data.success) {
        //     window.location.reload();
        // } else {
        //     navigate("/dashboard/enrolled-courses");  // Adjust this path as necessary
        // }



        return response;
    } catch (error) {
        toast.error("Could not verify Payment", toastOptions);
        // Keep payment info in cookies if verification fails
    } finally {
        toast.dismiss(toastId);
        // dispatch(setPaymentLoading(false));  
    }
}

// ================ checkAndVerifyPayment ================ 
export function checkAndVerifyPayment(token, navigate, dispatch) {
    const paymentInfo = getPaymentInfoCookie();
    if (paymentInfo) {
        verifyPayment(paymentInfo, token, navigate, dispatch);
    }
}