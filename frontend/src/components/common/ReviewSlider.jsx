import React, { useEffect, useState, useMemo } from "react";
import ReactStars from "react-rating-stars-component";
import Img from './Img';
import { motion, AnimatePresence } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apis";
import { useSelector } from "react-redux";

const DUMMY_REVIEWS = [
  {
    user: { firstName: "Sahil", lastName: "Ahmed", image: null },
    course: { courseName: "JKSSB Patwari" },
    review: "The mock tests are incredibly realistic. They helped me manage my time much better during the actual exam. Best coaching in Jammu!",
    rating: 5
  },
  {
    user: { firstName: "Mehak", lastName: "Kour", image: null },
    course: { courseName: "JKSSB Naib Tehsildar" },
    review: "The faculty is very supportive and the study material is top-notch. I saw a significant improvement in my scores within a month. Highly recommend for aspirants in Srinagar.",
    rating: 5
  },
  {
    user: { firstName: "Irfan", lastName: "Lone", image: null },
    course: { courseName: "General Aptitude" },
    review: "I love how the interface is so clean and easy to navigate. The detailed analysis after each test is a game-changer for my preparation.",
    rating: 4.5
  },
  {
    user: { firstName: "Anjali", lastName: "Sharma", image: null },
    course: { courseName: "Current Affairs" },
    review: "Awakening Classes is the best platform for JKSSB prep in the valley. The current affairs section is always up to date with regional news.",
    rating: 5
  },
  {
    user: { firstName: "Umar", lastName: "Dar", image: null },
    course: { courseName: "JKP SI" },
    review: "Excellent quality mock tests. The difficulty level matches exactly with the recent JKSSB patterns. Truly a blessing for J&K students.",
    rating: 5
  }
];

const ReviewCard = ({ review, truncateWords }) => (
  <div className="flex-shrink-0 w-[300px] md:w-[380px] glass rounded-[2rem] overflow-hidden group/card hover:border-white/20 transition-all duration-500 mx-4">
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full opacity-30 blur-sm group-hover/card:opacity-100 transition-opacity" />
          <Img
            src={
              review?.user?.image ||
              `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
            }
            alt=""
            className="relative h-12 w-12 rounded-full object-cover border-2 border-white/10"
          />
        </div>
        <div>
          <h3 className="font-bold text-base text-white capitalize leading-tight">
            {`${review?.user?.firstName} ${review?.user?.lastName}`}
          </h3>
          <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
            {review?.course?.courseName || 'Student'}
          </p>
        </div>
      </div>
      
      <p className="text-base text-white/70 font-light leading-relaxed italic whitespace-normal">
        "{review?.review.split(" ").length > truncateWords
          ? `${review?.review.split(" ").slice(0, truncateWords).join(" ")} ...`
          : review?.review}"
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black text-white">
            {review.rating}
          </span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                size={10} 
                className={i < Math.floor(review.rating) ? "text-yellow-400" : "text-white/10"} 
              />
            ))}
          </div>
        </div>
        <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Verified Student</div>
      </div>
    </div>
  </div>
);

const ReviewCarousel = () => {
  const [reviews, setReviews] = useState(DUMMY_REVIEWS);
  const { token } = useSelector((state) => state.auth);
  const truncateWords = 18;

  const fetchReviews = useMemo(() => {
    return async () => {
      try {
        const { data } = await apiConnector("GET", ratingsEndpoints.REVIEWS_DETAILS_API);
        if (data?.success && data?.data?.length > 0) {
          setReviews(data?.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Duplicate reviews for infinite scroll
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <div className="bg-transparent py-24 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <div className="text-center mb-16 space-y-4 px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold uppercase tracking-widest text-purple-400">
            Community Love
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Student <span className="text-white/40 font-light italic">Testimonials</span>
          </h2>
        </div>

        {/* Marquee Wrapper */}
        <div className="relative flex overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              duration: 30,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {duplicatedReviews.map((review, index) => (
              <ReviewCard key={index} review={review} truncateWords={truncateWords} />
            ))}
          </motion.div>

          {/* Gradient Masks */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-64 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 md:w-64 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default ReviewCarousel;