import axios from "axios"
import { toast } from "react-hot-toast"

export const axiosInstance = axios.create({});

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
                // Clear local storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Show toast notification
                toast.error('Session expired. Please login again.', {
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });

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