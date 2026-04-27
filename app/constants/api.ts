// export const BASE_URL = 'https://ac-62i9.onrender.com';
export const BASE_URL = 'http://192.168.1.7:8000';

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
  GET_USER_ATTEMPTS: `${BASE_URL}/api/v1/mock/getAttemptsByUser`,

  // Payment
  CAPTURE_MOCK_PAYMENT: `${BASE_URL}/api/v1/payment/captureMockPayment`,
  VERIFY_MOCK_PAYMENT: `${BASE_URL}/api/v1/payment/verifyMockPayment`,
};
