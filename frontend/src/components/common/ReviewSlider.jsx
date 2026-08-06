import React, { useEffect, useState, useMemo } from "react";
import Img from './Img';
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apis";

const DUMMY_REVIEWS = [
  {
    user: { firstName: "Sahil", lastName: "Ahmed", image: null },
    course: { courseName: "JKSSB Patwari" },
    review: "The mock tests are incredibly realistic. They helped me manage my time much better during the actual exam.",
    rating: 5
  },
  {
    user: { firstName: "Mehak", lastName: "Kour", image: null },
    course: { courseName: "JKSSB Naib Tehsildar" },
    review: "Supportive faculty and strong study material. My scores improved within a month.",
    rating: 5
  },
  {
    user: { firstName: "Irfan", lastName: "Lone", image: null },
    course: { courseName: "General Aptitude" },
    review: "Clean interface and useful analysis after each test. It changed how I prepare.",
    rating: 4.5
  },
  {
    user: { firstName: "Anjali", lastName: "Sharma", image: null },
    course: { courseName: "Current Affairs" },
    review: "Great platform for JKSSB prep. Current affairs stays relevant and up to date.",
    rating: 5
  },
  {
    user: { firstName: "Umar", lastName: "Dar", image: null },
    course: { courseName: "JKP SI" },
    review: "Excellent mock tests. Difficulty matches recent JKSSB patterns closely.",
    rating: 5
  }
];

const ReviewCard = ({ review, truncateWords }) => (
  <div className="flex-shrink-0 w-[280px] md:w-[340px] rounded-2xl bg-surface overflow-hidden mx-3">
    <div className="p-5 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Img
          src={
            review?.user?.image ||
            `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
          }
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-sm text-fg capitalize leading-tight">
            {`${review?.user?.firstName} ${review?.user?.lastName}`}
          </h3>
          <p className="text-xs text-subtle mt-0.5">
            {review?.course?.courseName || 'Student'}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted leading-relaxed whitespace-normal">
        {review?.review.split(" ").length > truncateWords
          ? `${review?.review.split(" ").slice(0, truncateWords).join(" ")} ...`
          : review?.review}
      </p>

      <div className="flex items-center gap-1.5 pt-1">
        <span className="text-sm font-semibold text-fg">{review.rating}</span>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              size={10}
              className={i < Math.floor(review.rating) ? "text-amber-400" : "text-line"}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ReviewCarousel = () => {
  const [reviews, setReviews] = useState(DUMMY_REVIEWS);
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

  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <section className="section-pad border-t border-line bg-page overflow-hidden">
      <div className="page-shell mb-10 text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-semibold text-fg tracking-tight">
          What students say
        </h2>
        <p className="text-sm md:text-base text-muted">
          Feedback from learners preparing with Awakening Classes.
        </p>
      </div>

      <div className="relative flex overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 36,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {duplicatedReviews.map((review, index) => (
            <ReviewCard key={index} review={review} truncateWords={truncateWords} />
          ))}
        </motion.div>

        <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-page to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-page to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
};

export default ReviewCarousel;
