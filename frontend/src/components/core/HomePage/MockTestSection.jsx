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
  <div className="glass rounded-3xl overflow-hidden animate-pulse">
    <div className="aspect-video bg-white/[0.05]" />
    <div className="p-6 space-y-4">
      <div className="h-5 bg-white/[0.06] rounded-lg w-3/4" />
      <div className="h-4 bg-white/[0.04] rounded-lg w-1/2" />
      <div className="h-12 bg-white/[0.05] rounded-2xl mt-4" />
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
    <section className="py-24 px-6 md:px-12 lg:px-16 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[30%] h-[50%] bg-blue-500/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-[10px] font-bold uppercase tracking-widest text-white/50">
              <span className="w-1 h-1 rounded-full bg-blue-400" />
              Assessments
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Popular <span className="text-white/40 font-light italic">Mock Tests</span>
            </h2>
          </div>
          <Link
            to="/mocktest"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass glass-hover text-sm font-medium text-white/70 hover:text-white transition-all group"
          >
            Explore All Tests
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform opacity-50" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="text-center py-20 glass rounded-3xl mt-12">
            <p className="text-white/30 text-sm font-medium">No mock tests available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MockTestsSection;