import React, { useEffect, useState } from "react";
import ReactStars from "react-rating-stars-component";
import Img from './Img';
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apis";

function ReviewSlider() {
  const [reviews, setReviews] = useState([]);
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

  if (reviews.length === 0) return null;

  return (
    <div className="bg-transparent py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="flex"
          animate={{
            x: ["0%", "-100%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear",
            },
          }}
        >
          {[...reviews, ...reviews].map((review, i) => (
            <div key={i} className="flex-shrink-0 w-[300px] mx-4">
              <div className="bg-black rounded-lg shadow-xl overflow-hidden transform transition duration-300 hover:scale-105 border border-gray-700">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Img
                      src={
                        review?.user?.image ||
                        `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                      }
                      alt=""
                      className="h-12 w-12 rounded-full object-cover border-2 border-purple-500"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-100 capitalize">{`${review?.user?.firstName} ${review?.user?.lastName}`}</h3>
                      <p className="text-sm text-gray-400">{review?.course?.courseName}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">
                    {review?.review.split(" ").length > truncateWords
                      ? `${review?.review.split(" ").slice(0, truncateWords).join(" ")} ...`
                      : review?.review}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-purple-400">{review.rating}</span>
                    <ReactStars
                      count={5}
                      value={parseInt(review.rating)}
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
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default ReviewSlider;