import React, { useEffect, useState } from "react";
import ReactStars from "react-rating-stars-component";
import Img from './Img';
import { motion, AnimatePresence } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apis";

function ReviewCarousel() {
  const [reviews, setReviews] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const truncateWords = 15;

  useEffect(() => {
    (async () => {
      const { data } = await apiConnector(
        "GET",
        ratingsEndpoints.REVIEWS_DETAILS_API
      );
      if (data?.success) {
        setReviews(data?.data);
      }
    })();
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [reviews]);

  if (reviews.length === 0) return null;

  const currentReview = reviews[currentReviewIndex];

  return (
    <div className="bg-transparent py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentReviewIndex}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[600px] mx-auto"
          >
            <div className="bg-black rounded-lg shadow-xl overflow-hidden transform transition duration-300 hover:scale-105 border border-gray-700">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Img
                    src={
                      currentReview?.user?.image ||
                      `https://api.dicebear.com/5.x/initials/svg?seed=${currentReview?.user?.firstName} ${currentReview?.user?.lastName}`
                    }
                    alt=""
                    className="h-12 w-12 rounded-full object-cover border-2 border-purple-500"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-100 capitalize">{`${currentReview?.user?.firstName} ${currentReview?.user?.lastName}`}</h3>
                    <p className="text-sm text-gray-400">{currentReview?.course?.courseName}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">
                  {currentReview?.review.split(" ").length > truncateWords
                    ? `${currentReview?.review.split(" ").slice(0, truncateWords).join(" ")} ...`
                    : currentReview?.review}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-purple-400">{currentReview.rating}</span>
                  <ReactStars
                    count={5}
                    value={parseInt(currentReview.rating)}
                    size={24}
                    edit={false}
                    activeColor="#A78BFA"
                    color="#4B5563"
                    emptyIcon={<FaStar />}
                    fullIcon={<FaStar />}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ReviewCarousel;