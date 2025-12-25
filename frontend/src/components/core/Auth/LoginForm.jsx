import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../../../services/operations/authAPI";
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';

function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        // Create a credential-like object for your backend
        dispatch(googleLogin(tokenResponse.access_token, navigate));
      } catch (error) {
        console.error("Google Sign-In Failed", error);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      console.error("Google Sign-In Failed");
      setIsLoading(false);
    },
  });

  return (
    <GoogleOAuthProvider clientId="217412143147-6l1q2l190t36rp0452f3hl5mtl3nrhjq.apps.googleusercontent.com">
      <div className="flex flex-col items-center justify-center w-full min-h-[500px] px-4 sm:px-6 lg:px-8">
        {/* Premium Container */}
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6 px-4">
              Continue your learning journey
            </p>

            {/* Tagline */}
            <div className="max-w-sm mx-auto px-4">
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-center">
                Pick up right where you left off and keep building your skills with our comprehensive courses
              </p>
            </div>
          </div>

          {/* Custom Google Login Button */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <button
              onClick={() => login()}
              disabled={isLoading}
              className="group relative flex items-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Subtle glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur opacity-0 group-hover:opacity-25 transition-opacity duration-200"></div>

              <div className="relative flex items-center gap-3">
                {/* Google Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>

                <span className="text-sm font-medium">
                  {isLoading ? "Signing in..." : "Continue with Google"}
                </span>
              </div>
            </button>
          </div>

          {/* Features */}
          <div className="space-y-2.5 sm:space-y-3 mb-8 sm:mb-10 px-4 sm:px-0">
            <div className="flex items-start gap-3 justify-center">
              <div className="mt-1 w-1 h-1 rounded-full bg-gray-600 flex-shrink-0"></div>
              <p className="text-xs text-gray-600 text-center sm:text-left">Resume your courses and track progress</p>
            </div>
            <div className="flex items-start gap-3 justify-center">
              <div className="mt-1 w-1 h-1 rounded-full bg-gray-600 flex-shrink-0"></div>
              <p className="text-xs text-gray-600 text-center sm:text-left">Access your personalized dashboard</p>
            </div>
            <div className="flex items-start gap-3 justify-center">
              <div className="mt-1 w-1 h-1 rounded-full bg-gray-600 flex-shrink-0"></div>
              <p className="text-xs text-gray-600 text-center sm:text-left">Continue practicing with mock tests</p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-gray-600 text-xs mb-6 sm:mb-8">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secured by Google</span>
          </div>

          {/* Divider */}
          <div className="pt-6 sm:pt-8 border-t border-gray-900 px-4 sm:px-0">
            <p className="text-center text-xs text-gray-700 leading-relaxed">
              By continuing, you agree to our{" "}
              <button className="text-gray-500 hover:text-white transition-colors underline-offset-2 hover:underline">
                Terms
              </button>
              {" "}and{" "}
              <button className="text-gray-500 hover:text-white transition-colors underline-offset-2 hover:underline">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default LoginForm;