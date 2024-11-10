import React, { useEffect, useState, useMemo } from "react";
import ReactStars from "react-rating-stars-component";
import Img from './Img';
import { motion, AnimatePresence } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apis";
import { useSelector } from "react-redux";

const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const { token } = useSelector((state) => state.auth);
  const truncateWords = 15;

  // Memoized fetch function
  const fetchReviews = useMemo(() => {
    return async () => {
      const { data } = await apiConnector(
        "GET",
        ratingsEndpoints.REVIEWS_DETAILS_API
      );
      if (data?.success) {
        setReviews(data?.data);
      }
    };
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (reviews.length > 0) {
      const timer = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prevIndex) => 
          prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // Change card every 4 seconds

      return () => clearInterval(timer);
    }
  }, [reviews.length]);

  const handleCardClick = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const variants = {
    enter: (direction) => ({
      scale: 0.8,
      y: direction > 0 ? 100 : -100,
      opacity: 0,
      zIndex: 0,
    }),
    center: {
      zIndex: 5,
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      scale: 0.8,
      y: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const getCardStyles = (index) => {
    const diff = (index - currentIndex + reviews.length) % reviews.length;
    const isActive = diff === 0;
    const isPrev = diff === reviews.length - 1;
    const isNext = diff === 1;

    let zIndex = reviews.length - diff;
    let scale = 1 - (diff * 0.05);
    let y = diff * 10;
    let opacity = 1 - (diff * 0.2);

    if (diff > 2) {
      opacity = 0;
    }

    return {
      zIndex,
      scale,
      y,
      opacity,
    };
  };

  return (
    <div className="bg-transparent py-8 md:py-16">
      <div className="container mx-auto px-2 relative">
        <div className="relative h-[400px] w-full flex items-center justify-center">
          <div className="relative w-[280px] sm:w-[320px] md:w-[360px] h-full">
            {reviews.map((review, index) => {
              const styles = getCardStyles(index);
              
              return (
                <motion.div
                  key={index}
                  className="absolute top-0 left-0 w-full cursor-pointer"
                  initial={false}
                  animate={{
                    zIndex: styles.zIndex,
                    scale: styles.scale,
                    y: styles.y,
                    opacity: styles.opacity,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                    opacity: { duration: 0.4 }
                  }}
                  onClick={() => handleCardClick(index)}
                  whileHover={{ scale: styles.scale * 1.02 }}
                >
                  <div className="bg-black rounded-lg shadow-xl overflow-hidden border border-gray-700">
                    <div className="p-4 md:p-6">
                      <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                       <div> <Img
                          src={
                            review?.user?.image ||
                            `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                          }
                          alt=""
                          className="h-10 w-10 rounded-full object-cover border-2 border-purple-500"
                        />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm md:text-base text-gray-100 capitalize">
                            {`${review?.user?.firstName} ${review?.user?.lastName}`}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-400">
                            {review?.course?.courseName}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-gray-300 mb-3 md:mb-4">
                        {review?.review.split(" ").length > truncateWords
                          ? `${review?.review.split(" ").slice(0, truncateWords).join(" ")} ...`
                          : review?.review}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl md:text-2xl font-bold text-purple-400">
                          {review.rating}
                        </span>
                        <ReactStars
                          count={5}
                          value={parseInt(review.rating)}
                          size={20}
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCarousel;