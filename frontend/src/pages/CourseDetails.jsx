import React, { useEffect, useState } from "react"
import { BiInfoCircle } from "react-icons/bi"
import { HiOutlineGlobeAlt } from "react-icons/hi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import ConfirmationModal from "../components/common/ConfirmationModal"
import Footer from "../components/common/Footer"
import RatingStars from "../components/common/RatingStars"
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar"
import CourseDetailsCard from "../components/core/Course/CourseDetailsCard"
import { formatDate } from "../services/formatDate"
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI"
import { buyItem } from "../services/operations/studentFeaturesAPI"

import GetAvgRating from "../utils/avgRating"
import { ACCOUNT_TYPE } from './../utils/constants';
import { addToCart } from "../slices/cartSlice"

import { GiReturnArrow } from 'react-icons/gi'
import { MdOutlineVerified } from 'react-icons/md'
import Img from './../components/common/Img';
import toast from "react-hot-toast"
import LoadingSpinner from "../components/core/ConductMockTests/Spinner"

function CourseDetails() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.profile)
  const { paymentLoading } = useSelector((state) => state.course)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { courseId } = useParams()
  const [response, setResponse] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  const [isActive, setIsActive] = useState(Array(0))
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0)
  const [isUserEnrolled, setIsUserEnrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCourseDetailsData = async () => {
      setIsLoading(true)
      try {
        const res = await fetchCourseDetails(courseId)
        setResponse(res)
        // Check if user is enrolled
        if (user && res.data?.courseDetails?.studentsEnrolled) {
          setIsUserEnrolled(res.data.courseDetails.studentsEnrolled.includes(user._id))
        }
      } catch (error) {
        console.log("Could not fetch Course Details")
      } finally {
        setIsLoading(false)
      }
    }
    fetchCourseDetailsData();
  }, [courseId, user])

  useEffect(() => {
    const count = GetAvgRating(response?.data?.courseDetails.ratingAndReviews)
    setAvgReviewCount(count)
  }, [response])

  useEffect(() => {
    let lectures = 0
    response?.data?.courseDetails?.courseContent?.forEach((sec) => {
      lectures += sec.subSection.length || 0
    })
    setTotalNoOfLectures(lectures)
  }, [response])

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  const handleActive = (id) => {
    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id])
        : isActive.filter((e) => e != id)
    )
  }

  if (isLoading || paymentLoading || loading) {
    return (
      <LoadingSpinner title={"Loading Course Details"}/>
    )
  }

  if (!response) {
    return <div className="text-center mt-8">No course details available.</div>
  }

  const {
    _id: course_id,
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
    tag
  } = response.data.courseDetails

  const handleBuyCourse = () => {
    if (token) {
      const coursesId = [courseId]
      buyItem(token, coursesId, user, navigate, dispatch)
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to Purchase Course.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    if (token) {
      dispatch(addToCart(response.data.courseDetails))
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  const handleGoToCourse = () => {
    navigate(`/dashboard/enrolled-courses`)
  }

  return (
    <>
      <div className="relative w-full bg-black">
        <div className="mx-auto box-content px-4 lg:w-[1260px] 2xl:relative">
          <div className="mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]">
          
            <div className="relative block max-h-[30rem] lg:hidden">
              <Img
                src={thumbnail}
                alt="course thumbnail"
                className="aspect-auto w-full rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 h-full w-full shadow-[#161D29_0px_-64px_36px_-28px_inset]"></div>
            </div>
            <div className="mb-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5">
              <h1 className="text-4xl font-bold text-richblack-5 sm:text-[42px]">{courseName}</h1>
              <p className='text-richblack-200 text-xs'>{courseDescription}</p>
              <div className="text-md flex flex-wrap items-center gap-2">
                <span className="text-white">{avgReviewCount}</span>
                <RatingStars Review_Count={avgReviewCount} Star_Size={24} />
                <span>{`(${ratingAndReviews.length} reviews)`}</span>
                <span>{`${studentsEnrolled.length} students enrolled`}</span>
              </div>
              <p className="capitalize">
                Created By <span className="font-semibold underline">{instructor.firstName} {instructor.lastName}</span>
              </p>
              <div className="flex flex-wrap gap-5 text-lg">
                <p className="flex items-center gap-2">
                  <BiInfoCircle /> Created at {formatDate(createdAt)}
                </p>
                <p className="flex items-center gap-2">
                  <HiOutlineGlobeAlt /> English
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-4 border-y border-y-richblack-500 py-4 lg:hidden">
              <p className="space-x-3 pb-4 text-3xl font-semibold text-richblack-5">Rs. {price}</p>
              {isUserEnrolled ? (
                <button 
                  className="bg-white text-richblack-900 font-semibold py-2 px-4 rounded-lg hover:bg-richblack-900 hover:text-white transition-all duration-200"
                  onClick={handleGoToCourse}
                >
                  Go to Course
                </button>
              ) : (
                <>
                  <button 
                    className="bg-white text-richblack-900 font-semibold py-2 px-4 rounded-lg hover:bg-richblack-900 hover:text-white transition-all duration-200"
                    onClick={handleBuyCourse}
                  >
                    Buy Now
                  </button>
                  <button 
                    onClick={handleAddToCart} 
                    className="bg-richblack-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-richblack-600 transition-all duration-200"
                  >
                    Add to Cart
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="right-[1.5rem] top-[60px] mx-auto hidden lg:block lg:absolute min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0">
            <CourseDetailsCard
              course={response?.data?.courseDetails}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
              handleAddToCart={handleAddToCart}
              isUserEnrolled={isUserEnrolled}
              handleGoToCourse={handleGoToCourse}
            />
          </div>
        </div>
      </div>
      <div className="mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
          <div className="my-8 border border-richblack-600 p-8 rounded-lg">
            <h2 className="text-3xl font-semibold mb-4">What you'll learn</h2>
            <div className="mt-3">
              {whatYouWillLearn && (
                whatYouWillLearn.split('\n').map((line, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <p className="font-bold">{index + 1}.</p>
                    <p className="ml-2">{line}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 mb-12">
            <h2 className="text-xl font-bold">Tags</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {
                tag && tag.map((item, ind) => (
                  <p key={ind} className="bg-richblack-700 p-2 text-white rounded-full text-center font-semibold">
                    {item}
                  </p>
                ))
              }
            </div>
          </div>
          <div className="max-w-[830px] mt-9">
            <div className="flex flex-col gap-3 mb-12">
              <h2 className="text-[28px] font-semibold">Course Content</h2>
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex gap-2">
                  <span>
                    {courseContent.length} {`section(s)`}
                  </span>
                  <span>
                    {totalNoOfLectures} {`lecture(s)`}
                  </span>
                  <span>{response.data?.totalDuration} Total Time</span>
                </div>
                <button
                  className="text-white hover:text-richblack-300 transition-all duration-200"
                  onClick={() => setIsActive([])}
                >
                  Collapse All Sections
                </button>
              </div>
            </div>
            <div className="py-4">
              {courseContent?.map((course, index) => (
                <CourseAccordionBar
                  course={course}
                  key={index}
                  isActive={isActive}
                  handleActive={handleActive}
                />
              ))}
            </div>
            <div className="mb-12 py-4">
              <h2 className="text-[28px] font-semibold mb-4">Author</h2>
              <div className="flex items-center gap-4 py-4">
                <Img
                  src={instructor.image}
                  alt="Author"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <p className="text-lg capitalize flex items-center gap-2 font-semibold">
                    {`${instructor.firstName} ${instructor.lastName}`}
                    <span><MdOutlineVerified className='w-5 h-5 text-[#00BFFF]' /></span>
                  </p>
                  <p className="text-richblack-50">{instructor?.additionalDetails?.about}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

export default CourseDetails