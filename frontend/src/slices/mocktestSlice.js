// src/redux/slices/mockTestSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mockTests: [],
  isLoading: false,
  error: null,
  selectedMockTest: null,
  enrolledTests: [],
};

const mockTestSlice = createSlice({
  name: 'mockTest',
  initialState,
  reducers: {
    setMockTests: (state, action) => {
      state.mockTests = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    selectMockTest: (state, action) => {
      state.selectedMockTest = action.payload;
    },
    addToEnrolledTests: (state, action) => {
      state.enrolledTests.push(action.payload);
    },
    removeFromEnrolledTests: (state, action) => {
      state.enrolledTests = state.enrolledTests.filter(
        testId => testId !== action.payload
      );
    },
    updateMockTest: (state, action) => {
      const index = state.mockTests.findIndex(test => test._id === action.payload._id);
      if (index !== -1) {
        state.mockTests[index] = action.payload;
      }
    },
  },
});

export const {
  setMockTests,
  setLoading,
  setError,
  selectMockTest,
  addToEnrolledTests,
  removeFromEnrolledTests,
  updateMockTest,
} = mockTestSlice.actions;

export default mockTestSlice.reducer;