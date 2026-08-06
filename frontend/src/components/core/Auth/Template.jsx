import { Link } from "react-router-dom";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const panelBackground = {
  backgroundImage: [
    "radial-gradient(120% 100% at 18% 8%, #8a8a8a 0%, transparent 52%)",
    "radial-gradient(90% 80% at 88% 18%, #5c5c5c 0%, transparent 55%)",
    "radial-gradient(120% 110% at 60% 105%, #0b0b0b 0%, transparent 62%)",
    "linear-gradient(155deg, #454545 0%, #121212 72%)",
  ].join(", "),
};

function Template({ formType }) {
  const isSignup = formType === "signup";

  return (
    <div className="min-h-[calc(100dvh-4rem)] w-full bg-page grid lg:grid-cols-2 font-outfit">
      <div
        className="relative hidden lg:flex flex-col justify-end p-12 xl:p-16 overflow-hidden"
        style={panelBackground}
      >
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="relative z-10 space-y-4 max-w-md">
          <p className="text-sm font-medium text-white/70">You can easily</p>
          <p className="text-3xl xl:text-4xl font-semibold text-white leading-snug tracking-tight">
            Get access to courses, mock tests, and your progress in one place
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm mx-auto"
        >
          {isSignup ? <SignupForm /> : <LoginForm />}

          <p className="mt-8 text-center text-sm text-muted">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-fg hover:underline underline-offset-4"
                >
                  Log in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-fg hover:underline underline-offset-4"
                >
                  Create an account
                </Link>
              </>
            )}
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-subtle hover:text-fg transition-colors"
            >
              <ArrowLeft size={14} />
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Template;
