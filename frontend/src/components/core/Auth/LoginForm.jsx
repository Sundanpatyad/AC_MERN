import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login, googleLogin } from "../../../services/operations/authAPI";
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';

function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    dispatch(login(email, password, navigate));
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential, navigate));
  };

  const handleGoogleLoginError = () => {
    console.error("Google Sign-In Failed");
  };

  return (
    <GoogleOAuthProvider clientId="217412143147-6l1q2l190t36rp0452f3hl5mtl3nrhjq.apps.googleusercontent.com">
      <form onSubmit={handleOnSubmit} className="flex w-full flex-col gap-y-4">
        <label className="w-full">
          <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
            Email Address <sup className="text-pink-200">*</sup>
          </p>
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={handleOnChange}
            placeholder="Enter email address"
            className="w-full rounded-[0.5rem] bg-black p-[12px] text-richblack-5 outline-none"
            style={{
              boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
            }}
          />
        </label>

        <label className="relative w-full">
          <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
            Password <sup className="text-pink-200">*</sup>
          </p>
          <input
            required
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={handleOnChange}
            placeholder="Enter Password"
            className="w-full rounded-[0.5rem] bg-black p-[12px] pr-10 text-richblack-5 outline-none"
            style={{
              boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
            }}
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[38px] z-[10] cursor-pointer"
          >
            {showPassword ? (
              <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
            ) : (
              <AiOutlineEye fontSize={24} fill="#AFB2BF" />
            )}
          </span>
        </label>

        <Link to="/forgot-password" className="text-xs text-blue-500 ml-auto">
          Forgot Password?
        </Link>

        <button
          type="submit"
          className="mt-6 rounded-[8px] bg-transparent border bg-white py-[8px] px-[12px] font-medium text-black text-md"
        >
          Sign In
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-300">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
   <div className="flex align-center justify-center">
        <GoogleLogin 
          onSuccess={handleGoogleLoginSuccess}
          onError={handleGoogleLoginError}
          theme="dark"
          useOneTap
          render={({ onClick }) => (
            <button
              onClick={onClick}
              className="w-full text-center flex justify-center items-center py-[8px] px-[12px] border border-slate-300 rounded-[8px] text-md font-medium text-white bg-black hover:bg-slate-900"
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Sign in with Google
            </button>
          )}
        />
        </div>

        <p className="mt-4 text-center text-richblack-5">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </GoogleOAuthProvider>
  );
}

export default LoginForm;