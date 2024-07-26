// src/slices/catalogSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [],
  catalogPageData: {},
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setCatalogPageData: (state, action) => {
      state.catalogPageData[action.payload.categoryId] = action.payload.data;
    },
  },
});

export const { setCategories, setCatalogPageData } = catalogSlice.actions;
export default catalogSlice.reducer;