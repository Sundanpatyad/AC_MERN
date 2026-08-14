import axios from "axios"
import { toast } from "@/utils/toast"
import { BASE_URL } from "./apis"
import { getStoredToken, removeStoredToken } from "../utils/tokenStorage"

export const axiosInstance = axios.create({});

// Attaches the auth token so individual callers don't have to. Scoped to our own
// API so the token is never sent to third parties (Cloudinary, Razorpay, ...).
// Callers that pass an undefined token produce a literal "Bearer undefined",
// which has to be treated as missing rather than as a real header.
const hasUsableAuthHeader = (headers) => {
    const value = headers?.Authorization || headers?.authorization;
    if (!value) return false;
    const token = String(value).replace(/^Bearer\s*/i, "").trim();
    return token !== "" && token !== "undefined" && token !== "null";
};

const attachAuthToken = (config) => {
    const url = config.url || "";
    const isOwnApi = url.startsWith(BASE_URL) || url.startsWith("/");

    if (isOwnApi && !hasUsableAuthHeader(config.headers)) {
        const token = getStoredToken();
        if (token) {
            config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
        }
    }

    return config;
};

axiosInstance.interceptors.request.use(attachAuthToken);
// Slices and components that call axios directly get the same treatment.
axios.interceptors.request.use(attachAuthToken);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Check if error is due to token expiration (401 or 403)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Check if the error message indicates token expiration
            const errorMessage = error.response.data?.message?.toLowerCase() || '';

            if (errorMessage.includes('token') || errorMessage.includes('unauthorized') || errorMessage.includes('expired')) {
                if (typeof window !== 'undefined' && window.__rzpCheckoutOpen) {
                    return Promise.reject(error);
                }
                removeStoredToken();
                localStorage.removeItem('user');

                // Show toast notification
                toast.error('Session expired');

                // Redirect to login page
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : null,
        params: params ? params : null,
    });
}