import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/operations/authAPI';
import { toast } from 'react-hot-toast';

/**
 * Custom hook to check token expiry and auto-logout
 * Checks every minute if token is expired
 */
export const useTokenExpiry = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!token) return;

        const checkTokenExpiry = () => {
            try {
                // Decode JWT token to get expiry time
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                const expiryTime = tokenData.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();
                // If token is expired
                if (currentTime >= expiryTime) {
                    toast.error('Session expired. Please login again.', {
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        },
                    });
                    dispatch(logout(navigate));
                }
            } catch (error) {
                console.error('Error checking token expiry:', error);
            }
        };

        // Check immediately
        checkTokenExpiry();

        // Check every minute
        const interval = setInterval(checkTokenExpiry, 60000);

        return () => clearInterval(interval);
    }, [token, dispatch, navigate]);
};
