import React, { useEffect, useState } from "react";
import ReactStars from "react-rating-stars-component";
import Img from './Img';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { FaStar } from "react-icons/fa";
import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apis";

function ReviewSlider() {
  const [reviews, setReviews] = useState(null);
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

  if (!reviews) return null;

  return (
    <div className="bg-transparent py-16">
      <div className="container mx-auto px-4">
        <Swiper
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          spaceBetween={30}
          loop={true}
          freeMode={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          className="w-full"
        >
          {reviews.map((review, i) => (
            <SwiperSlide key={i}>
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
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default ReviewSlider;