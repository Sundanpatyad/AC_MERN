import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';
import PageLoader from './components/ui/PageLoader';
import { HiArrowNarrowUp } from 'react-icons/hi';
import ProtectedRoute from './components/core/Auth/ProtectedRoute';
import OpenRoute from './components/core/Auth/OpenRoute'; // <-- Import OpenRoute here
import { ACCOUNT_TYPE } from '../src/utils/constants';
import BottomBar from './components/common/ButtomBar';
import YourComponent from './components/ui/InitialLoader';

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
const CourseDetails = lazy(() => import('./pages/CourseDetails'));
const Catalog = lazy(() => import('./pages/Catalog'));
const ViewCourse = lazy(() => import("./pages/ViewCourse"));
const Mocktest = lazy(() => import("./pages/Mocktest"));
const MockTestDetails = lazy(() => import("./pages/MockDetails"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyProfile = lazy(() => import("./components/core/Dashboard/MyProfile"));
const Settings = lazy(() => import("./components/core/Dashboard/Settings/Settings"));
const MyCourses = lazy(() => import('./components/core/Dashboard/MyCourses'));
const EditCourse = lazy(() => import('./components/core/Dashboard/EditCourse/EditCourse'));
const Instructor = lazy(() => import('./components/core/Dashboard/Instructor'));
const Cart = lazy(() => import("./components/core/Dashboard/Cart/Cart"));
const EnrolledCourses = lazy(() => import("./components/core/Dashboard/EnrolledCourses"));
const AddCourse = lazy(() => import("./components/core/Dashboard/AddCourse/AddCourse"));
const AddMockTestSeries = lazy(() => import("./components/core/Dashboard/AddCourse/MockTestSeries"));
const EditMockTestSeries = lazy(() => import("./components/core/Dashboard/AddCourse/EditMockTest"));
const RankingsPage = lazy(() => import("./components/core/Rankings/Ranking"));
const MockTestSeries = lazy(() => import("./components/core/ConductMockTests/MockTestSeries"));
const VideoDetails = lazy(() => import('./components/core/ViewCourse/VideoDetails'));

const ChatList = lazy(() => import("./components/core/Chat/Chatlist"));
const ChatWindow = lazy(() => import("./components/core/Chat/ChatWindow"));
const ExamList = lazy(() => import("./components/core/StudyMaterials/ExamList"));
const CreateContent = lazy(() => import("./components/core/StudyMaterials/CreateContent"));


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
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading) {
    return <YourComponent/>;
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
      <Suspense fallback={""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="catalog/:catalogName" element={<Catalog />} />
          <Route path="courses/:courseId" element={<CourseDetails />} />
          <Route path="/mock-test/:mockId" element={<MockTestDetails />} />
          <Route path="/exams" element={<ExamList />} />
          
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
                <Route path="/createStudyMaterial" element={<CreateContent />} />
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
      </Suspense>
    </div>
  );
}

export default App;
