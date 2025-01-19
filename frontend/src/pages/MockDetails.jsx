import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { BiCalendar } from "react-icons/bi";
import { FaShoppingCart, FaBookOpen } from "react-icons/fa";
import toast from "react-hot-toast";

import { ACCOUNT_TYPE } from "../utils/constants";
import { addToCart } from "../slices/cartSlice";
import { fetchMockTestDetails } from "../services/operations/mocktest";
import LoadingSpinner from "../components/core/ConductMockTests/Spinner";
import ConfirmationModal from "../components/common/ConfirmationModal";
import Footer from "../components/common/Footer";
import { buyItem } from "../services/operations/studentFeaturesAPI";

const MockTestDetails = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mockId } = useParams();

  const [testDetails, setTestDetails] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInCart, setIsInCart] = useState(false);

  const fetchTestDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchMockTestDetails(mockId);
      setTestDetails(res);
    } catch (error) {
      console.error("Could not fetch Mock Test Details:", error);
      toast.error("Failed to load mock test details");
    } finally {
      setIsLoading(false);
    }
  }, [mockId]);

  useEffect(() => {
    fetchTestDetails();
  }, [fetchTestDetails]);

  useEffect(() => {
    if (testDetails) {
      setIsInCart(cart.some(item => item._id === testDetails._id));
    }
  }, [cart, testDetails]);

  const isEnrolled = testDetails?.studentsEnrolled?.includes(user?._id);
  const isLoggedIn = !!token;

  const handleAddToCart = () => {
    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors can't add mock tests to cart.");
      return;
    }

    if (isEnrolled || testDetails.price === 0) {
      toast.error("This mock test is already available to you.");
      return;
    }

    dispatch(addToCart(testDetails));
  };

  const handleBuyNow = async () => {
    if (!token) {
      setConfirmationModal({
        text1: "You are not logged in!",
        text2: "Please login to access this mock test.",
        btn1Text: "Login",
        btn2Text: "Cancel",
        btn1Handler: () => navigate("/login"),
        btn2Handler: () => setConfirmationModal(null),
      });
      return;
    }

    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors can't purchase mock tests.");
      return;
    }

    if (testDetails.studentsEnrolled.includes(user?._id) || testDetails.price === 0) {
      navigate(`/view-mock/${mockId}`);
      return;
    }

    try {
      await buyItem(token, [mockId], ['MOCK_TEST'], user, navigate, dispatch);
    } catch (error) {
      console.error("Error purchasing mock test:", error);
      toast.error("Failed to purchase mock test");
    }
  };

  const handleStartTest = () => {
    navigate(`/view-mock/${mockId}`);
  };

  const setShowLoginModal = () => {
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to access this mock test.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  if (isLoading) {
    return <LoadingSpinner title="Loading Mock Test Details" />;
  }

  if (!testDetails) {
    return <div className="text-center text-2xl text-red-500">Failed to load mock test details</div>;
  }

  return (
    <div className="min-h-screen bg-black mt-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Mobile Purchase Card - Shows only on small screens */}
        <div className="lg:hidden mb-6">
          <div className="bg-zinc-900 rounded-lg p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {testDetails.price === 0 ? "Free" : `₹${testDetails.price}`}
              </span>
              {testDetails.price > 0 && (
                <span className="text-zinc-400 line-through">₹{testDetails.price * 2}</span>
              )}
            </div>

            {isLoggedIn ? (
              isEnrolled || testDetails.price === 0 ? (
                <button
                  onClick={handleStartTest}
                  className="w-full py-3 px-4 bg-white text-black rounded-lg hover:bg-zinc-200 transition duration-300 font-medium"
                >
                  Start Test
                </button>
              ) : (
                <div className="space-y-3">
                  {isInCart ? (
                    <Link
                      to="/dashboard/cart"
                      className="block w-full py-3 px-4 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition duration-300 text-center font-medium"
                    >
                      Go to Cart
                    </Link>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="w-full py-3 px-4 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition duration-300 font-medium"
                    >
                      <FaShoppingCart className="inline-block mr-2" />
                      Add to Cart
                    </button>
                  )}
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3 px-4 bg-white text-black rounded-lg hover:bg-zinc-200 transition duration-300 font-medium"
                  >
                    Buy Now
                  </button>
                </div>
              )
            ) : (
              <button
                onClick={setShowLoginModal}
                className="w-full py-3 px-4 bg-white text-black rounded-lg hover:bg-zinc-200 transition duration-300 font-medium"
              >
                Login to {testDetails.price === 0 ? 'Start' : 'Purchase'}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Content Section */}
          <div className="lg:w-8/12">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {testDetails.seriesName}
            </h1>

            <div className="text-zinc-300 mb-6 text-sm sm:text-base">
              {testDetails.description}
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8 text-zinc-300 text-sm sm:text-base">
              <div className="flex items-center">
                <BiCalendar className="mr-2" />
                <span>{new Date(testDetails.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <FaBookOpen className="mr-2" />
                <span>{testDetails.mockTests?.length || 0} Tests</span>
              </div>
            </div>

            {/* Course Content Section */}
            <div className="bg-zinc-900 rounded-lg p-4 sm:p-6 mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Test Content</h2>
              <div className="space-y-4">
                {testDetails.mockTests?.map((test, index) => (
                  <div key={index} className="border-b border-zinc-700 last:border-b-0 pb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-medium">{test.testName}</h3>
                      <span className="text-zinc-400 text-sm">{test.duration} mins</span>
                    </div>
                    <p className="text-zinc-400 text-sm mt-1">
                      {test.questions.length} questions
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar - Purchase Card */}
          <div className="hidden lg:block lg:w-4/12">
            <div className="bg-zinc-900 rounded-lg p-6 sticky top-4">
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">
                  {testDetails.price === 0 ? "Free" : `₹${testDetails.price}`}
                </span>
                {testDetails.price > 0 && (
                 "" // <span className="text-zinc-400 line-through ml-2">₹{testDetails.price * 2}</span>
                )}
              </div>

              {isLoggedIn ? (
                isEnrolled || testDetails.price === 0 ? (
                  <button
                    onClick={handleStartTest}
                    className="w-full py-3 px-4 bg-white text-black rounded-lg hover:bg-zinc-200 transition duration-300 font-medium"
                  >
                    Start Test
                  </button>
                ) : (
                  <div className="space-y-3">
                    {isInCart ? (
                      <Link
                        to="/dashboard/cart"
                        className="block w-full py-3 px-4 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition duration-300 text-center font-medium"
                      >
                        Go to Cart
                      </Link>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        className="w-full py-3 px-4 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition duration-300 font-medium"
                      >
                        <FaShoppingCart className="inline-block mr-2" />
                        Add to Cart
                      </button>
                    )}
                    <button
                      onClick={handleBuyNow}
                      className="w-full py-3 px-4 bg-white text-black rounded-lg hover:bg-zinc-200 transition duration-300 font-medium"
                    >
                      Buy Now
                    </button>
                  </div>
                )
              ) : (
                <button
                  onClick={setShowLoginModal}
                  className="w-full py-3 px-4 bg-white text-black rounded-lg hover:bg-zinc-200 transition duration-300 font-medium"
                >
                  Login to {testDetails.price === 0 ? 'Start' : 'Purchase'}
                </button>
              )}

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-zinc-300">
                  <span className="mr-2">✓</span>
                  <span>Full mock test access</span>
                </div>
                <div className="flex items-center text-zinc-300">
                  <span className="mr-2">✓</span>
                  <span>Detailed solutions</span>
                </div>
                <div className="flex items-center text-zinc-300">
                  <span className="mr-2">✓</span>
                  <span>Performance analytics</span>
                </div>
                <div className="flex items-center text-zinc-300">
                  <span className="mr-2">✓</span>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
      <Footer />
    </div>
  );
};

export default MockTestDetails;