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

const PageLoader = () => (
  <motion.div 
    className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
    initial={{ background: "linear-gradient(45deg, #000000, #1a1a1a)" }}
    animate={{ 
      background: [
        "linear-gradient(45deg, #000000, #1a1a1a)",
        "linear-gradient(45deg, #1a1a1a, #2c2c2c)",
        "linear-gradient(45deg, #2c2c2c, #3d3d3d)",
        "linear-gradient(45deg, #3d3d3d, #1a1a1a)",
        "linear-gradient(45deg, #1a1a1a, #000000)"
      ]
    }}
    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 1, type: "spring", stiffness: 100 }}
      className="text-3xl font-extrabold text-white mb-6 font-serif"
    >
      <ReactTypingEffect
        text="Awakening Classes"
        typingDelay={100}
        speed={50}
        eraseDelay={10000000}
        cursorRenderer={cursor => <span className="text-blue-100">{cursor}</span>}
      />
    </motion.div>

    <motion.div
      initial={{ width: 0 }}
      animate={{ width: '300px' }}
      transition={{ duration: 1.5, delay: 1, type: "spring", stiffness: 50 }}
      className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 mb-6 rounded-full"
    />

    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 2.5, type: "spring", stiffness: 100 }}
      className="text-2xl text-white mb-8 font-light italic"
    >
      <ReactTypingEffect
        text="Together We Can"
        typingDelay={100}
        speed={50}
        eraseDelay={10000000}
        cursorRenderer={cursor => <span className="text-pink-500">{cursor}</span>}
      />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
      className="w-16 h-16 border-t-4 border-purple-500 rounded-full animate-spin"
    />
  </motion.div>
);

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