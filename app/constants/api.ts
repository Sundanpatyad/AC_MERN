// export const BASE_URL = 'https://ac-62i9.onrender.com';
export const BASE_URL = 'https://ac-mern-569448299007.europe-west1.run.app';
// export const BASE_URL = 'https://f163-223-178-210-23.ngrok-free.app';

export const endpoints = {
  // Auth
  SENDOTP_API: `${BASE_URL}/api/v1/auth/sendotp`,
  SIGNUP_API: `${BASE_URL}/api/v1/auth/signup`,
  LOGIN_API: `${BASE_URL}/api/v1/auth/login`,
  GOOGLE_API: `${BASE_URL}/api/v1/auth/google`,
  RESETPASSTOKEN_API: `${BASE_URL}/api/v1/auth/reset-password-token`,
  RESETPASSWORD_API: `${BASE_URL}/api/v1/auth/reset-password`,

  // Mock Tests
  GET_ALL_MOCK_TESTS: `${BASE_URL}/api/v1/mock/getMockTest`,
  GET_MOCK_TEST_SERIES_BY_ID: `${BASE_URL}/api/v1/mock/getMockTestSeriesById`,
  ENROLL_MOCK_TEST: `${BASE_URL}/api/v1/mock/enroll`,
  CREATE_ATTEMPT_DETAILS: `${BASE_URL}/api/v1/mock/createAttemptDetails`,
  GET_RANKINGS: `${BASE_URL}/api/v1/mock/getRankings`,

  // Profile
  GET_USER_DETAILS: `${BASE_URL}/api/v1/profile/getUserDetails`,
  GET_ENROLLED_MOCK_TESTS: `${BASE_URL}/api/v1/profile/getEnrolledMockTests`,
  UPDATE_PROFILE_API: `${BASE_URL}/api/v1/profile/updateProfile`,
  DELETE_PROFILE_API: `${BASE_URL}/api/v1/profile/deleteProfile`,
  CHANGE_PASSWORD_API: `${BASE_URL}/api/v1/auth/changepassword`,
  GET_USER_ATTEMPTS: `${BASE_URL}/api/v1/mock/getAttemptsByUser`,

  // Payment
  CAPTURE_MOCK_PAYMENT: `${BASE_URL}/api/v1/payment/captureMockPayment`,
  VERIFY_MOCK_PAYMENT: `${BASE_URL}/api/v1/payment/verifyMockPayment`,
  PAYMENT_STATUS: `${BASE_URL}/api/v1/payment/paymentStatus`,

  // Push notifications (FCM)
  REGISTER_FCM_TOKEN: `${BASE_URL}/api/v1/notifications/register`,
  UNREGISTER_FCM_TOKEN: `${BASE_URL}/api/v1/notifications/unregister`,
  GET_NOTIFICATION_PREFS: `${BASE_URL}/api/v1/notifications/prefs`,
  UPDATE_NOTIFICATION_PREFS: `${BASE_URL}/api/v1/notifications/prefs`,
  SEND_NOTIFICATION: `${BASE_URL}/api/v1/notifications/send`,

  // Instructor / admin
  GET_INSTRUCTOR_DASHBOARD: `${BASE_URL}/api/v1/profile/instructorDashboard`,
  GET_INSTRUCTOR_COURSES: `${BASE_URL}/api/v1/course/getInstructorCourses`,
  GET_INSTRUCTOR_MOCK_TESTS: `${BASE_URL}/api/v1/mock/getMockTests`,
  CREATE_MOCK_TEST_SERIES: `${BASE_URL}/api/v1/mock/createMockTestSeries`,
  UPDATE_MOCK_TEST_SERIES: `${BASE_URL}/api/v1/mock/updateMockTestSeries`,
  ADD_MOCKTEST_TO_SERIES: `${BASE_URL}/api/v1/mock/addMocktestToSeries`,
  ADD_SERIES_ATTACHMENTS: `${BASE_URL}/api/v1/mock/series`,
  ADMIN_MOCK_LIST: `${BASE_URL}/api/v1/admin/users-by-mock-test`,
  ADMIN_MOCK_PURCHASERS: `${BASE_URL}/api/v1/admin/users-by-mock-test`,

  // Study materials
  GET_EXAMS: `${BASE_URL}/api/v1/materials/getExam`,
  GET_STUDY_MATERIALS: `${BASE_URL}/api/v1/materials/getAllStudyMaterials`,
};
