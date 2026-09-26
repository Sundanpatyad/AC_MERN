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
        const rt = response?.config?.responseType;
        // Never walk PDF/file binaries — absolutize would destroy ArrayBuffer
        if (
            response?.data &&
            rt !== "arraybuffer" &&
            rt !== "blob" &&
            !isBinaryPayload(response.data)
        ) {
            response.data = absolutizeMediaInClient(response.data);
        }
        return response;
    },
    (error) => {
        // Check if error is due to token expiration (401 or 403)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Check if the error message indicates token expiration
            const raw = error.response.data;
            const errorMessage = (
                typeof raw === "string"
                    ? raw
                    : raw instanceof ArrayBuffer
                      ? new TextDecoder().decode(raw)
                      : raw?.message || ""
            ).toLowerCase();

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

function isBinaryPayload(data) {
    if (data == null || typeof data !== "object") return false;
    if (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer) return true;
    if (typeof Blob !== "undefined" && data instanceof Blob) return true;
    if (typeof Buffer !== "undefined" && typeof Buffer.isBuffer === "function" && Buffer.isBuffer(data)) return true;
    if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(data)) return true;
    return false;
}

function isPlainObject(value) {
    if (value === null || typeof value !== "object") return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}

function absolutizeMediaInClient(data, seen = new WeakSet()) {
    if (data == null || typeof data !== "object") {
        if (typeof data !== "string" || !data.includes("/api/v1/media/")) return data;
        const base = String(BASE_URL || "").replace(/\/$/, "");
        if (data.startsWith("/api/v1/media/")) return `${base}${data}`;
        const idx = data.indexOf("/api/v1/media/");
        return `${base}${data.slice(idx)}`;
    }
    if (isBinaryPayload(data)) return data;
    if (seen.has(data)) return data;
    if (Array.isArray(data)) {
        seen.add(data);
        return data.map((item) => absolutizeMediaInClient(item, seen));
    }
    // Don't Object.entries non-plain values (ObjectId / Date / etc.)
    if (!isPlainObject(data)) return data;
    seen.add(data);
    const out = {};
    for (const [key, val] of Object.entries(data)) {
        out[key] = absolutizeMediaInClient(val, seen);
    }
    return out;
}

export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : null,
        params: params ? params : null,
    });
}