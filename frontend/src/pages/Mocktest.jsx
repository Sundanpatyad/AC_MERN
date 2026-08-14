import React, { useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { fetchAllMockTests } from '../services/operations/mocktest'
import { buyItem } from '../services/operations/studentFeaturesAPI'
import { addToCart } from '../slices/cartSlice'
import toast from '@/utils/toast'
import { FaBookOpen, FaSearch, FaShoppingCart } from 'react-icons/fa'
import Footer from "../components/common/Footer"
import ConfirmationModal from "../components/common/ConfirmationModal"
import { ACCOUNT_TYPE } from "../utils/constants"
import LoadingSpinner from '../components/core/ConductMockTests/Spinner'

const MockTestCardSkeleton = () => (
  <div className="bg-page w-full rounded-xl overflow-hidden shadow-lg animate-pulse border border-line">
    <div className="h-28 sm:h-32 md:h-40 bg-elevated"></div>
    <div className="p-3 sm:p-4 md:p-6">
      <div className="h-4 bg-elevated rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-elevated rounded w-full mb-4"></div>
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 bg-elevated rounded w-1/4"></div>
        <div className="h-4 bg-elevated rounded w-1/4"></div>
      </div>
      <div className="h-8 bg-elevated rounded w-full mb-2"></div>
      <div className="h-8 bg-elevated rounded w-full"></div>
    </div>
  </div>
)

const MockTestTable = ({ filteredMockTests, handleAddToCart, handleBuyNow, handleStartTest, isLoggedIn, user, cart, navigate }) => {
  const allTests = useMemo(() => {
    return filteredMockTests.flatMap(series => 
      (series.mockTests || []).map(test => ({
        ...test,
        seriesId: series._id,
        seriesName: series.seriesName,
        price: series.price,
        isEnrolled: Boolean(series.isEnrolled),
        isInCart: cart.some(item => item._id === series._id),
        thumbnail: series.thumbnail
      }))
    ).sort((a,b) => a.testName.localeCompare(b.testName));
  }, [filteredMockTests, user?._id, cart]);

  if (allTests.length === 0) return null;

  return (
    <div className="mt-24 mb-20 overflow-x-auto rounded-[2rem] border border-line bg-page shadow-2xl">
      <div className="px-8 py-6 border-b border-line">
        <h3 className="text-xl font-bold text-fg">All Individual Tests</h3>
        <p className="text-subtle text-sm">A comprehensive list of every test available in our library.</p>
      </div>
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-surface backdrop-blur-xl">
            <th className="px-8 py-5 text-[11px] font-extrabold text-subtle uppercase tracking-[0.2em] border-b border-line">Mock Test / Series</th>
            <th className="px-8 py-5 text-[11px] font-extrabold text-subtle uppercase tracking-[0.2em] border-b border-line text-center">Questions</th>
            <th className="px-8 py-5 text-[11px] font-extrabold text-subtle uppercase tracking-[0.2em] border-b border-line text-center">Duration</th>
            <th className="px-8 py-5 text-[11px] font-extrabold text-subtle uppercase tracking-[0.2em] border-b border-line">Status</th>
            <th className="px-8 py-5 text-[11px] font-extrabold text-subtle uppercase tracking-[0.2em] border-b border-line text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {allTests.map((test, idx) => (
            <tr key={`${test.seriesId}-${test.testName}-${idx}`} className="hover:bg-elevated transition-colors group">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-surface border border-line flex-shrink-0 overflow-hidden shadow-inner">
                      {test.thumbnail ? <img src={test.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /> : <FaBookOpen className="m-auto mt-3.5 text-muted" />}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-fg font-bold text-sm tracking-tight group-hover:text-blue-400 transition-colors uppercase">{test.testName}</span>
                      <span className="text-[10px] text-subtle font-medium tracking-wide uppercase mt-0.5">{test.seriesName}</span>
                   </div>
                </div>
              </td>
              <td className="px-8 py-6 text-center">
                <span className="text-sm font-bold text-muted">{test.totalQuestions ?? test.questions?.length ?? 0}</span>
              </td>
              <td className="px-8 py-6 text-center">
                <span className="text-sm font-bold text-muted">{test.duration}m</span>
              </td>
              <td className="px-8 py-6">
                <span className={`text-[10px] px-3 py-1.5 rounded-full font-black tracking-widest border uppercase ${test.price === 0 ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-line bg-page text-subtle'}`}>
                  {test.price === 0 ? 'FREE' : `₹${test.price}`}
                </span>
              </td>
              <td className="px-8 py-6 text-right">
                {!isLoggedIn ? (
                  <button onClick={() => navigate('/login')} className="text-[10px] font-black pointer-events-auto uppercase tracking-[0.15em] py-2.5 px-6 rounded-full bg-solid text-solid-fg active:scale-95 transition-all shadow-lg">LOGIN</button>
                ) : test.isEnrolled || test.price === 0 ? (
                  <button onClick={() => handleStartTest(test.seriesId)} className="text-[10px] font-black uppercase tracking-[0.15em] py-2.5 px-8 rounded-full bg-solid text-solid-fg active:scale-95 transition-all shadow-lg">START</button>
                ) : (
                  <div className="flex justify-end gap-3">
                    {test.isInCart ? (
                        <button onClick={() => navigate('/dashboard/cart')} className="px-5 py-2.5 bg-surface border border-line rounded-full text-[10px] font-black text-fg hover:border-muted uppercase tracking-widest active:scale-95 transition-all">IN CART</button>
                    ) : (
                        <button onClick={() => handleAddToCart({_id: test.seriesId, seriesName: test.seriesName, price: test.price})} className="p-3 bg-surface border border-line rounded-full text-fg hover:border-muted active:scale-95 transition-all"><FaShoppingCart size={12} /></button>
                    )}
                    <button onClick={() => handleBuyNow({_id: test.seriesId, seriesName: test.seriesName, price: test.price})} className="px-6 py-2.5 bg-solid text-solid-fg rounded-full text-[10px] font-black active:scale-95 transition-all shadow-lg uppercase tracking-widest">BUY</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MockTestCard = React.memo(({ mockTest, handleAddToCart, handleBuyNow, handleStartTest, isLoggedIn, isEnrolled, isInCart }) => {
  const navigate = useNavigate()

  return (
    <div
      className="bg-surface border border-line rounded-[2.5rem] p-1 cursor-pointer transition-all duration-300  flex flex-col group shadow-xl"
      onClick={() => navigate(`/mock-test/${mockTest._id}`)}
    >
      {/* Image Area */}
      <div className="w-full relative overflow-hidden rounded-[2rem] bg-page border border-line" style={{ aspectRatio: '16/9' }}>
        {mockTest.thumbnail ? (
          <img
            src={mockTest.thumbnail}
            alt={mockTest.seriesName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <FaBookOpen className="text-4xl text-fg" />
          </div>
        )}
        {/* Subtle Stats Overlay */}
        <div className="absolute top-3 right-3 flex gap-2">
          <span className="bg-black/50 backdrop-blur-md text-[10px] text-gray-300 px-3 py-1 rounded-full border border-white/10">
            {(mockTest.mockTestsCount ?? mockTest.mockTests?.length ?? 0) +
              (mockTest.attachmentsCount ?? mockTest.attachments?.length ?? 0)} Tests
          </span>
          <span className="bg-black/50 backdrop-blur-md text-[10px] text-gray-300 px-3 py-1 rounded-full border border-white/10">
            {mockTest.studentsEnrolledCount ?? mockTest.studentsEnrolled?.length ?? 0} Students
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 pb-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-medium text-fg mb-2 line-clamp-1">
            {mockTest.seriesName}
          </h3>
          <p className="text-subtle text-lg flex items-center gap-2">
            Price: <span className="text-fg font-bold">{mockTest.price === 0 ? 'Free' : `₹${mockTest.price}`}</span>
          </p>
        </div>

        {/* Actions Area */}
        <div className="mt-8 flex flex-row gap-3">
          {!isLoggedIn ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate('/login')
              }}
              className="w-full py-2.5 bg-solid text-solid-fg font-bold text-sm tracking-wide hover:bg-solid-hover transition-all rounded-full"
            >
              LOGIN TO {mockTest.price === 0 ? 'START' : 'PURCHASE'}
            </button>
          ) : isEnrolled || mockTest.price === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleStartTest(mockTest._id)
              }}
              className="w-full py-2.5 bg-solid text-solid-fg font-bold text-sm tracking-wide hover:bg-solid-hover transition-all rounded-full"
            >
              START TEST
            </button>
          ) : (
            <div className="flex flex-row gap-3 w-full">
              {isInCart ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/dashboard/cart')
                  }}
                  className="flex-1 py-2.5 bg-surface text-fg font-bold text-[10px] sm:text-sm tracking-wide hover:bg-elevated transition-all border border-line rounded-full whitespace-nowrap"
                >
                  GO TO CART
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToCart(mockTest)
                  }}
                  className="px-4 sm:px-6 py-2.5 bg-surface text-fg flex items-center justify-center hover:bg-elevated transition-all border border-line rounded-full"
                >
                  <FaShoppingCart className="inline-block mr-2" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleBuyNow(mockTest)
                }}
                className="flex-1 py-2.5 bg-solid text-solid-fg font-bold text-[10px] sm:text-sm tracking-wide hover:bg-solid-hover transition-all rounded-full"
              >
                Buy Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

const MockTestComponent = () => {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { cart } = useSelector((state) => state.cart)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { data: mockTests, isLoading } = useQuery(
    ['mockTests', token],
    () => fetchAllMockTests(token, { view: 'list' }),
    {
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
      toast.error("Instructors can't add to cart")
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
      toast.error("Instructors can't buy")
      return
    }

    try {
      await buyItem(token, [mockTest._id], ['MOCK_TEST'], user, navigate, dispatch)
    } catch (error) {
      console.error("Error purchasing mock test:", error)
      toast.error("Purchase failed")
    }
  }, [isLoggedIn, user, navigate, dispatch, token])

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

  const filteredMockTests = useMemo(() => {
    return mockTests?.filter(mockTest =>
      mockTest.seriesName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [mockTests, searchTerm])

  const memoizedMockTests = useMemo(() => mockTests || [], [mockTests])

  if (isLoading) {
    return <LoadingSpinner title={"Loading Mocktest..."} />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow align-center justify-center mx-auto w-full max-w-maxContent px-4 pt-8 sm:pt-20">
        <h2 className="text-7xl tracking-wide sm:text-3xl md:text-[90px] font-inter text-center mt-10 text-fg pb-4">
          Explore Tests
        </h2>
        <div className="relative md:mt-8 text-center">
          <input
            type="text"
            placeholder="Search Courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 py-3 px-8 rounded-2xl border border-line bg-transparent text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-muted touch-action-manipulation select-none"
          />
        </div>
        <div className='text-sm md:text-xl text-center text-subtle pt-3 pb-20'>
          <p>
            Challenge yourself with our latest mock tests and elevate your skills to the next level!
          </p>
        </div>

        {memoizedMockTests.length > 0 ? (
          <div>
            {/* Display the latest mock test first */}
            {filteredMockTests
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 1)
              .map((mockTest) => (
                <MockTestCard
                  key={mockTest._id}
                  mockTest={mockTest}
                  handleAddToCart={handleAddToCart}
                  handleBuyNow={handleBuyNow}
                  handleStartTest={handleStartTest}
                  isLoggedIn={isLoggedIn}
                  isEnrolled={Boolean(mockTest.isEnrolled)}
                  isInCart={cart.some(item => item._id === mockTest._id)}
                />
              ))}

            {/* Display the rest of the mock tests in descending order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
              {memoizedMockTests
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(1)
                .map((mockTest) => (
                  <MockTestCard
                    key={mockTest._id}
                    mockTest={mockTest}
                    handleAddToCart={handleAddToCart}
                    handleBuyNow={handleBuyNow}
                    handleStartTest={handleStartTest}
                    isLoggedIn={isLoggedIn}
                    isEnrolled={Boolean(mockTest.isEnrolled)}
                    isInCart={cart.some(item => item._id === mockTest._id)}
                  />
                ))}
            </div>

            {/* NEW Tabular View Section */}
            <MockTestTable 
              filteredMockTests={filteredMockTests}
              handleAddToCart={handleAddToCart}
              handleBuyNow={handleBuyNow}
              handleStartTest={handleStartTest}
              isLoggedIn={isLoggedIn}
              user={user}
              cart={cart}
              navigate={navigate}
            />
          </div>
        ) : (
          <p className="text-center text-xl text-fg bg-surface rounded-lg p-8 shadow-lg mt-8">
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
  <div className="w-full p-4 sm:p-8 bg-page">
    <div className="h-8 sm:h-10 w-3/4 bg-elevated rounded-full mb-8 sm:mb-12 mx-auto"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {[...Array(6)].map((_, index) => (
        <MockTestCardSkeleton key={index} />
      ))}
    </div>
  </div>
))

export default React.memo(MockTestComponent)