import React, { useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { fetchCatalogCourses } from '../services/operations/courseDetailsAPI'
import { addToCart } from '../slices/cartSlice'
import toast from 'react-hot-toast'
import { FaBookOpen, FaShoppingCart } from 'react-icons/fa'
import Footer from "../components/common/Footer"
import ConfirmationModal from "../components/common/ConfirmationModal"
import { ACCOUNT_TYPE } from "../utils/constants"

const CourseCardSkeleton = () => (
  <div className="bg-richblack-900 w-full rounded-xl overflow-hidden shadow-lg animate-pulse">
    <div className="h-40 bg-richblack-700"></div>
    <div className="p-6">
      <div className="h-4 bg-richblack-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-richblack-700 rounded w-full mb-4"></div>
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 bg-richblack-700 rounded w-1/4"></div>
        <div className="h-4 bg-richblack-700 rounded w-1/4"></div>
      </div>
      <div className="h-8 bg-richblack-700 rounded w-full"></div>
    </div>
  </div>
)

const CourseCard = React.memo(({ course, handleAddToCart, isLoggedIn }) => {
  const navigate = useNavigate()

  return (
    <div 
      className="bg-richblack-900 w-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col"
      onClick={() => navigate(`/courses/${course._id}`)}
    >
      <img src={course.thumbnail} alt={course.courseName} className="h-40 w-full object-cover" />
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{course.courseName}</h3>
          <p className="text-sm text-richblack-100 mb-4 line-clamp-2">{course.courseDescription}</p>
        </div>
        <div className="flex justify-between items-center text-sm text-richblack-200 mb-4">
          <div className="flex items-center">
            <p className="font-medium">₹{course.price}</p>
          </div>
          <div className="flex items-center">
            <FaBookOpen className="mr-1 text-richblack-50" />
            <p className="font-medium">{course.lectureCount} lectures</p>
          </div>
        </div>
        {isLoggedIn ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAddToCart(course)
            }}
            className="w-full py-2 px-3 bg-richblack-700 text-white font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-600 text-sm"
          >
            <FaShoppingCart className="inline mr-1" />
            Add to Cart
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate("/login")
            }}
            className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-sm"
          >
            Login to Purchase
          </button>
        )}
      </div>
    </div>
  )
})

const CatalogComponent = () => {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  const { data: courses, isLoading } = useQuery(
    'catalogCourses',
    () => fetchCatalogCourses(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const isLoggedIn = !!token

  const handleAddToCart = useCallback((course) => {
    if (!isLoggedIn) {
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

    dispatch(addToCart(course))
    toast.success("Course added to cart")
  }, [isLoggedIn, user, navigate, dispatch])

  const memoizedCourses = useMemo(() => courses || [], [courses])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-richblack-800 px-4 py-12">
        <div className="mx-auto flex min-h-[220px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent">
          <p className="text-sm text-richblack-300">
            Home / <span className="text-white">Catalog</span>
          </p>
          <h1 className="text-3xl md:text-4xl text-richblack-5 font-bold">Our Course Catalog</h1>
          <p className="max-w-[870px] text-base text-richblack-200">
            Explore our wide range of courses designed to help you achieve your learning goals.
          </p>
        </div>
      </div>

      {/* Courses Section */}
      <div className="flex-grow mx-auto w-full max-w-maxContent px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-richblack-5 mb-6">All Courses</h2>
        {memoizedCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {memoizedCourses.map((course) => (
              <CourseCard 
                key={course._id} 
                course={course} 
                handleAddToCart={handleAddToCart}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-xl text-richblack-5 bg-richblack-800 rounded-lg p-8 shadow-lg mt-8">
            No courses available at the moment. Check back soon!
          </p>
        )}
      </div>

      <Footer />
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  )
}

const LoadingSkeleton = React.memo(() => (
  <div className="w-full p-8 bg-richblack-900">
    <div className="h-10 w-3/4 bg-richblack-700 rounded-full mb-12 mx-auto"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  </div>
))

export default React.memo(CatalogComponent)