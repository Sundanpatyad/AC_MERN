import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { BiArrowBack, BiTimeFive, BiUser, BiCalendar } from "react-icons/bi";
import { FaShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";

import { buyItem } from "../services/operations/studentFeaturesAPI";
import { ACCOUNT_TYPE } from "../utils/constants";
import { addToCart } from "../slices/cartSlice";
import { fetchMockTestDetails } from "../services/operations/mocktest";
import LoadingSpinner from "../components/core/ConductMockTests/Spinner";
import ConfirmationModal from "../components/common/ConfirmationModal";
import Footer from "../components/common/Footer";

const MockTestDetails = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mockId } = useParams();

  const [testDetails, setTestDetails] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestDetails = async () => {
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
    };
    fetchTestDetails();
  }, [mockId]);

  const handleBuyTest = async () => {
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

  const handleAddToCart = () => {
    if (!token) {
      setConfirmationModal({
        text1: "You are not logged in!",
        text2: "Please login to add to cart",
        btn1Text: "Login",
        btn2Text: "Cancel",
        btn1Handler: () => navigate("/login"),
        btn2Handler: () => setConfirmationModal(null),
      });
      return;
    }

    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors can't add mock tests to cart.");
      return;
    }

    if (testDetails.studentsEnrolled.includes(user?._id) || testDetails.price === 0) {
      toast.error("This mock test is already available to you.");
      return;
    }

    dispatch(addToCart(testDetails));
    toast.success("Added to cart successfully");
  };

  if (isLoading) {
    return <LoadingSpinner title="Loading Mock Test Details" />;
  }

  if (!testDetails) {
    return <div className="text-center text-2xl text-red-500">Failed to load mock test details</div>;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-black text-gray-100">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="bg-black rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4 break-words">
              {testDetails.seriesName}
            </h1>
            <p className="text-gray-300 mb-6">{testDetails.description}</p>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center text-gray-300">
                <BiCalendar className="mr-2" /> Created: {new Date(testDetails.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center bg-black border border-slate-300 p-4 rounded-lg">
              <div className="text-xl font-bold text-black bg-white px-3 py-1 rounded-md mb-4 sm:mb-0">
                {testDetails.price === 0 ? "Free" : `₹${testDetails.price}`}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={handleBuyTest}
                  className="bg-white text-black px-6 py-2 rounded-md transition-colors w-full sm:w-auto"
                >
                  {testDetails.studentsEnrolled.includes(user?._id) || testDetails.price === 0
                    ? "Start Test"
                    : "Buy Now"}
                </button>
                {(!user || (!testDetails.studentsEnrolled.includes(user?._id) && testDetails.price !== 0)) && (
                  <button
                    onClick={handleAddToCart}
                    className="bg-gray-600 text-gray-50 px-6 py-2 rounded-md hover:bg-gray-500 transition-colors flex items-center justify-center w-full sm:w-auto"
                  >
                    <FaShoppingCart className="mr-2" /> Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {testDetails.mockTests && testDetails.mockTests.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-black border border-slate-300 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4">Included Tests</h2>
              <div className="space-y-4">
                {testDetails.mockTests.map((test, index) => (
                  <div key={index} className="border-b border-gray-700 pb-4 last:border-b-0">
                    <h3 className="font-semibold text-lg text-gray-100">{test.testName}</h3>
                    <p className="text-gray-300">Duration: {test.duration} minutes</p>
                    <p className="text-gray-300">Questions: {test.questions.length}</p>
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