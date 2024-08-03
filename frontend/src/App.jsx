import { useEffect, useState } from "react";
import { Route, Routes, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from 'framer-motion';
import ReactTypingEffect from 'react-typing-effect';

import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PageNotFound from "./pages/PageNotFound";
import CourseDetails from './pages/CourseDetails';
import Catalog from './pages/Catalog';
 
import Navbar from "./components/common/Navbar"

import OpenRoute from "./components/core/Auth/OpenRoute"
import ProtectedRoute from "./components/core/Auth/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Settings from "./components/core/Dashboard/Settings/Settings";
import MyCourses from './components/core/Dashboard/MyCourses';
import EditCourse from './components/core/Dashboard/EditCourse/EditCourse';
import Instructor from './components/core/Dashboard/Instructor';

import Cart from "./components/core/Dashboard/Cart/Cart";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import AddCourse from "./components/core/Dashboard/AddCourse/AddCourse";

import ViewCourse from "./pages/ViewCourse";
import VideoDetails from './components/core/ViewCourse/VideoDetails';

import { ACCOUNT_TYPE } from './utils/constants';

import { HiArrowNarrowUp } from "react-icons/hi"
import Mocktest from "./pages/Mocktest";
import AddMockTest from "./components/core/Dashboard/AddCourse/AddMockTest";
import ViewMockTest from "./components/core/Dashboard/AddCourse/ViewMockTest";
import AddMockTestSeries from "./components/core/Dashboard/AddCourse/MockTestSeries";
import MockTestProductPage from "./pages/MockDetails";
import MockTestDetails from "./pages/MockDetails";
import MockTestSeries from "./components/core/ConductMockTests/MockTestSeries";
import EditMockTestSeries from "./components/core/Dashboard/AddCourse/EditMockTest";
import RankingsPage from "./components/core/Rankings/Ranking";




const PageLoader = () => {
  const [isSun, setIsSun] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsSun(prev => !prev);
    }, 3000); // Toggle every 3 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stars */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{
            opacity: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Moon/Sun */}
      <motion.div
        className="relative w-32 h-32 rounded-full overflow-hidden"
        animate={{
          backgroundColor: isSun ? '#FDB813' : '#C6C6C6',
          boxShadow: isSun 
            ? ['0 0 20px 0px #FDB813', '0 0 60px 10px #FDB813', '0 0 100px 20px #FDB813']
            : ['0 0 20px 0px #718096', '0 0 40px 10px #718096', '0 0 20px 0px #718096'],
        }}
        transition={{
          duration: 1,
          ease: 'easeInOut',
        }}
      >
        {/* Craters/Sunspots */}
        {!isSun && (
          <>
            <motion.div
              className="absolute w-8 h-8 bg-gray-400 rounded-full"
              style={{ top: '20%', left: '15%' }}
            />
            <motion.div
              className="absolute w-6 h-6 bg-gray-400 rounded-full"
              style={{ bottom: '30%', right: '20%' }}
            />
            <motion.div
              className="absolute w-4 h-4 bg-gray-400 rounded-full"
              style={{ top: '60%', left: '40%' }}
            />
          </>
        )}
        {isSun && (
          <>
            <motion.div
              className="absolute w-full h-full"
              style={{
                background: 'radial-gradient(circle, #FDB813 0%, #FDB813 50%, #f7931e 100%)',
              }}
            />
            <motion.div
              className="absolute w-full h-full"
              style={{
                background: 'repeating-conic-gradient(from 0deg, #f7931e 0deg 10deg, transparent 10deg 20deg)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )}
      </motion.div>

      {/* Loading text */}
      <motion.div
        className="absolute bottom-16 text-white text-2xl font-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          className="text-3xl"
        >
          Awakening Classes 
        </motion.span>
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        >
          .
        </motion.span>
      </motion.div>
    </motion.div>
  );
};




function App() {
  const { user } = useSelector((state) => state.profile)
  const location = useLocation();
  const [showArrow, setShowArrow] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname])

  useEffect(() => {
    scrollTo(0, 0);
  }, [location])

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  const handleArrow = () => {
    if (window.scrollY > 500) {
      setShowArrow(true)
    } else setShowArrow(false)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleArrow);
    return () => {
      window.removeEventListener('scroll', handleArrow);
    }
  }, [showArrow])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 1500) // Adjust this time as needed

    return () => clearTimeout(timer)
  }, [])

  if (isPageLoading) {
    return <PageLoader />
  }

  return (
    <div className="w-screen min-h-screen bg-black flex flex-col font-inter">
      <Navbar />

      <button onClick={() => window.scrollTo(0, 0)}
        className={`bg-white hover:bg-white hover:scale-110 p-3 text-lg text-black rounded-2xl fixed right-3 z-10 duration-500 ease-in-out ${showArrow ? 'bottom-6' : '-bottom-24'} `} >
        <HiArrowNarrowUp />
      </button>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="catalog/:catalogName" element={<Catalog />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />
        <Route path="/mock-test/:mockId" element={<MockTestDetails />} />

        <Route
          path="signup" element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />

        <Route
          path="login" element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />

        <Route
          path="forgot-password" element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />

        <Route
          path="verify-email" element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />

        <Route
          path="update-password/:id" element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />

        <Route element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
        >
          <Route path="dashboard/my-profile" element={<MyProfile />} />
          <Route path="dashboard/Settings" element={<Settings />} />

          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route path="dashboard/cart" element={<Cart />} />
              <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
            </>
          )}

          {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              <Route path="dashboard/instructor" element={<Instructor />} />
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route path="dashboard/add-mocktest" element={<AddMockTestSeries />} />
              <Route path="dashboard/add-mocktest/:id" element={<AddMockTest />} />
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
              <Route path="dashboard/edit-mock-test-series/:seriesId" element={<EditMockTestSeries />} />
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
          <>
            <Route
            path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
            element={<VideoDetails />}
          /> 
          </>
          )}
        </Route>
        <Route
              path="/mockTest"
              element={<Mocktest/>}
            />
        
        <Route
            path="view-mock/:mockId"
            element={<MockTestSeries />}
          />
        <Route path="*" element={<PageNotFound />} />

      </Routes>

    </div>
  );
}

export default App;