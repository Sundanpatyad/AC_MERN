import Footer from "../../common/Footer";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { motion } from "framer-motion";

function Template({ title, title1, description1, description2, formType }) {
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden font-outfit">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="flex-1 relative flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl"
        >
          {/* Glass Card */}
          <div className="glass border border-white/10 rounded-[2.5rem] p-8 md:p-12 lg:p-16 shadow-2xl relative overflow-hidden group">
            {/* Subtle inner glow */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 rounded-[2.5rem]" />

            <div className="relative">
              {formType === "signup" ? (
                <SignupForm />
              ) : (
                <LoginForm />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

export default Template;
