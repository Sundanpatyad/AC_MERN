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
    <div className="min-h-screen bg-black text-gray-100">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="bg-black rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-36 bg-gradient-to-br from-gray-800 to-black">
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 p-3">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center">
                {testDetails.seriesName}
              </h1>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">{testDetails.description}</p>

            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center text-xs sm:text-sm text-gray-300">
                <BiCalendar className="mr-1 sm:mr-2" /> Created: {new Date(testDetails.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-300">
                <FaBookOpen className="mr-1 sm:mr-2" /> {testDetails.mockTests?.length || 0} Tests
              </div>
            </div>

            <div className="flex flex-col bg-black border-2 border-slate-300 p-3 sm:p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <div className="text-lg sm:text-md font-bold text-black bg-white px-2 sm:px-3 py-1 rounded-md">
                  {testDetails.price === 0 ? "Free" : `₹${testDetails.price}`}
                </div>
              </div>
              {isLoggedIn ? (
                isEnrolled || testDetails.price === 0 ? (
                  <button
                    onClick={handleStartTest}
                    className="w-full py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 transition duration-300 text-center"
                  >
                    Start Test
                  </button>
                ) : (
                  <>
                    {isInCart ? (
                      <Link
                        to="/dashboard/cart"
                        className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition duration-300 text-center mb-2"
                      >
                        Go to Cart
                      </Link>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition duration-300 mb-2"
                      >
                        <FaShoppingCart className="inline-block mr-2" />
                        Add to Cart
                      </button>
                    )}
                    <button
                      onClick={handleBuyNow}
                      className="bg-white text-black px-4 py-2 rounded-md transition-colors w-full text-sm sm:text-base"
                    >
                      {testDetails.studentsEnrolled.includes(user?._id) || testDetails.price === 0
                        ? "Start Test"
                        : "Buy Now"}
                    </button>
                  </>
                )
              ) : (
                <button
                  onClick={setShowLoginModal}
                  className="w-full py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 transition duration-300 text-center"
                >
                  Login to {testDetails.price === 0 ? 'Start' : 'Purchase'}
                </button>
              )}
            </div>
          </div>
        </div>

        {testDetails.mockTests && testDetails.mockTests.length > 0 && (
          <div className="mt-4 sm:mt-6 bg-black border-2 border-slate-300 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-3 sm:mb-4">Included Tests</h2>
              <div className="space-y-3 sm:space-y-4">
                {testDetails.mockTests.map((test, index) => (
                  <div key={index} className="border-b border-gray-700 pb-3 sm:pb-4 last:border-b-0">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-100">{test.testName}</h3>
                    <p className="text-xs sm:text-sm text-gray-300">Duration: {test.duration} minutes</p>
                    <p className="text-xs sm:text-sm text-gray-300">Questions: {test.questions.length}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
      <Footer />
    </div>
  );
};

export default MockTestDetails;