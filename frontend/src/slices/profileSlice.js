import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import { endpoints } from "../services/apis";
import toast from 'react-hot-toast';

const { MOBILE_NUMBER } = endpoints;

const toastOptions = {
    style: {
      borderRadius: '10px',
      background: '#333',
      color: '#fff',
    },
  };

const initialState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
};

// Async thunk for updating mobile number
export const updateMobileNumber = createAsyncThunk(
    'profile/updateMobileNumber',
    async ({ userId, mobileNumber, token }, { rejectWithValue }) => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        };

        try {
            const response = await toast.promise(
                axios.put(MOBILE_NUMBER, { userId, mobileNumber }, config),
                {
                    loading: 'Updating mobile number...',
                    success: 'Mobile number updated successfully',
                    error: (err) => `Mobile number already exists`,
                }
                , toastOptions
            );
            return response.data.user.mobileNumber;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'An unknown error occurred' });
        }
    }
);

const profileSlice = createSlice({
    name: "profile",
    initialState: initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        setToken(state, action) {
            state.token = action.payload;
            localStorage.setItem('token', action.payload);
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
        logout(state) {
            state.user = null;
            state.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateMobileNumber.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateMobileNumber.fulfilled, (state, action) => {
                state.loading = false;
                state.user.mobileNumber = action.payload;
                localStorage.setItem('user', JSON.stringify(state.user));
            })
            .addCase(updateMobileNumber.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message || 'Failed to update mobile number';
                // We don't need to call toast.error here as it's already handled in the thunk
            });
    },
});

export const { setUser, setToken, setLoading, clearError, logout } = profileSlice.actions;
export default profileSlice.reducer;

// Function to dispatch the updateMobileNumber action
export const updateUserMobileNumber = (userId, mobileNumber, token) => async (dispatch) => {
    try {
        await dispatch(updateMobileNumber({ userId, mobileNumber, token }));
    } catch (error) {
        console.error('Failed to update mobile number:', error);
        // No need to show a toast here as it's already handled in the thunk
    }
};