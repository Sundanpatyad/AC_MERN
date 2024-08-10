import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import HighlightText from '../components/core/HomePage/HighlightText'
import InstructorSection from '../components/core/HomePage/InstructorSection'
import Footer from '../components/common/Footer'
import ReviewSlider from '../components/common/ReviewSlider'
import ConfirmationModal from "../components/common/ConfirmationModal"
import { MdOutlineRateReview } from 'react-icons/md'
import { fadeIn } from '../components/common/motionFrameVarients'
import CourseReviewModal from '../components/core/ViewCourse/CourseReviewModal'
import { Spotlight } from '../components/ui/Spotlight'
import Marquee from '../components/core/HomePage/Marquee'
import { HoverBorderGradientDemo } from '../components/ui/homebutton'
import AnimatedText from '../components/core/HomePage/AnimatedText'
import MockTestSection from '../components/core/HomePage/MockTestSection'
import CourseSection from '../components/core/HomePage/CourseSection'

const Home = () => {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [reviewModal, setReviewModal] = useState(false)




  return (
    <div className='overflow-hidden w-[100vw]'>
      <Spotlight />
      <div className='h-[100vh] w-full dark:bg-black bg-slate-300 dark:bg-grid-slate-400/[0.2] bg-grid-black/[0.2] relative flex items-center flex-col'>
        <div className="absolute cursor-pointer inset-0 w-full h-full bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]"></div>

        <Link to={"/mocktest"} className="bg-zinc-900 no-underline mt-20 group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block">
          <span className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </span>
          <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
            <span>
              MockTests
            </span>
            <svg
              fill="none"
              height="16"
              viewBox="0 0 24 24"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.75 8.75L14.25 12L10.75 15.25"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
        </Link>

        <motion.div
          id='heading-hero'
          variants={fadeIn('left', 0.1)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.1 }}
          className='text-center z-20 text-gray-200 text-4xl mt-6 font-semibold w-80 lg:w-full lg:text-8xl'
        >
          We Know That <br />
          Together <i>
            <AnimatedText
              texts={['We', 'Yes', 'We']}
              interval={1500}
            />
          </i> Can<br />
          <HighlightText text={"Awakening Classes"} />
        </motion.div>

        <motion.div
          variants={fadeIn('right', 0.1)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.1 }}
          className='mt-2 w-[80%] text-center text-base lg:text-lg font-bold text-slate-200'
        >
          With our online courses, you can learn at your own pace, from anywhere in the world, and get access to a wealth of resources, quizzes, and personalized feedback from instructors.
        </motion.div>

        {token ?
          <>
            <Link to={"/login"}>
              <HoverBorderGradientDemo title={"Explore More"} />
            </Link>
          </>
          :
          <div className=' flex gap-x-4'>
            <Link to={"/login"}>
              <HoverBorderGradientDemo title={"Login "} />
            </Link>

            <Link to={"/signup"} >
              <HoverBorderGradientDemo title={"Signup For Free"} />
            </Link>
          </div>
        }
        <div className="w-full mt-10 md:mt-20 overflow-hidden">
        </div>
      </div>

      <CourseSection />

      <MockTestSection setShowLoginModal={setShowLoginModal} />
           
      <div className='mt-14 w-11/12 mx-auto max-w-full flex-col items-center justify-between gap-8 first-letter bg-black text-white'>
        <InstructorSection />

        <h1 className="text-center text-3xl lg:text-4xl font-semibold mt-8 flex justify-center items-center gap-x-3">
          Reviews from other learners
          <MdOutlineRateReview onClick={() => setReviewModal(true)} className='text-white' />
        </h1>

        <ReviewSlider />
      </div>
      <Marquee />

      <Footer />
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