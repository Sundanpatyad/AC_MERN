import React, { useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { fetchAllMockTests, fetchMockTestDetails } from '../services/operations/mocktest'
import { buyItem } from '../services/operations/studentFeaturesAPI'
import { addToCart } from '../slices/cartSlice'
import toast from 'react-hot-toast'
import { FaBookOpen, FaShoppingCart } from 'react-icons/fa'
import Footer from "../components/common/Footer"
import ConfirmationModal from "../components/common/ConfirmationModal"
import { ACCOUNT_TYPE } from "../utils/constants"

const MockTestCard = React.memo(({ mockTest, handleAddToCart, handleBuyNow, handleStartTest, isLoggedIn }) => {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const { data: enrollmentStatus } = useQuery(
    ['mockTestEnrollment', mockTest._id, user?._id],
    () => fetchMockTestDetails(mockTest._id, token),
    {
      select: (data) => data.studentsEnrolled.includes(user?._id),
      enabled: !!token && !!user?._id,
    }
  )

  return (
    <div 
      className="bg-richblack-900 w-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col"
      onClick={() => navigate(`/mock-test/${mockTest._id}`)}
    >
      <div className="relative h-28 sm:h-32 md:h-40 bg-gradient-to-br from-white to-pink-500">
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 p-2">
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white text-center">{mockTest.seriesName}</h3>
        </div>
      </div>
      <div className="p-3 sm:p-4 md:p-6 flex-grow flex flex-col justify-between">
        <p className="text-xs sm:text-sm md:text-base text-richblack-100 mb-2 sm:mb-4 line-clamp-2">{mockTest.description}</p>
        <div className="flex justify-between items-center text-xs sm:text-sm text-richblack-200 mb-2 sm:mb-4 md:mb-6">
          <div className="flex items-center">
            <p className="font-medium">₹{mockTest.price}</p>
          </div>
          <div className="flex items-center">
            <FaBookOpen className="mr-1 text-richblack-50" />
            <p className="font-medium">{mockTest.mockTests?.length || 0} Tests</p>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          {isLoggedIn ? (
            enrollmentStatus ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartTest(mockTest._id)
                }}
                className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-xs sm:text-sm"
              >
                Start Test
              </button>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToCart(mockTest)
                  }}
                  className="w-full py-2 px-3 bg-richblack-700 text-white font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-600 text-xs sm:text-sm"
                >
                  <FaShoppingCart className="inline mr-1" />
                  Add to Cart
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBuyNow(mockTest)
                  }}
                  className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-xs sm:text-sm"
                >
                  Buy Now
                </button>
              </>
            )
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate("/login")
              }}
              className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-xs sm:text-sm"
            >
              Login to Purchase
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

const MockTestComponent = () => {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [active, setActive] = useState(1)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  const { data: mockTests, isLoading } = useQuery(
    'mockTests',
    () => fetchAllMockTests(),
    {
      select: (data) => data.filter(test => test.status !== 'draft'),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const isLoggedIn = !!token

  const handleAddToCart = useCallback((mockTest) => {
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
      toast.error("Instructors can't add mock tests to cart.")
      return
    }

    dispatch(addToCart(mockTest))
  }, [isLoggedIn, user, navigate, dispatch])

  const handleBuyNow = useCallback(async (mockTest) => {
    if (!isLoggedIn) {
      setConfirmationModal({
        text1: "You are not logged in!",
        text2: "Please login to purchase this mock test.",
        btn1Text: "Login",
        btn2Text: "Cancel",
        btn1Handler: () => navigate("/login"),
        btn2Handler: () => setConfirmationModal(null),
      })
      return
    }

    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors can't purchase mock tests.")
      return
    }

    try {
      await buyItem(token, [mockTest._id], ['MOCK_TEST'], user, navigate, dispatch)
      queryClient.invalidateQueries(['mockTestEnrollment', mockTest._id, user?._id])
    } catch (error) {
      console.error("Error purchasing mock test:", error)
    }
  }, [isLoggedIn, user, navigate, dispatch, queryClient, token])

  const handleStartTest = useCallback((mockTestId) => {
    if (!isLoggedIn) {
      setConfirmationModal({
        text1: "You are not logged in!",
        text2: "Please login to start the test",
        btn1Text: "Login",
        btn2Text: "Cancel",
        btn1Handler: () => navigate("/login"),
        btn2Handler: () => setConfirmationModal(null),
      })
      return
    }
    navigate(`/view-mock/${mockTestId}`)
  }, [isLoggedIn, navigate])

  const memoizedMockTests = useMemo(() => mockTests || [], [mockTests])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      {/* <div className="bg-richblack-800 px-4 py-8 sm:py-12">
        <div className="mx-auto flex min-h-[180px] sm:min-h-[220px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent">
          <p className="text-xs sm:text-sm text-richblack-300">
            Home / <span className="text-white">Mock Tests</span>
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-richblack-5 font-bold">Prepare with Our Mock Tests</h1>
          <p className="max-w-[870px] text-sm sm:text-base text-richblack-200">
            Enhance your skills and boost your confidence with our comprehensive mock tests designed to simulate real exam conditions.
          </p>
        </div>
      </div> */}

      {/* Mock Tests Section */}
      <div className="flex-grow mx-auto w-full max-w-maxContent px-4 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-richblack-5 mb-4">Test Yourself With Our Mock Tests 👍</h2>
        <div className="my-4 flex border-b border-b-richblack-600 text-xs sm:text-sm">
          <p
            className={`px-2 sm:px-4 py-2 ${active === 1
              ? "border-b border-b-white text-white"
              : "text-richblack-50"
              } cursor-pointer`}
            onClick={() => setActive(1)}
          >
            Most Popular
          </p>
          <p
            className={`px-2 sm:px-4 py-2 ${active === 2
              ? "border-b border-b-white text-white"
              : "text-richblack-50"
              } cursor-pointer`}
            onClick={() => setActive(2)}
          >
            New
          </p>
        </div>
        {memoizedMockTests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
            {memoizedMockTests.map((mockTest) => (
              <MockTestCard 
                key={mockTest._id} 
                mockTest={mockTest} 
                handleAddToCart={handleAddToCart}
                handleBuyNow={handleBuyNow}
                handleStartTest={handleStartTest}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-xl text-richblack-5 bg-richblack-800 rounded-lg p-8 shadow-lg mt-8">
            No published mock tests available at the moment. Check back soon!
          </p>
        )}
      </div>

      <Footer />
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  )
}

const LoadingSkeleton = React.memo(() => (
  <div className="w-full p-4 sm:p-8 bg-richblack-900">
    <div className="h-8 sm:h-10 w-3/4 bg-richblack-700 rounded-full mb-8 sm:mb-12 mx-auto"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-richblack-800 rounded-xl overflow-hidden shadow-lg animate-pulse">
          <div className="h-32 sm:h-40 bg-richblack-700"></div>
          <div className="p-4 sm:p-6">
            <div className="h-3 sm:h-4 w-3/4 bg-richblack-700 rounded-full mb-3 sm:mb-4"></div>
            <div className="h-3 sm:h-4 w-full bg-richblack-700 rounded-full mb-3 sm:mb-4"></div>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="h-3 sm:h-4 w-1/4 bg-richblack-700 rounded-full"></div>
              <div className="h-3 sm:h-4 w-1/4 bg-richblack-700 rounded-full"></div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="h-8 sm:h-10 flex-1 bg-richblack-700 rounded-lg"></div>
              <div className="h-8 sm:h-10 flex-1 bg-richblack-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
))

export default React.memo(MockTestComponent)