import React, { useState } from 'react'
import { useNavigate } from "react-router-dom"
import { useSelector } from 'react-redux'
import InstructorSection from '../components/core/HomePage/InstructorSection'
import Footer from '../components/common/Footer'
import ReviewSlider from '../components/common/ReviewSlider'
import ConfirmationModal from "../components/common/ConfirmationModal"
import { MdOutlineRateReview } from 'react-icons/md'
import CourseReviewModal from '../components/core/ViewCourse/CourseReviewModal'
import Marquee from '../components/core/HomePage/Marquee'
import MockTestSection from '../components/core/HomePage/MockTestSection'
import CourseSection from '../components/core/HomePage/CourseSection'
import HeroSection from '../components/core/HomePage/HeroSection'


const Home = () => {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [reviewModal, setReviewModal] = useState(false)




  return (
    <div className='overflow-hidden w-[100vw]'>
     <HeroSection/>
      <CourseSection />
      <MockTestSection setShowLoginModal={setShowLoginModal} />
       <div className='mt-14 w-11/12 mx-auto max-w-full flex-col items-center justify-between gap-8 first-letter bg-black text-white'>
        <InstructorSection />
         <h1 className="text-center text-3xl lg:text-4xl font-semibold mt-8 flex justify-center items-center gap-x-3">
          Reviews from other learners
          {/* <MdOutlineRateReview onClick={() => setReviewModal(true)} className='text-white' /> */}
        </h1>
         <ReviewSlider />
      </div>
      <Marquee /><Footer />
      {token && reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
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
  )
}

export default React.memo(Home)