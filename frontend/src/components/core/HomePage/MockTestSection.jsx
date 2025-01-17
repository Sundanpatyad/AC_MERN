import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { fetchAllMockTests } from '../../../services/operations/mocktest';
import { buyItem } from '../../../services/operations/studentFeaturesAPI';
import { addToCart, removeFromCart } from '../../../slices/cartSlice';
import { ACCOUNT_TYPE } from '../../../utils/constants';
import MockTestCard from './MockTestCard';

const MockTestSkeleton = () => (
  <div className="bg-zinc-900 w-72 rounded-xl overflow-hidden shadow-lg flex flex-col animate-pulse">
    <div className="h-36 bg-zinc-700"></div>
    <div className="p-4 flex-grow flex flex-col justify-between">
      <div className="h-4 bg-zinc-700 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-zinc-700 rounded w-1/2 mb-3"></div>
      <div className="flex justify-between items-center mb-3">
        <div className="h-4 bg-zinc-700 rounded w-1/4"></div>
        <div className="h-4 bg-zinc-700 rounded w-1/4"></div>
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-zinc-700 rounded"></div>
        <div className="h-8 bg-zinc-700 rounded"></div>
      </div>
    </div>
  </div>
);

const MockTestsSection = ({ setShowLoginModal }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const [mockTests, setMockTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMockTests = async () => {
      try {
        const data = await fetchAllMockTests(token);
        setMockTests(data.filter(test => test.status !== 'draft'));
      } catch (error) {
        console.error("Error fetching mock tests:", error);
        toast.error("Failed to load mock tests. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMockTests();
  }, [token]);

  const isLoggedIn = !!token;

  const handleAddToCart = useCallback(async (mockTest) => {
    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors can't add mock tests to cart.");
      return;
    }

    dispatch(addToCart(mockTest));
  }, [user, dispatch]);

  const handleRemoveFromCart = useCallback(async (mockTest) => {
    dispatch(removeFromCart(mockTest));
    toast.success("Removed from cart successfully!");
  }, [dispatch]);

  const handleBuyNow = useCallback(async (mockTest) => {
    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors can't purchase mock tests.");
      return;
    }

    try {
      await buyItem(token, [mockTest._id], ['MOCK_TEST'], user, navigate, dispatch);
    } catch (error) {
      console.error("Error purchasing mock test:", error);
      toast.error("Failed to purchase the mock test. Please try again.");
    }
  }, [token, user, navigate, dispatch]);

  const handleStartTest = useCallback((mockTestId) => {
    navigate(`/view-mock/${mockTestId}`);
  }, [navigate]);

  return (
    <div className="container w-11/12 mx-auto">
      <h2 className="text-3xl md:text-5xl text-center mt-10 font-bold text-white mb-10">Popular Mock Tests</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center items-center">
        {isLoading
          ? Array(4).fill().map((_, index) => (
            <div key={index} className="flex justify-center">
              <MockTestSkeleton />
            </div>
          ))
          : mockTests
              .slice(0, 4)
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((mockTest) => (
                <MockTestCard
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
      {!isLoading && mockTests.length === 0 && (
        <p className="text-center text-gray-400 mt-8">No mock tests available.</p>
      )}
    </div>
  );
};

export default MockTestsSection;