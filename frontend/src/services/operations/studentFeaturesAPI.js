import { toast } from "react-hot-toast";
import { MockTestPaymentEndpoints, studentEndpoints, BASE_URL } from "../apis";
import { apiConnector } from "../apiConnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png";
import { resetCart } from "../../slices/cartSlice";

const { MOCK_TEST_PAYMENT_API, MOCK_TEST_VERIFY_API, MOCK_TEST_STATUS_API } = MockTestPaymentEndpoints;
const { COURSE_PAYMENT_API, COURSE_VERIFY_API } = studentEndpoints;

const PENDING_ORDER_KEY = "rzp_pending_order";
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 180000;

const toastOptions = {
    style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
    },
};

export function setCheckoutActive(active) {
    if (typeof window === "undefined") return;
    window.__rzpCheckoutOpen = Boolean(active);
}

function savePendingOrder(orderId, itemType) {
    try {
        sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify({
            orderId,
            itemType,
            ts: Date.now(),
        }));
        setCheckoutActive(true);
    } catch (_) { /* ignore */ }
}

function clearPendingOrder() {
    try {
        sessionStorage.removeItem(PENDING_ORDER_KEY);
    } catch (_) { /* ignore */ }
    setCheckoutActive(false);
}

export function getPendingOrder() {
    try {
        const raw = sessionStorage.getItem(PENDING_ORDER_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.orderId) return null;
        if (Date.now() - Number(parsed.ts || 0) > POLL_TIMEOUT_MS + 60000) {
            sessionStorage.removeItem(PENDING_ORDER_KEY);
            return null;
        }
        return parsed;
    } catch (_) {
        return null;
    }
}

export function normalizeIndianMobile(value) {
    if (value == null || value === "") return undefined;
    const digits = String(value).replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
    if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
    if (digits.length === 10) return digits;
    return undefined;
}

function isMobileBrowser() {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(navigator.userAgent);
}

function loadScript(src) {
    return new Promise((resolve) => {
        if (typeof window !== "undefined" && window.Razorpay) {
            resolve(true);
            return;
        }
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            existing.addEventListener("load", () => resolve(true));
            existing.addEventListener("error", () => resolve(false));
            return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

async function fetchOrderStatus(orderId, token) {
    const response = await apiConnector(
        "GET",
        `${MOCK_TEST_STATUS_API}/${orderId}`,
        null,
        { Authorization: `Bearer ${token}` }
    );
    return response?.data?.data;
}

let pollLock = false;

export async function pollPaymentStatus(orderId, token, { onPaid } = {}) {
    if (pollLock) return null;
    pollLock = true;
    const started = Date.now();
    try {
        while (Date.now() - started < POLL_TIMEOUT_MS) {
            try {
                const data = await fetchOrderStatus(orderId, token);
                const status = data?.status;
                if (status === "paid") {
                    clearPendingOrder();
                    if (onPaid) onPaid(data);
                    return data;
                }
            } catch (error) {
                console.warn("[Payment Poll] status check failed:", error?.message || error);
            }
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }
        return null;
    } finally {
        pollLock = false;
    }
}

export async function resumePendingPayment(token) {
    const pending = getPendingOrder();
    if (!pending?.orderId || !token) return null;
    if (pending.itemType === "course") return null;
    if (pollLock) return null;

    const paid = await pollPaymentStatus(pending.orderId, token, {
        onPaid: () => {
            toast.success("Payment successful. Access has been unlocked.", toastOptions);
            setTimeout(() => window.location.reload(), 1200);
        },
    });
    if (!paid) {
        clearPendingOrder();
    }
    return paid;
}

export async function buyItem(token, itemId, itemTypes, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Loading...", toastOptions);

    try {
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        console.log("Razorpay SDK loaded:", res);

        if (!res) {
            toast.error("RazorPay SDK failed to load. Please check your internet connection.", toastOptions);
            return;
        }

        if (!window.Razorpay) {
            toast.error("Razorpay is not available. Please refresh the page.", toastOptions);
            return;
        }

        const purchases = [];
        if (Array.isArray(itemId) && Array.isArray(itemTypes) && itemId.length === itemTypes.length) {
            const grouped = {};
            itemTypes.forEach((type, index) => {
                if (!grouped[type]) grouped[type] = [];
                grouped[type].push(itemId[index]);
            });
            Object.entries(grouped).forEach(([type, ids]) => {
                purchases.push({ itemType: type, ids });
            });
        } else {
            const uniqueTypes = [...new Set(itemTypes)];
            uniqueTypes.forEach((itemType) => {
                purchases.push({ itemType, ids: itemId });
            });
        }

        for (const { itemType, ids } of purchases) {
            const PAYMENT_API = itemType === 'course' ? COURSE_PAYMENT_API : MOCK_TEST_PAYMENT_API;
            console.log("Payment API:", PAYMENT_API, "Item Type:", itemType, "Item ID:", ids);

            const orderResponse = await apiConnector("POST", PAYMENT_API,
                { itemId: ids },
                {
                    Authorization: `Bearer ${token}`,
                }
            );

            console.log("Order Response:", orderResponse);

            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.message || "Failed to create order");
            }

            const orderData = orderResponse.data.data;
            if (!orderData) {
                throw new Error("Order data is missing from the response");
            }

            if (orderData.alreadyPaid) {
                toast.success(orderResponse.data.message || "Access already unlocked.", toastOptions);
                setTimeout(() => window.location.reload(), 800);
                continue;
            }

            const RAZORPAY_KEY =
                orderData.key ||
                import.meta.env.VITE_APP_RAZORPAY_KEY;

            if (!RAZORPAY_KEY) {
                toast.error("Razorpay key is not configured. Please contact support.", toastOptions);
                return;
            }

            if (!orderData.orderId && !orderData.id) {
                throw new Error("Order ID is missing from the response");
            }

            const orderId = orderData.orderId || orderData.id;
            const amountInPaise = Number(orderData.amount);

            if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
                throw new Error("Invalid payment amount from server");
            }

            const contact = normalizeIndianMobile(
                userDetails?.mobileNumber ||
                userDetails?.additionalDetails?.contactNumber ||
                userDetails?.contactNumber
            );

            const prefill = {
                name: [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(" ")
                    || userDetails?.name
                    || "",
                email: userDetails?.email,
            };
            if (contact) {
                prefill.contact = contact;
            }

            const useRedirect = isMobileBrowser();
            savePendingOrder(orderId, itemType);

            const options = {
                key: RAZORPAY_KEY,
                currency: orderData.currency || "INR",
                amount: amountInPaise,
                order_id: orderId,
                name: "Awakening Classes",
                description: `Thank You for Purchasing the ${itemType}`,
                image: rzpLogo,
                prefill,
                retry: {
                    enabled: true,
                    max_count: 3,
                },
                timeout: 900,
                remember_customer: false,
                handler: async function (response) {
                    console.log("Payment Success Response:", {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                    });
                    try {
                        if (itemType === 'course') {
                            await apiConnector(
                                "POST",
                                COURSE_VERIFY_API,
                                {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    itemId: ids,
                                },
                                { Authorization: `Bearer ${token}` }
                            );
                        } else {
                            await apiConnector(
                                "POST",
                                MOCK_TEST_VERIFY_API,
                                {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                },
                                { Authorization: `Bearer ${token}` }
                            );
                        }
                        clearPendingOrder();
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
                        const recovered = itemType === 'course'
                            ? null
                            : await pollPaymentStatus(orderId, token);
                        if (recovered) {
                            toast.success("Payment successful. Access has been unlocked.", toastOptions);
                            setTimeout(() => window.location.reload(), 1500);
                            return;
                        }
                        toast.error(
                            verifyError.response?.data?.message ||
                            "Payment received but verification failed. Contact support if access is missing.",
                            toastOptions
                        );
                    }
                },
                modal: {
                    ondismiss: function () {
                        console.log("Payment modal closed / user left for UPI app", {
                            orderId,
                            userAgent: navigator.userAgent,
                        });
                        toast("Checking payment status…", toastOptions);
                        pollPaymentStatus(orderId, token, {
                            onPaid: () => {
                                toast.success("Payment successful. Access has been unlocked.", toastOptions);
                                setTimeout(() => window.location.reload(), 1200);
                            },
                        }).then((paid) => {
                            if (!paid) {
                                clearPendingOrder();
                                toast("If money was deducted, access will unlock shortly. Refresh this page or contact support with your order ID.", toastOptions);
                            }
                        });
                    },
                    escape: false,
                    confirm_close: true,
                },
            };

            if (useRedirect) {
                options.redirect = true;
                options.callback_url = `${BASE_URL}/api/v1/payment/razorpay-callback`;
            }

            console.log("Razorpay Options:", {
                ...options,
                key: "***HIDDEN***",
                redirect: Boolean(options.redirect),
                hasContact: Boolean(prefill.contact),
            });

            const paymentObject = new window.Razorpay(options);

            paymentObject.on("payment.failed", function (response) {
                const err = response?.error || {};
                console.error("Payment Failed:", {
                    orderId,
                    code: err.code,
                    description: err.description,
                    source: err.source,
                    step: err.step,
                    reason: err.reason,
                    metadata: err.metadata,
                });
                toast.error(`Payment failed: ${err.description || err.reason || "Unknown error"}`, toastOptions);
                if (itemType !== 'course') {
                    pollPaymentStatus(orderId, token, {
                        onPaid: () => {
                            toast.success("Payment successful. Access has been unlocked.", toastOptions);
                            setTimeout(() => window.location.reload(), 1200);
                        },
                    });
                }
            });

            paymentObject.open();
            console.log("Razorpay modal opened", { orderId, mobile: useRedirect });
        }
    }
    catch (error) {
        console.error("Payment Error:", error);
        clearPendingOrder();
        const errorMessage = error.response?.data?.message || error.message || "Could not make Payment";
        toast.error(errorMessage, toastOptions);
    } finally {
        toast.dismiss(toastId);
    }
}
