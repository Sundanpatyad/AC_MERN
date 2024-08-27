import React, { useEffect, useState, useMemo } from "react";
import ReactStars from "react-rating-stars-component";
import Img from './Img';
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apis";
import { useSelector } from "react-redux";

function ReviewCarousel() {
  const [reviews, setReviews] = useState([]);
  const [isScrolling, setIsScrolling] = useState(true);
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

  const toggleScroll = () => {
    setIsScrolling(!isScrolling);
  };

  return (
    <div className="bg-transparent py-8 md:py-16 overflow-hidden">
      <div className="container mx-auto px-2 relative">
        <div className="overflow-hidden">
          <motion.div
            className="flex space-x-4 md:space-x-6"
            animate={{
              x: isScrolling ? ["0%", "-100%"] : "0%"
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 5,
                ease: "linear",
              },
            }}
          >
            {[...reviews, ...reviews, ...reviews].map((review, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px]"
                whileHover={{ scale: 1.05 }}
                onClick={toggleScroll}
              >
                <div className="bg-black rounded-lg shadow-xl overflow-hidden border border-gray-700 h-full">
                  <div className="p-4 md:p-6">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      <Img
                        src={
                          review?.user?.image ||
                          `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                        }
                        alt=""
                        className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-purple-500"
                      />
                      <div>
                        <h3 className="font-semibold text-sm md:text-base text-gray-100 capitalize">{`${review?.user?.firstName} ${review?.user?.lastName}`}</h3>
                        <p className="text-xs md:text-sm text-gray-400">{review?.course?.courseName}</p>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mb-3 md:mb-4">
                      {review?.review.split(" ").length > truncateWords
                        ? `${review?.review.split(" ").slice(0, truncateWords).join(" ")} ...`
                        : review?.review}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl font-bold text-purple-400">{review.rating}</span>
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
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ReviewCarousel;