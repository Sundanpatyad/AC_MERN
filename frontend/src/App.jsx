import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiArrowNarrowUp } from "react-icons/hi";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PageNotFound from "./pages/PageNotFound";
import CourseDetails from './pages/CourseDetails';
import Catalog from './pages/Catalog';
import ViewCourse from "./pages/ViewCourse";
import Mocktest from "./pages/Mocktest";
import MockTestDetails from "./pages/MockDetails";

import Navbar from "./components/common/Navbar";
import BottomBar from "./components/common/ButtomBar";
import PageLoader from "./components/ui/PageLoader";

import OpenRoute from "./components/core/Auth/OpenRoute";
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
import AddMockTestSeries from "./components/core/Dashboard/AddCourse/MockTestSeries";
import EditMockTestSeries from "./components/core/Dashboard/AddCourse/EditMockTest";

import RankingsPage from "./components/core/Rankings/Ranking";
import MockTestSeries from "./components/core/ConductMockTests/MockTestSeries";
import MockTestSeriesTest from "./components/core/ConductMockTests/MockTestsSeriesTest";
import VideoDetails from './components/core/ViewCourse/VideoDetails';

// Import chat componentsC
import { ACCOUNT_TYPE } from './utils/constants';
import ChatList from "./components/core/Chat/Chatlist";
import ChatWindow from "./components/core/Chat/ChatWindow";

function App() {
  const { user } = useSelector((state) => state.profile);
  const location = useLocation();
  const [showArrow, setShowArrow] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleArrow = () => {
    if (window.scrollY > 500) {
      setShowArrow(true);
    } else {
      setShowArrow(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleArrow);
    return () => {
      window.removeEventListener('scroll', handleArrow);
    };
  }, [showArrow]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading) {
    return <PageLoader />;
  }

  return (
    <div className="w-screen min-h-screen bg-black text-white flex flex-col font-inter">
      <Navbar />
      <button
        onClick={() => window.scrollTo(0, 0)}
        className={`bg-white hover:bg-gray-200 p-3 text-lg text-black rounded-2xl fixed right-3 z-10 transition-transform duration-500 ease-in-out ${showArrow ? 'bottom-20' : '-bottom-24'}`}
      >
        <HiArrowNarrowUp />
      </button>
      {token && <BottomBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="catalog/:catalogName" element={<Catalog />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />
        <Route path="/mock-test/:mockId" element={<MockTestDetails />} />
        
        {/* Chat Routes */}
        <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
        <Route path="/chat/:chatId" element={<ProtectedRoute><ChatWindow /></ProtectedRoute>} />
        
        <Route path="signup" element={<OpenRoute><Signup /></OpenRoute>} />
        <Route path="login" element={<OpenRoute><Login /></OpenRoute>} />
        <Route path="forgot-password" element={<OpenRoute><ForgotPassword /></OpenRoute>} />
        <Route path="verify-email" element={<OpenRoute><VerifyEmail /></OpenRoute>} />
        <Route path="update-password/:id" element={<OpenRoute><UpdatePassword /></OpenRoute>} />

        <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
          <Route path="dashboard/my-profile" element={<MyProfile />} />
          <Route path="dashboard/settings" element={<Settings />} />
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
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
              <Route path="dashboard/edit-mock-test-series/:seriesId" element={<EditMockTestSeries />} />
            </>
          )}
        </Route>

        <Route element={<ProtectedRoute><ViewCourse /></ProtectedRoute>}>
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <Route path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId" element={<VideoDetails />} />
          )}
        </Route>

        <Route path="/mocktest" element={<Mocktest />} />
        <Route path="view-mock/:mockId" element={<MockTestSeries />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
}

export default App;
