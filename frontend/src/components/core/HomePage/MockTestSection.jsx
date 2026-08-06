import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';

import { fetchAllMockTests } from '../../../services/operations/mocktest';
import { buyItem } from '../../../services/operations/studentFeaturesAPI';
import { addToCart, removeFromCart } from '../../../slices/cartSlice';
import { ACCOUNT_TYPE } from '../../../utils/constants';
import MockTestCard from './MockTestCard';

const MockTestSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[16/10] bg-elevated rounded-xl" />
    <div className="pt-3 space-y-2">
      <div className="h-4 bg-elevated rounded-md w-3/4" />
      <div className="h-3 bg-elevated rounded-md w-1/3" />
      <div className="h-10 bg-elevated rounded-full mt-4" />
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
    <section className="section-pad border-t border-line bg-page">
      <div className="page-shell">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-semibold text-fg tracking-tight">
              Popular mock tests
            </h2>
            <p className="text-sm md:text-base text-muted max-w-lg">
              Practice with exam-style papers built for real competition.
            </p>
          </div>
          <Link
            to="/mocktest"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-fg transition-colors self-start sm:self-auto"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {isLoading
            ? Array(4).fill(null).map((_, i) => <MockTestSkeleton key={i} />)
            : mockTests
                .slice(0, 4)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((mockTest) => (
                  <MockTestCard
                    key={mockTest._id}
                    mockTest={mockTest}
                    onCardClick={() => navigate(`/mock-test/${mockTest._id}`)}
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

        {!isLoading && mockTests.length === 0 && (
          <div className="text-center py-16 rounded-2xl mt-6 bg-surface">
            <p className="text-muted text-sm">No mock tests available right now.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MockTestsSection;
