// src/slices/enrolledContentSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  enrolledCourses: null,
  enrolledMockTests: null,
  mockAttempts: null,
  loading: {
    courses: false,
    mockTests: false,
    attempts: false,
  },
  error: {
    courses: null,
    mockTests: null,
    attempts: null,
  },
};

const enrolledContentSlice = createSlice({
  name: 'enrolledContent',
  initialState,
  reducers: {
    setEnrolledCoursesStart: (state) => {
      state.loading.courses = true;
      state.error.courses = null;
    },
    setEnrolledCoursesSuccess: (state, action) => {
      state.enrolledCourses = action.payload;
      state.loading.courses = false;
    },
    setEnrolledCoursesFailure: (state, action) => {
      state.loading.courses = false;
      state.error.courses = action.payload;
    },
    setEnrolledMockTestsStart: (state) => {
      state.loading.mockTests = true;
      state.error.mockTests = null;
    },
    setEnrolledMockTestsSuccess: (state, action) => {
      state.enrolledMockTests = action.payload;
      state.loading.mockTests = false;
    },
    setEnrolledMockTestsFailure: (state, action) => {
      state.loading.mockTests = false;
      state.error.mockTests = action.payload;
    },
    setMockAttemptsStart: (state) => {
      state.loading.attempts = true;
      state.error.attempts = null;
    },
    setMockAttemptsSuccess: (state, action) => {
      state.mockAttempts = action.payload;
      state.loading.attempts = false;
    },
    setMockAttemptsFailure: (state, action) => {
      state.loading.attempts = false;
      state.error.attempts = action.payload;
    },
  },
});

export const {
  setEnrolledCoursesStart,
  setEnrolledCoursesSuccess,
  setEnrolledCoursesFailure,
  setEnrolledMockTestsStart,
  setEnrolledMockTestsSuccess,
  setEnrolledMockTestsFailure,
  setMockAttemptsStart,
  setMockAttemptsSuccess,
  setMockAttemptsFailure,
} = enrolledContentSlice.actions;

export default enrolledContentSlice.reducer;