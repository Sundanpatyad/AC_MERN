import { toast } from "react-hot-toast"
import { setLoading, setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { profileEndpoints } from "../apis"
import { logout } from "./authAPI"

const { GET_USER_DETAILS_API, GET_USER_ENROLLED_COURSES_API, GET_INSTRUCTOR_DATA_API, GET_ATTEMPT_DATA_API, GET_USER_ENROLLED_MOCK_TESTS_API , UPDATE_MOCKTEST_API} = profileEndpoints

const toastOptions = {
  style: {
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
  },
};

// ================ get User Details  ================
export function getUserDetails(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...", toastOptions)
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("GET", GET_USER_DETAILS_API, null, { Authorization: `Bearer ${token}`, })
      console.log("GET_USER_DETAILS API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      const userImage = response.data.data.image
        ? response.data.data.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.data.firstName} ${response.data.data.lastName}`
      dispatch(setUser({ ...response.data.data, image: userImage }))
    } catch (error) {
      dispatch(logout(navigate))
      console.log("GET_USER_DETAILS API ERROR............", error)
      toast.error("Could Not Get User Details", toastOptions)
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}

// ================ get User Enrolled Courses  ================
export async function getUserEnrolledCourses(token) {
  let result = []
  try {
    const response = await apiConnector("GET", GET_USER_ENROLLED_COURSES_API, { token }, { Authorization: `Bearer ${token}`, })

    console.log("GET_USER_ENROLLED_COURSES_API API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data.data
  } catch (error) {
    console.log("GET_USER_ENROLLED_COURSES_API API ERROR............", error)
    toast.error("Could Not Get Enrolled Courses", toastOptions)
  }
  return result
}

export async function getUserEnrolledMockTests(token) {
  let result = []
  try {
    const response = await apiConnector(
      "GET",
      GET_USER_ENROLLED_MOCK_TESTS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET_USER_ENROLLED_MOCK_TESTS_API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data.data
  } catch (error) {
    console.log("GET_USER_ENROLLED_MOCK_TESTS_API ERROR............", error)
    toast.error("Could Not Get Enrolled Mock Tests", toastOptions)
  }
  return result
}

export async function getUserAttempts(token) {
  let result = []
  try {
    const response = await apiConnector(
      "GET",
      GET_ATTEMPT_DATA_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET_USER_ATTEMPTS_API API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data
  } catch (error) {
    console.log("GET_USER_ATTEMPTS_API API ERROR............", error)
    toast.error("Could Not Get User Attempts", toastOptions)
  }
  return result
}

// ================ get Instructor Data  ================
export async function getInstructorData(token) {
  let result = []
  try {
    const response = await apiConnector("GET", GET_INSTRUCTOR_DATA_API, null, {
      Authorization: `Bearer ${token}`,
    })
    console.log("GET_INSTRUCTOR_DATA_API API RESPONSE............", response)
    result = response?.data?.courses
  } catch (error) {
    console.log("GET_INSTRUCTOR_DATA_API API ERROR............", error)
    toast.error("Could Not Get Instructor Data", toastOptions)
  }
  return result
}

export const saveSeries = async (seriesId, seriesData, token) => {
  const toastId = toast.loading("Saving series...", toastOptions);
  let result = null;

  try {
    const response = await apiConnector(
      "PUT",
      `${UPDATE_MOCKTEST_API}/${seriesId}`,
      seriesData,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("Save Series API RESPONSE", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not update Mock Test Series");
    }

    result = response?.data?.data;
    toast.success("Mock Test Series updated successfully", toastOptions);
  } catch (error) {
    console.error("Save Series API ERROR:", error);
    toast.error(error.message || "Error updating Mock Test Series", toastOptions);
  } finally {
    toast.dismiss(toastId);
  }

  return result;
};
