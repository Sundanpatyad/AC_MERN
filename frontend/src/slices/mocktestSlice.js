import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  createStatus: null, 
  editMockTest: false, // Flag to indicate if a mock test is being edited
  selectedMockTest: null, // Stores the currently selected mock test details (optional)
  mockTests: [], // List of existing mock tests (fetched or created)
};

const mockTestSlice = createSlice({
  name: "mockTest",
  initialState,
  reducers: {
    setCreateStatus: (state, action) => {
      state.createStatus = action.payload; // Update createStatus based on action
    },
    setEditMockTest: (state, action) => {
      state.editMockTest = action.payload; // Set editMockTest flag
    },
    setSelectedMockTest: (state, action) => {
      state.selectedMockTest = action.payload; // Store the selected mock test
    },
    setMockTests: (state, action) => {
      state.mockTests = action.payload; // Update list of mock tests
    },
    resetMockTestState: (state) => { // Reset mock test state
      state.createStatus = null;
      state.editMockTest = false;
      state.selectedMockTest = null;
      state.mockTests = [];
    },
  },
});

export const {
  setCreateStatus,
  setEditMockTest,
  setSelectedMockTest,
  setMockTests,
  resetMockTestState,
} = mockTestSlice.actions;

export default mockTestSlice.reducer;
