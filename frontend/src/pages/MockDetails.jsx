import React, { useEffect, useState } from "react"
import { BiInfoCircle } from "react-icons/bi"
import { HiOutlineGlobeAlt } from "react-icons/hi"
import { GiReturnArrow } from "react-icons/gi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import ConfirmationModal from "../components/common/ConfirmationModal"
import Footer from "../components/common/Footer"
import IconBtn from "../components/common/IconBtn"
import toast from "react-hot-toast"
import { buyItem } from "../services/operations/studentFeaturesAPI"
import { ACCOUNT_TYPE } from "../utils/constants"
import { addToCart } from "../slices/cartSlice"
import { fetchMockTestDetails } from "../services/operations/mocktest"

const BackButton = ({ onClick }) => (
  <button className="mb-5 lg:mt-10 lg:mb-0 z-[100]" onClick={onClick} aria-label="Go back">
    <GiReturnArrow className="w-10 h-10 text-white hover:text-richblack-100 cursor-pointer" />
  </button>
)

const MockTestInfo = ({ seriesName, description, mockTestsCount, creator, createdAt, status }) => (
  <div className="mb-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5">
    <h1 className="text-4xl font-bold text-richblack-5 sm:text-[42px]">{seriesName}</h1>
    <p className="text-richblack-200 text-xs">{description}</p>
    <div className="text-md flex flex-wrap items-center gap-2">
      <span>{`${mockTestsCount || 0} tests`}</span>
      <span className="capitalize">• Status: {status}</span>
    </div>
    <p className="capitalize">Created By <span className="font-semibold underline">{creator?.email}</span></p>
    <div className="flex flex-wrap gap-5 text-lg">
      <p className="flex items-center gap-2">
        <BiInfoCircle /> Created at {new Date(createdAt).toLocaleDateString()}
      </p>
      <p className="flex items-center gap-2"><HiOutlineGlobeAlt /> English</p>
    </div>
  </div>
)

const PriceCard = ({ price, onBuyClick, onAddToCartClick, studentsEnrolled, user, mockId, navigate }) => (
  <div className="bg-richblack-700 p-4 rounded-xl shadow-lg">
    <p className="text-2xl font-semibold text-white mb-4">Rs. {price}</p>
    <IconBtn
      text={user && studentsEnrolled.includes(user?._id) ? "Go To Course" : "Buy Now"}
      onclick={user && studentsEnrolled.includes(user?._id) 
        ? () => navigate(`/view-mock/${mockId}`)
        : onBuyClick}
      customClasses="w-full mb-4"
    />
    {(!user || !studentsEnrolled?.includes(user?._id)) && (
      <button
        onClick={onAddToCartClick}
        className="w-full bg-richblack-800 text-white py-2 px-4 rounded-md font-semibold hover:bg-richblack-700 transition-all duration-200"
      >
        Add to Cart
      </button>
    )}
  </div>
)

const MockTestContent = ({ mockTests }) => (
  <div className="mt-8 border border-richblack-700 rounded-lg p-6">
    <h2 className="text-2xl font-semibold text-richblack-5 mb-4">Mock Test Content</h2>
    <div className="space-y-6">
      {mockTests && mockTests.map((test, index) => (
        <div key={index} className="border-b border-richblack-600 pb-4 last:border-b-0">
          <h3 className="font-semibold text-lg text-richblack-50 mb-2">{test.testName}</h3>
          <p className="text-richblack-300">Duration: {test.duration} minutes</p>
          <p className="text-richblack-300 mb-2">Status: {test.status}</p>
          <div className="ml-4">
            <h4 className="font-medium text-richblack-100 mb-2">Questions:</h4>
            <ul className="list-disc list-inside space-y-2">
              {/* {test.questions.map((question, qIndex) => (
                <li key={qIndex} className="text-richblack-200">
                  {question.text}
                  <ul className="list-circle list-inside ml-4 mt-1 space-y-1">
                    {question.options.map((option, oIndex) => (
                      <li key={oIndex} className="text-richblack-300">{option}</li>
                    ))}
                  </ul>
                </li>
              ))} */}
            </ul>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const LoadingSkeleton = () => (
  <div className="mt-24 p-5 flex flex-col justify-center gap-4" aria-label="Loading">
    <div className="flex flex-col sm:flex-col-reverse gap-4">
      <div className="h-44 sm:h-24 sm:w-[60%] rounded-xl skeleton"></div>
      <div className="h-9 sm:w-[39%] rounded-xl skeleton"></div>
    </div>
    <div className="h-4 w-[55%] lg:w-[25%] rounded-xl skeleton"></div>
    <div className="h-4 w-[75%] lg:w-[30%] rounded-xl skeleton"></div>
    <div className="h-4 w-[35%] lg:w-[10%] rounded-xl skeleton"></div>
    <div className="right-[1.5rem] top-[20%] hidden lg:block lg:absolute min-h-[450px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 rounded-xl skeleton"></div>
    <div className="mt-24 h-60 lg:w-[60%] rounded-xl skeleton"></div>
  </div>
)

function MockTestDetails() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.profile)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { mockId } = useParams()

  const [courseDetails, setCourseDetails] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)
  console.log(courseDetails);

  useEffect(() => {
    const fetchCourseDetailsData = async () => {
      try {
        const res = await fetchMockTestDetails(mockId)
        setCourseDetails(res)
      } catch (error) {
        console.error("Could not fetch Course Details:", error)
        toast.error("Failed to load course details")
      }
    }
    fetchCourseDetailsData()
  }, [mockId])

  const handleBuyCourse = async () => {
    if (!token) {
      setConfirmationModal({
        text1: "You are not logged in!",
        text2: "Please login to purchase this course.",
        btn1Text: "Login",
        btn2Text: "Cancel",
        btn1Handler: () => navigate("/login"),
        btn2Handler: () => setConfirmationModal(null),
      })
      return
    }

    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors can't purchase courses.")
      return
    }

    if (courseDetails.studentsEnrolled.includes(user?._id)) {
      navigate(`/view-mock/${mockId}`)
      return
    }

    try {
      await buyItem(token, [mockId], user, navigate, dispatch)
    } catch (error) {
      console.error("Error purchasing course:", error)
      toast.error("Failed to purchase course")
    }
  }

  const handleAddToCart = () => {
    if (!token) {
      setConfirmationModal({
        text1: "You are not logged in!",
        text2: "Please login to add to cart",
        btn1Text: "Login",
        btn2Text: "Cancel",
        btn1Handler: () => navigate("/login"),
        btn2Handler: () => setConfirmationModal(null),
      })
      return
    }

    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors can't add courses to cart.")
      return
    }

    if (courseDetails.studentsEnrolled.includes(user?._id)) {
      toast.error("You are already enrolled in this course.")
      return
    }

    dispatch(addToCart(courseDetails))
  }

  if (loading || !courseDetails) {
    return <LoadingSkeleton />
  }

  const {
    seriesName,
    description,
    price,
    mockTests,
    createdAt,
    instructor,
    studentsEnrolled,
    status,
  } = courseDetails

  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-11/12 max-w-maxContent mx-auto">
        <div className="grid md:grid-cols-[2fr,1fr] gap-8 items-start py-8">
          <div>
            <MockTestInfo
              seriesName={seriesName}
              description={description}
              mockTestsCount={mockTests?.length || 0}
              creator={instructor}
              createdAt={createdAt}
              status={status}
            />
            <MockTestContent mockTests={mockTests} />
          </div>
          <div className="md:sticky md:top-10">
            <PriceCard
              price={price}
              onBuyClick={handleBuyCourse}
              onAddToCartClick={handleAddToCart}
              studentsEnrolled={studentsEnrolled}
              user={user}
              mockId={mockId}
              navigate={navigate}
            />
          </div>
        </div>
      </div>
      <Footer />
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  )
}

export default MockTestDetails