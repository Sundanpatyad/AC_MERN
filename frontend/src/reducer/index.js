import { combineReducers } from "@reduxjs/toolkit"

import authReducer from "../slices/authSlice"
import cartReducer from "../slices/cartSlice"
import courseReducer from "../slices/courseSlice"
import profileReducer from "../slices/profileSlice"
import viewCourseReducer from "../slices/viewCourseSlice"
import enrolledContentReducer from "../slices/enrolledContentSlice"
import catalogReducer from "../slices/catlogSlice";
import sidebarSlice from "../slices/sidebarSlice";
import mockTestSeriesReducer from "../slices/editmockSlice";
import editMockReducer from "../slices/editmockSlice"
import contentReducer from '../slices/contentSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  course: courseReducer,
  cart: cartReducer,
  viewCourse: viewCourseReducer,
  sidebar: sidebarSlice,
  catalog: catalogReducer,
  enrolledContent: enrolledContentReducer,
  mockTestSeries: mockTestSeriesReducer,
  editmock : editMockReducer,
  content: contentReducer,
})

export default rootReducer
