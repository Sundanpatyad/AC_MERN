// const BASE_URL = 'https://awakening-classes.up.railway.app';
// const BASE_URL = 'http://localhost:8000';
const BASE_URL = 'https://awakening-classes.up.railway.app';

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: `${BASE_URL}/api/v1/auth/sendotp`,
  SIGNUP_API: `${BASE_URL}/api/v1/auth/signup`,
  LOGIN_API: `${BASE_URL}/api/v1/auth/login`,
  GOOGLE_API:`${BASE_URL}/api/v1/auth/google`,
  RESETPASSTOKEN_API: `${BASE_URL}/api/v1/auth/reset-password-token`,
  RESETPASSWORD_API: `${BASE_URL}/api/v1/auth/reset-password`,
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: `${BASE_URL}/api/v1/profile/getUserDetails`,
  GET_USER_ENROLLED_COURSES_API: `${BASE_URL}/api/v1/profile/getEnrolledCourses`,
  GET_INSTRUCTOR_DATA_API: `${BASE_URL}/api/v1/profile/instructorDashboard`,
  GET_ATTEMPT_DATA_API: `${BASE_URL}/api/v1/mock/getAttemptsByUser`,
  GET_USER_ENROLLED_MOCK_TESTS_API: `${BASE_URL}/api/v1/profile/getEnrolledMockTests`,
  UPDATE_MOCKTEST_API:`${BASE_URL}/api/v1/mock/updateMockTestSeries`
}

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: `${BASE_URL}/api/v1/payment/capturePayment`,
  COURSE_VERIFY_API: `${BASE_URL}/api/v1/payment/verifyPayment`,
  SEND_PAYMENT_SUCCESS_EMAIL_API: `${BASE_URL}/api/v1/payment/sendPaymentSuccessEmail`,
}

// MOCK TEST PAYMENT ENDPOINTS
export const MockTestPaymentEndpoints = {
  MOCK_TEST_PAYMENT_API: `${BASE_URL}/api/v1/payment/captureMockPaymet`,
  MOCK_TEST_VERIFY_API: `${BASE_URL}/api/v1/payment/verifyMockPayment`,
  SEND_PAYMENT_SUCCESS_EMAIL_API: `${BASE_URL}/api/v1/payment/sendPaymentSuccessEmail`,
}

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: `${BASE_URL}/api/v1/course/getAllCourses`,
  COURSE_DETAILS_API: `${BASE_URL}/api/v1/course/getCourseDetails`,
  EDIT_COURSE_API: `${BASE_URL}/api/v1/course/editCourse`,
  COURSE_CATEGORIES_API: `${BASE_URL}/api/v1/course/showAllCategories`,
  CREATE_COURSE_API: `${BASE_URL}/api/v1/course/createCourse`,
  CREATE_SECTION_API: `${BASE_URL}/api/v1/course/addSection`,
  CREATE_SUBSECTION_API: `${BASE_URL}/api/v1/course/addSubSection`,
  UPDATE_SECTION_API: `${BASE_URL}/api/v1/course/updateSection`,
  UPDATE_SUBSECTION_API: `${BASE_URL}/api/v1/course/updateSubSection`,
  GET_ALL_INSTRUCTOR_COURSES_API: `${BASE_URL}/api/v1/course/getInstructorCourses`,
  DELETE_SECTION_API: `${BASE_URL}/api/v1/course/deleteSection`,
  DELETE_SUBSECTION_API: `${BASE_URL}/api/v1/course/deleteSubSection`,
  DELETE_COURSE_API: `${BASE_URL}/api/v1/course/deleteCourse`,
  GET_FULL_COURSE_DETAILS_AUTHENTICATED: `${BASE_URL}/api/v1/course/getFullCourseDetails`,
  LECTURE_COMPLETION_API: `${BASE_URL}/api/v1/course/updateCourseProgress`,
  CREATE_RATING_API: `${BASE_URL}/api/v1/course/createRating`,
}

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: `${BASE_URL}/api/v1/course/getReviews`,
}

// CATEGORIES API
export const categories = {
  CATEGORIES_API: `${BASE_URL}/api/v1/course/showAllCategories`,
}

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: `${BASE_URL}/api/v1/course/getCategoryPageDetails`,
}

// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: `${BASE_URL}/api/v1/reach/contact`,
}

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: `${BASE_URL}/api/v1/profile/updateUserProfileImage`,
  UPDATE_PROFILE_API: `${BASE_URL}/api/v1/profile/updateProfile`,
  CHANGE_PASSWORD_API: `${BASE_URL}/api/v1/auth/changepassword`,
  DELETE_PROFILE_API: `${BASE_URL}/api/v1/profile/deleteProfile`,
}

export const mocktestEndpoints = {
  CREATE_MOCKTEST_API: `${BASE_URL}/api/v1/mock/createMockTest`,
  CREATE_MOCKTESTS_API:`${BASE_URL}/api/v1/mock/createMockTestSeries`,
  GET_MOCK_TEST_API:`${BASE_URL}/api/v1/mock/getMockTest`,
  GET_INSTRUCTORS_MOCKTESTS:`${BASE_URL}/api/v1/mock/getMockTests`,
  FETCH_MOCKTEST_BY_ID:`${BASE_URL}/api/v1/mock/getMockTestSeriesById`,
  ENORLL_MOCKTEST:`${BASE_URL}/api/v1/mock/enroll`,
  GET_MCOKTEST_SERIES_BY_ID:`${BASE_URL}/api/v1/mock/getMockTestSeriesById`,
  CREATE_ATTEMPT_DETAILS:`${BASE_URL}/api/v1/mock/createAttemptDetails`
  // http://localhost:8000/api/v1/mock/getMockTestSeriesById

}