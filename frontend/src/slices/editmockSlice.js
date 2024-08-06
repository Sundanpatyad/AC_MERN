import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSeries } from '../services/operations/mocktest';
import axios from 'axios';

export const fetchSeriesAsync = createAsyncThunk(
  'editMock/fetchSeries',
  async ({ seriesId, token }) => {
    const response = await fetchSeries(seriesId, token);
    return response;
  }
);

export const addMockTest = createAsyncThunk(
  'editMock/addMockTest',
  async ({ seriesId, testName, testData, duration, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:8000/api/v1/mock/addMocktestToSeries', {
        seriesId,
        testName,
        testData,
        duration: parseInt(duration),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  series: null,
  status: 'idle',
  error: null,
};

const editMockSlice = createSlice({
  name: 'editMock',
  initialState,
  reducers: {
    updateSeries: (state, action) => {
      state.series = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeriesAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSeriesAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.series = action.payload;
      })
      .addCase(fetchSeriesAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addMockTest.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addMockTest.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Assuming the response includes the updated series data
        state.series = action.payload;
      })
      .addCase(addMockTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { updateSeries } = editMockSlice.actions;

export default editMockSlice.reducer;