import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import Footer from '../components/common/Footer';
import ReviewSlider from '../components/common/ReviewSlider';
import ConfirmationModal from "../components/common/ConfirmationModal";
import HeroSection from '../components/core/HomePage/HeroSection'
const MockTestSection = lazy(() => import('../components/core/HomePage/MockTestSection'));
const CourseSection = lazy(() => import('../components/core/HomePage/CourseSection'));
const InstructorSection = lazy(() => import('../components/core/HomePage/InstructorSection'));
const CourseReviewModal = lazy(() => import('../components/core/ViewCourse/CourseReviewModal'));

const Home = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);

  return (
    <div className='overflow-hidden w-[100vw]'>
        <HeroSection />
      <Suspense fallback={""}>
        <MockTestSection setShowLoginModal={setShowLoginModal} />
        <CourseSection setShowLoginModal={setShowLoginModal} />
      </Suspense>
      <div className='mt-14 w-11/12 mx-auto max-w-full flex-col items-center justify-between gap-8 first-letter bg-transparent text-white'>
        <Suspense fallback={""}>
          <InstructorSection />
        </Suspense>
       
      </div>
      <ReviewSlider />
      <Footer />
      {token && reviewModal && (
        <Suspense fallback={""}>
          <CourseReviewModal setReviewModal={setReviewModal} />
        </Suspense>
      )}
      {showLoginModal && (
        <ConfirmationModal
          modalData={{
            title: "You are not logged in",
            text1: "Please log in to continue.",
            btn1Text: "Login",
            btn2Text: "Cancel",
            btn1Handler: () => navigate("/login"),
            btn2Handler: () => setShowLoginModal(false),
          }}
        />
      )}
    </div>
  );
};

export default React.memo(Home);
