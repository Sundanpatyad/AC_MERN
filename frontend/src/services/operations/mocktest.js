import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { mocktestEndpoints } from "../apis"

const { CREATE_MOCKTEST_API , GET_INSTRUCTORS_MOCKTESTS , GET_MOCK_TEST_API  , FETCH_MOCKTEST_BY_ID , ENORLL_MOCKTEST , GET_MCOKTEST_SERIES_BY_ID} = mocktestEndpoints;

const toastOptions = {
  style: {
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
  },
};

export const addMockTest = async (data, token) => {
  const toastId = toast.loading("Loading...", toastOptions)
  let result = null;

  try {
    const response = await apiConnector("POST", CREATE_MOCKTEST_API, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    })
    //console.log("CREATE MOCKTEST API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error("Could Not Add Mock Test")
    }

    result = response?.data?.data
    toast.success("Course Details Added Successfully", toastOptions)
  } catch (error) {
    //console.log("CREATE COURSE API ERROR............", error)
    toast.error(error.message, toastOptions)
  }
  toast.dismiss(toastId)
  return result
}

export const fetchInstructorMockTest = async (token) => {
  let result = []
  try {
    const response = await apiConnector(
      "GET",
      GET_INSTRUCTORS_MOCKTESTS,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    //console.log("INSTRUCTOR Mocktest API RESPONSE", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Instructor mocktest")
    }
    result = response?.data?.data
  } catch (error) {
    //console.log("INSTRUCTOR MockTest API ERROR............", error)
    toast.error(error.message, toastOptions)
  }
  return result
}

export const fetchAllMockTests = async (token) => {
  let result = []
  try {
    const response = await apiConnector(
      "GET",
      GET_MOCK_TEST_API,
      null,
      {
        Authorization: `Bearer ${token}`
      }
    )
    //console.log("ALL Mocktest API RESPONSE", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Mocktest")
    }
    result = response?.data?.data
    //console.log("ALL Mocktest API RESPONSE", result)
    return result
  } catch (error) {
    //console.log("ALL Mocktest API ERROR............", error)
    toast.error(error.message, toastOptions)
  }
}

export const fetchMockTestDetails = async (mockTestId, token) => {
  let result = null;
  const toastId = toast.loading("Loading...", toastOptions)
  //console.log(mockTestId)
  try {
    const response = await apiConnector(
      "GET",
      `${FETCH_MOCKTEST_BY_ID}/${mockTestId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    //console.log("MockTest Details API RESPONSE", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Mock Test Details")
    }
    result = response?.data?.data
  } catch (error) {
    //console.log("MockTest Details API ERROR............", error)
    toast.error(error.message, toastOptions)
  }
  toast.dismiss(toastId)
  return result
}

export const enrollInMockTest = async (mockTestId, token) => {
  const toastId = toast.loading("Loading...", toastOptions)
  let result = null;
  try {
    const response = await apiConnector(
      "POST",
      `${ENORLL_MOCKTEST}/${mockTestId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    //console.log("Enroll MockTest API RESPONSE", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Enroll in Mock Test")
    }
    result = response?.data?.data
    toast.success("Enrolled in Mock Test Successfully", toastOptions)
  } catch (error) {
    //console.log("Enroll MockTest API ERROR............", error)
    toast.error(error.message, toastOptions)
  }
  toast.dismiss(toastId)
  return result
}


export const fetchSeries = async (seriesId, token) => {
  const toastId = toast.loading("Loading...", toastOptions);
  let result = null;

  try {
    const response = await apiConnector(
      "GET",
      `${GET_MCOKTEST_SERIES_BY_ID}/${seriesId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    //console.log("Fetch Series API RESPONSE", response);

    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Mock Test Series");
    }

    result = response?.data?.data;
    toast.success("Mock Test Series Fetched Successfully", toastOptions);
  } catch (error) {
    //console.log("Fetch Series API ERROR............", error);
    toast.error(error.message, toastOptions);
  }

  toast.dismiss(toastId);
  return result;
};
