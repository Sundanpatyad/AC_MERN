import { toast } from "react-hot-toast"

import { setLoading, setToken } from "../../slices/authSlice"
import { resetCart } from "../../slices/cartSlice"
import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { endpoints } from "../apis"
import { loadGapiInsideDOM } from "gapi-script";


const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  GOOGLE_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
} = endpoints

// ================ send Otp ================
export function sendOtp(email, navigate) {
  return async (dispatch) => {

    const toastId = toast.loading("Loading...", {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
    dispatch(setLoading(true));

    try {
      const response = await apiConnector("POST", SENDOTP_API, {
        email,
        checkUserPresent: true,
      })

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      navigate("/verify-email");
      toast.success("OTP Sent Successfully", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch (error) {
      console.log("SENDOTP API ERROR --> ", error);
      toast.error(error.response.data?.message, {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
}

// ================ sign Up ================
export function signUp(accountType, firstName, lastName, email, password, confirmPassword, otp, navigate) {
  return async (dispatch) => {

    const toastId = toast.loading("Loading...", {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", SIGNUP_API, {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
      })

      if (!response.data.success) {
        toast.error(response.data.message, {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        throw new Error(response.data.message);
      }

      toast.success("Signup Successful", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      navigate("/login");
    } catch (error) {
      console.log("SIGNUP API ERROR --> ", error);
      toast.error("Invalid OTP", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}


// ================ Login ================
export function login(email, password, navigate) {
  return async (dispatch) => {

    const toastId = toast.loading("Loading...", {
      icon: '👏',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
    dispatch(setLoading(true));

    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      })

      console.log("LOGIN API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast('Login Successful', {
        icon: '👏',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      dispatch(setToken(response.data.token))

      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`

      dispatch(setUser({ ...response.data.user, image: userImage }));
      localStorage.setItem("token", JSON.stringify(response.data?.token));
      localStorage.setItem("user", JSON.stringify({ ...response.data.user, image: userImage }));

      navigate("/dashboard/my-profile");
    } catch (error) {
      console.log("LOGIN API ERROR.......", error)
      toast.error(error.response?.data?.message, {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}


// ================ get Password Reset Token ================
export function getPasswordResetToken(email, setEmailSent) {
  return async (dispatch) => {

    const toastId = toast.loading("Loading...", {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", RESETPASSTOKEN_API, {
        email,
      })

      console.log("RESET PASS TOKEN RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Reset Email Sent", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      setEmailSent(true)
    } catch (error) {
      console.log("RESET PASS TOKEN ERROR............", error)
      toast.error(error.response?.data?.message, {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}


// ================ reset Password ================
export function resetPassword(password, confirmPassword, token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...", {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
    dispatch(setLoading(true))

    try {
      const response = await apiConnector("POST", RESETPASSWORD_API, {
        password,
        confirmPassword,
        token,
      })

      console.log("RESETPASSWORD RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Password Reset Successfully", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      navigate("/login")
    } catch (error) {
      console.log("RESETPASSWORD ERROR............", error)
      toast.error(error.response?.data?.message, {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}


// ================ Logout ================
export function logout(navigate) {
  return (dispatch) => {
    dispatch(setToken(null))
    dispatch(setUser(null))
    dispatch(resetCart())
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Logged Out", {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
    navigate("/")
  }
}

export const googleLogin = (credential, navigate) => {
  return async (dispatch) => {
    try {
      const toastId = toast.loading("Loading...", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      
      const response = await apiConnector("POST", GOOGLE_API, { token: credential });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      console.log(response.data);
      const { token, user: userData } = response.data;

      dispatch(setToken(token));

      const userImage = userData?.image
        ? userData.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${userData.firstName} ${userData.lastName}`;

      dispatch(setUser({ ...userData, image: userImage }));
      localStorage.setItem("token", JSON.stringify(token));
      localStorage.setItem("user", JSON.stringify({ ...userData, image: userImage }));
      toast.dismiss(toastId)
      toast('Login Successful', {
        icon: '👏',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      navigate("/dashboard/my-profile");

    } catch (error) {
      console.log("Error in Google Login", error);
      toast.error("Google Login Failed", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  };
};