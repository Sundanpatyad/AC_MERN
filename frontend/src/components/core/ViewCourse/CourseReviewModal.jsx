import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Star } from "lucide-react";
import { useSelector } from "react-redux";

import { createRating } from "../../../services/operations/courseDetailsAPI";

const StarRating = ({ rating, onRatingChange }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110"
          onClick={() => onRatingChange(star)}
        >
          <Star
            size={24}
            className={`${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default function EnhancedCourseReviewModal({ setReviewModal }) {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { courseEntireData } = useSelector((state) => state.viewCourse);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    await createRating(
      {
        courseId: courseEntireData._id,
        rating: data.courseRating,
        review: data.courseExperience,
      },
      token
    );
    setReviewModal(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-auto bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="w-full max-w-[500px] rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl border border-gray-700">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-xl md:text-2xl font-bold text-gray-100">Course Review</h2>
          <button
            onClick={() => setReviewModal(false)}
            className="text-gray-400 hover:text-gray-200 focus:outline-none transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
              <img
                src={user?.image}
                alt={`${user?.firstName} profile`}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <p className="font-semibold text-gray-100 text-base md:text-lg capitalize">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs md:text-sm text-gray-400">Posting Publicly</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Rating
              </label>
              <Controller
                name="courseRating"
                control={control}
                defaultValue={0}
                rules={{ required: "Please select a rating" }}
                render={({ field }) => (
                  <StarRating
                    rating={field.value}
                    onRatingChange={(newRating) => field.onChange(newRating)}
                  />
                )}
              />
              {errors.courseRating && (
                <span className="mt-2 text-xs text-pink-500">
                  {errors.courseRating.message}
                </span>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-2"
                htmlFor="courseExperience"
              >
                Share Your Experience <span className="text-pink-500">*</span>
              </label>
              <textarea
                id="courseExperience"
                placeholder="Tell us about your experience with this course..."
                {...register("courseExperience", { required: "Please share your experience" })}
                className="w-full min-h-[120px] px-4 py-3 text-sm md:text-base text-gray-100 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 transition-all duration-200 resize-none"
              />
              {errors.courseExperience && (
                <span className="mt-2 text-xs text-pink-500">
                  {errors.courseExperience.message}
                </span>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setReviewModal(false)}
                className="px-4 py-2 text-xs md:text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs md:text-sm font-medium text-black bg-slate-200 rounded-md transition-all duration-200"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}