import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useQuery } from 'react-query'

import HighlightText from '../components/core/HomePage/HighlightText'
import InstructorSection from '../components/core/HomePage/InstructorSection'
import Footer from '../components/common/Footer'
import ReviewSlider from '../components/common/ReviewSlider'
import ConfirmationModal from "../components/common/ConfirmationModal"

import { getCatalogPageData } from '../services/operations/pageAndComponentData'
import { fetchAllMockTests } from '../services/operations/mocktest'
import { buyItem } from '../services/operations/studentFeaturesAPI'
import { addToCart, removeFromCart } from '../slices/cartSlice'

import { MdOutlineRateReview } from 'react-icons/md'
import { FaBookOpen, FaShoppingCart } from "react-icons/fa"
import { useScroll, useTransform } from 'framer-motion';

import { fadeIn } from '../components/common/motionFrameVarients'
import { ACCOUNT_TYPE } from "../utils/constants"

import CourseReviewModal from '../components/core/ViewCourse/CourseReviewModal'
import { Spotlight } from '../components/ui/Spotlight'
import Courses from '../components/core/HomePage/Courses'
import Marquee from '../components/core/HomePage/Marquee'
import { PlaceholdersAndVanishInputDemo } from '../components/ui/Search'
import { HoverBorderGradientDemo } from '../components/ui/homebutton'
import MockTestCard from '../components/core/HomePage/MockTestCard'
import AnimatedText from '../components/core/HomePage/AnimatedText'



const MockTestSkeleton = () => (
  <div className="bg-richblack-900 w-72 rounded-xl overflow-hidden shadow-lg flex flex-col animate-pulse">
    <div className="h-36 bg-richblack-700"></div>
    <div className="p-4 flex-grow flex flex-col justify-between">
      <div className="h-4 bg-richblack-700 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-richblack-700 rounded w-1/2 mb-3"></div>
      <div className="flex justify-between items-center mb-3">
        <div className="h-4 bg-richblack-700 rounded w-1/4"></div>
        <div className="h-4 bg-richblack-700 rounded w-1/4"></div>
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-richblack-700 rounded"></div>
        <div className="h-8 bg-richblack-700 rounded"></div>
      </div>
    </div>
  </div>
)



const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [reviewModal, setReviewModal] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)

  const categoryID = "66758c6b75de4ef02cd497d1";

  const { data: catalogPageData } = useQuery(
    ['catalogPageData', categoryID],
    () => getCatalogPageData(categoryID, dispatch),
    { staleTime: Infinity }
  )
  const { data: mockTests, isLoading: isMockTestsLoading } = useQuery(
    ['mockTests', token],
    () => fetchAllMockTests(token),
    {
      staleTime: Infinity,
      select: (data) => data.filter(test => test.status !== 'draft')
    }
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 1500) // Adjust this time as needed

    return () => clearTimeout(timer)
  }, [])

  const isLoggedIn = !!token

  const handleAddToCart = useCallback(async (mockTest) => {
    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors can't add mock tests to cart.")
      return
    }

    dispatch(addToCart(mockTest))
    toast.success("Added to cart successfully!")
  }, [user, dispatch])

  const handleRemoveFromCart = useCallback(async (mockTest) => {
    dispatch(removeFromCart(mockTest))
    toast.success("Removed from cart successfully!")
  }, [dispatch])

  const handleBuyNow = useCallback(async (mockTest) => {
    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors can't purchase mock tests.")
      return
    }

    try {
      await buyItem(token, [mockTest._id], ['MOCK_TEST'], user, navigate, dispatch)
    } catch (error) {
      console.error("Error purchasing mock test:", error)
      toast.error("Failed to purchase the mock test. Please try again.")
    }
  }, [token, user, navigate, dispatch])

  const handleStartTest = useCallback((mockTestId) => {
    navigate(`/view-mock/${mockTestId}`)
  }, [navigate])

  const MemoizedMockTestCard = useMemo(() => MockTestCard, [])
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 300], ['0%', '-100%']);
  const opacityText = useTransform(scrollY, [0, 300], [1, 0]);


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

      <div className='relative mx-auto flex flex-col w-11/12 max-w-full mt-10 items-center text-white justify-between'>
        <div className='text-3xl text-center lg:text-5xl font-semibold'>
          Courses <br /> That Make an <br />
          <HighlightText text={"Impact "} />
        </div>
        <p className='mt-2 w-[90%] text-center text-base lg:text-lg font-bold text-richblack-300'>
          Our courses are designed and taught by experts who have years of experience and are passionate about sharing their knowledge with you.
        </p>
        <div>
          <Courses catalogPageData={catalogPageData} />
        </div>

        <h2 className="text-3xl mt-20 font-bold text-richblack-5 mb-6">Popular Mock Tests</h2>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isMockTestsLoading
              ? Array(4).fill().map((_, index) => (
                <MockTestSkeleton key={index} />
              ))
              : mockTests
                ?.slice(0, 4) // Get the latest 4 mock tests
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt in descending order
                .map((mockTest) => (
                  <MemoizedMockTestCard
                    key={mockTest._id}
                    mockTest={mockTest}
                    handleAddToCart={handleAddToCart}
                    handleRemoveFromCart={handleRemoveFromCart}
                    handleBuyNow={handleBuyNow}
                    handleStartTest={handleStartTest}
                    setShowLoginModal={setShowLoginModal}
                    isLoggedIn={isLoggedIn}
                    userId={user?._id}
                  />
                ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/mocktest"
              className="bg-zinc-900 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block"
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
                <span>View All MockTests</span>
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
          </div>
          {!isMockTestsLoading && mockTests?.length === 0 && (
            <p className="text-center text-gray-400 mt-8">No mock tests available.</p>
          )}
        </div>
      </div>
           
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