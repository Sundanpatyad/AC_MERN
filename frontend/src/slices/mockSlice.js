import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { fetchAllMockTests } from '../services/operations/mocktest';

// Async thunk for fetching mock tests
export const getAllMockTests = createAsyncThunk(
  'mockTests/getAllMockTests',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetchAllMockTests(token);
      return response.filter(test => test.status !== 'draft');
    } catch (error) {
      toast.error("Failed to load mock tests. Please try again.");
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

const mockTestSlice = createSlice({
  name: 'mockTests',
  initialState: {
    tests: [],
    loading: false,
    error: null
  },
  reducers: {
    clearMockTests: (state) => {
      state.tests = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllMockTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMockTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload;
        state.error = null;
      })
      .addCase(getAllMockTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMockTests } = mockTestSlice.actions;
export default mockTestSlice.reducer;