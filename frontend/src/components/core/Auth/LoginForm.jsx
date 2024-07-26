import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login, googleLogin } from "../../../services/operations/authAPI"; // Import googleLogin action
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
      <form onSubmit={handleOnSubmit} className="mt-8 space-y-6 w-full max-w-md mx-auto">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-100">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={handleOnChange}
            className="mt-1 block w-full px-3 py-2 bg-transparent text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-white focus:border-white"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-100">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={handleOnChange}
              className="block w-full px-3 py-2 bg-transparent text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-white focus:border-white"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400" />
              ) : (
                <AiOutlineEye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-slate-300 hover:text-slate-200">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-md font-medium text-white bg-black hover:bg-slate-900"
          >
            Sign In
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black text-gray-300">Or continue with</span>
          </div>
        </div>
        <div>
          <GoogleLogin 
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            useOneTap
            render={(renderProps) => (
              <button
                type="button"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
                className="w-full flex justify-center items-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-md font-medium text-white bg-transparent hover:bg-slate-900"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                Sign in with Google
              </button>
            )}
          />
        </div>
      </form>
    </GoogleOAuthProvider>
  );
}

export default LoginForm;
