import React, { Suspense, lazy, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowNarrowUp } from "react-icons/hi";

import ProtectedRoute from "./components/core/Auth/ProtectedRoute";
import OpenRoute from "./components/core/Auth/OpenRoute";
import { ACCOUNT_TYPE } from "../src/utils/constants";
import BottomBar from "./components/common/ButtomBar";
import YourComponent from "./components/ui/InitialLoader";
import InstallApp from "./components/core/HomePage/installApp";
import PhoneWizardPage from "./components/core/HomePage/Phone";
import AdminCountMock from "./components/core/Admin/MockCountAdmin";
// import { checkAndVerifyPayment } from "./services/operations/studentFeaturesAPI";
import PrivacyPolicy from "./pages/PrivicyPolicy";
// import CookiePolicy from "./pages/CookiePolicy";
import TermsOfService from "./pages/Terms";
import { useTokenExpiry } from "./hooks/useTokenExpiry";

// Lazy-loaded components
const Navbar = lazy(() => import("./components/common/Navbar"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
const CourseDetails = lazy(() => import("./pages/CourseDetails"));
const Catalog = lazy(() => import("./pages/Catalog"));
const ViewCourse = lazy(() => import("./pages/ViewCourse"));
const Mocktest = lazy(() => import("./pages/Mocktest"));
const MockTestDetails = lazy(() => import("./pages/MockDetails"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyProfile = lazy(() => import("./components/core/Dashboard/MyProfile"));
const Settings = lazy(() =>
  import("./components/core/Dashboard/Settings/Settings")
);
const MyCourses = lazy(() => import("./components/core/Dashboard/MyCourses"));
const EditCourse = lazy(() =>
  import("./components/core/Dashboard/EditCourse/EditCourse")
);
const Instructor = lazy(() => import("./components/core/Dashboard/Instructor"));
const Cart = lazy(() => import("./components/core/Dashboard/Cart/Cart"));
const EnrolledCourses = lazy(() =>
  import("./components/core/Dashboard/EnrolledCourses")
);
const AddCourse = lazy(() =>
  import("./components/core/Dashboard/AddCourse/AddCourse")
);
const AddMockTestSeries = lazy(() =>
  import("./components/core/Dashboard/AddCourse/MockTestSeries")
);
const EditMockTestSeries = lazy(() =>
  import("./components/core/Dashboard/AddCourse/EditMockTest")
);
const RankingsPage = lazy(() => import("./components/core/Rankings/Ranking"));
const MockTestSeries = lazy(() =>
  import("./components/core/ConductMockTests/MockTestSeries")
);
const VideoDetails = lazy(() =>
  import("./components/core/ViewCourse/VideoDetails")
);
const ChatList = lazy(() => import("./components/core/Chat/Chatlist"));
const ChatWindow = lazy(() => import("./components/core/Chat/ChatWindow"));
const ExamList = lazy(() =>
  import("./components/core/StudyMaterials/ExamList")
);
const CreateContent = lazy(() =>
  import("./components/core/StudyMaterials/CreateContent")
);

function App() {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const location = useLocation();
  const [showArrow, setShowArrow] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showHome, setShowHome] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check token expiry and auto-logout
  useTokenExpiry();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleArrow = () => {
      setShowArrow(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleArrow);
    return () => window.removeEventListener("scroll", handleArrow);
  }, []);

  // useEffect(() => {
  //   if (token) {
  //     checkAndVerifyPayment(token, navigate, dispatch);
  //   }
  // }, []);

  // useEffect(() => {
  //   const timer = setTimeout(() => setShowHome(true), 1000);
  //   const pageLoadTimer = setTimeout(() => setIsPageLoading(false), 2300);

  //   return () => {
  //     clearTimeout(timer);
  //     clearTimeout(pageLoadTimer);
  //   };
  // }, []);

  return (
    <div className="w-screen min-h-screen bg-black text-white flex flex-col font-inter">
      {/* <AnimatePresence>
        {isPageLoading && (
          <motion.div
            key="loader"
            initial={{ y:'0%'}}
            exit={{ y: "-100%", }}
            transition={{ duration: 0.5 }}
            className="fixed"
          >
            <YourComponent />
          </motion.div>
        )}
      </AnimatePresence> */}

      <motion.div
        initial={{ opacity: 0 }} // Start from below the viewport
        animate={{ opacity: 1 }} // Slide to top
        transition={{ duration: 0.4, ease: "easeInOut" }} // Increase duration and add easing
        className="flex flex-col min-h-screen"
      >
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={""}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              {/* <Route path="/cookie-policy" element={<CookiePolicy />} /> */}
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/about" element={<About />} />
              <Route path="/rankings" element={<RankingsPage />} />
              <Route path="/rankings/:testName" element={<RankingsPage />} />
              <Route path="catalog/:catalogName" element={<Catalog />} />
              <Route path="courses/:courseId" element={<CourseDetails />} />
              <Route path="/mock-test/:mockId" element={<MockTestDetails />} />
              <Route path="/exams" element={<ExamList />} />

              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:chatId"
                element={
                  <ProtectedRoute>
                    <ChatWindow />
                  </ProtectedRoute>
                }
              />

              <Route
                path="signup"
                element={
                  <OpenRoute>
                    <Signup />
                  </OpenRoute>
                }
              />
              <Route
                path="login"
                element={
                  <OpenRoute>
                    <Login />
                  </OpenRoute>
                }
              />
              <Route
                path="forgot-password"
                element={
                  <OpenRoute>
                    <ForgotPassword />
                  </OpenRoute>
                }
              />
              <Route
                path="verify-email"
                element={
                  <OpenRoute>
                    <VerifyEmail />
                  </OpenRoute>
                }
              />
              <Route
                path="update-password/:id"
                element={
                  <OpenRoute>
                    <UpdatePassword />
                  </OpenRoute>
                }
              />

              <Route
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard/my-profile" element={<MyProfile />} />
                <Route path="dashboard/settings" element={<Settings />} />
                {user?.accountType === ACCOUNT_TYPE.STUDENT && (
                  <>
                    <Route path="dashboard/cart" element={<Cart />} />
                    <Route
                      path="dashboard/enrolled-courses"
                      element={<EnrolledCourses />}
                    />
                  </>
                )}
                {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
                  <>
                    <Route
                      path="dashboard/instructor"
                      element={<Instructor />}
                    />
                    <Route
                      path="dashboard/add-course"
                      element={<AddCourse />}
                    />
                    <Route
                      path="dashboard/add-mocktest"
                      element={<AddMockTestSeries />}
                    />
                    <Route
                      path="dashboard/my-courses"
                      element={<MyCourses />}
                    />
                    <Route
                      path="dashboard/edit-course/:courseId"
                      element={<EditCourse />}
                    />
                    <Route
                      path="dashboard/edit-mock-test-series/:seriesId"
                      element={<EditMockTestSeries />}
                    />
                    <Route
                      path="/createStudyMaterial"
                      element={<CreateContent />}
                    />
                  </>
                )}
              </Route>

              <Route
                element={
                  <ProtectedRoute>
                    <ViewCourse />
                  </ProtectedRoute>
                }
              >
                {user?.accountType === ACCOUNT_TYPE.STUDENT && (
                  <Route
                    path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                    element={<VideoDetails />}
                  />
                )}
              </Route>

              <Route path="/mocktest" element={<Mocktest />} />
              <Route path="view-mock/:mockId" element={<MockTestSeries />} />
              <Route path="adminMockTest" element={<AdminCountMock />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </main>
      </motion.div>

      {token && (
        <motion.div
          initial={{ y: "100%" }} // Start from below the viewport
          animate={{ y: "0%" }} // Slide up and fade in
          transition={{ duration: 0.7, ease: "easeInOut" }} // Smooth animation
          className="fixed bottom-0 w-full z-[999]"
        >
          <BottomBar />
        </motion.div>
      )}

      <button
        onClick={() => window.scrollTo(0, 0)}
        className={`bg-white hover:bg-gray-200 p-2 text-lg text-black rounded-2xl fixed left-3 z-10 transition-transform duration-500 ease-in-out ${showArrow ? "bottom-20" : "-bottom-24"
          }`}
      >
        <HiArrowNarrowUp />
      </button>
    </div>
  );
}

export default App;
