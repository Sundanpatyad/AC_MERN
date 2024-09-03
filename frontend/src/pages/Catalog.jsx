import React, { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "react-query";
import Footer from "../components/common/Footer";
import ConfirmationModal from "../components/common/ConfirmationModal";
import { getCatalogPageData } from "../services/operations/pageAndComponentData";
import { fetchCourseCategories } from "./../services/operations/courseDetailsAPI";
import { addToCart } from "../slices/cartSlice";
import { buyItem } from "../services/operations/studentFeaturesAPI";
import toast from "react-hot-toast";
import { FaBookOpen, FaShoppingCart } from "react-icons/fa";
import { ACCOUNT_TYPE } from "../utils/constants";
import { setCourse, setStep } from "../slices/courseSlice";
import LoadingSpinner from "../components/core/ConductMockTests/Spinner";

const CourseCard = React.memo(
  ({
    course,
    handleAddToCart,
    handleBuyNow,
    isLoggedIn,
    user,
    handleCourseClick,
  }) => {
    const navigate = useNavigate();
    const isEnrolled = useMemo(() => {
      return course.studentsEnrolled?.includes(user?._id);
    }, [course.studentsEnrolled, user?._id]);

    const handleStartTest = (e) => {
      e.stopPropagation();
      //console.log("Starting test for course:", course.courseName)
    };

    return (
      <div
        className="bg-zinc-900 border border-slate-500 w-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col"
        onClick={() => handleCourseClick(course)}
      >
        <div className="relative h-28 sm:h-32 md:h-40">
          <img
            src={course.thumbnail}
            className="w-full h-full object-cover"
            alt={course.courseName}
          />
        </div>
        <div className="p-3 sm:p-4 md:p-6 flex-grow flex flex-col justify-between">
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white text-center p-2">
            {course.courseName}
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-richblack-100 mb-2 sm:mb-4 line-clamp-2">
            {course.courseDescription}
          </p>
          <div className="flex justify-between items-center text-xs sm:text-sm text-richblack-200 mb-2 sm:mb-4 md:mb-6">
            <div className="flex items-center">
              <p className="font-semibold bg-white px-3 rounded-full text-black">
                {course.price === 0 ? "Free" : `₹${course.price}`}
              </p>
            </div>
            <div className="flex items-center">
              <FaBookOpen className="mr-1 text-richblack-50" />
              <p className="font-medium">{course.courseDuration}</p>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            {isEnrolled ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCourseClick(course);
                }}
                className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-xs sm:text-sm"
              >
                Go to Course
              </button>
            ) : course.price === 0 ? (
              <button
                onClick={handleStartTest}
                className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-xs sm:text-sm"
              >
                Start Test
              </button>
            ) : isLoggedIn ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(course);
                  }}
                  className="w-full py-2 px-3 bg-richblack-700 text-white font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-600 text-xs sm:text-sm"
                >
                  <FaShoppingCart className="inline mr-1" />
                  Add to Cart
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyNow(course);
                  }}
                  className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-xs sm:text-sm"
                >
                  Buy Now
                </button>
              </>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/login");
                }}
                className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-xs sm:text-sm"
              >
                Login to Purchase
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

const CourseCardSkeleton = () => (
  <div className="bg-black w-full rounded-xl overflow-hidden shadow-lg animate-pulse">
    <div className="h-40 bg-richblack-700"></div>
    <div className="p-6">
      <div className="h-4 bg-richblack-700 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-richblack-700 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-richblack-700 rounded w-1/4 mb-4"></div>
      <div className="h-8 bg-richblack-700 rounded mb-2"></div>
      <div className="h-8 bg-richblack-700 rounded"></div>
    </div>
  </div>
);

const SectionSkeleton = ({ title }) => (
  <div className="mx-auto w-full max-w-maxContent px-4 py-8 sm:py-12">
    <div className="h-8 bg-black rounded w-1/4 mb-4"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
      {Array(3)
        .fill()
        .map((_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
    </div>
  </div>
);

function Catalog() {
  const { catalogName } = useParams();
  const [active, setActive] = useState(1);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { course, step } = useSelector((state) => state.course);
  const [searchTerm, setSearchTerm] = useState("");

  const isLoggedIn = !!token;

  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery(
    "categories",
    fetchCourseCategories,
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const categoryId = useMemo(() => {
    return categories.find(
      (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName
    )?._id;
  }, [categories, catalogName]);

  // Fetch catalog page data
  const { data: currentCatalogData, isLoading: isCatalogDataLoading } =
    useQuery(
      ["catalogPageData", categoryId],
      () => getCatalogPageData(categoryId),
      {
        enabled: !!categoryId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      }
    );

  const handleCourseClick = useCallback(
    (course) => {
      dispatch(setCourse(course));
      dispatch(setStep(1));
      navigate(`/courses/${course._id}`);
      console.log(course);
    },
    [dispatch, navigate]
  );

  const handleAddToCart = useCallback(
    async (course) => {
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }

      if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
        toast.error("Instructors can't add courses to cart.");
        return;
      }

      dispatch(setCourse(course));
      dispatch(setStep(1));

      const response = await dispatch(addToCart(course._id));

      if (response.meta.requestStatus === "fulfilled") {
        toast.success("Course added to cart");
      } else {
        toast.error("Failed to add course to cart");
      }
    },
    [dispatch, navigate, isLoggedIn, user]
  );

  const handleBuyNow = useCallback(
    async (course) => {
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }

      if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
        toast.error("Instructors can't purchase courses.");
        return;
      }

      const response = await buyItem(course._id, token);

      if (response) {
        toast.success("Purchase successful");
        navigate(`/courses/${course._id}`);
      } else {
        toast.error("Purchase failed");
      }
    },
    [navigate, token, isLoggedIn, user]
  );

  const filteredCourses = useMemo(() => {
    if (!searchTerm) return currentCatalogData?.selectedCategory?.courses || [];
    return currentCatalogData?.selectedCategory?.courses?.filter((course) =>
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentCatalogData, searchTerm]);

  const renderCourseCards = () => {
    return (
      filteredCourses?.map((course) => (
        <CourseCard
          key={course._id}
          course={course}
          handleAddToCart={handleAddToCart}
          handleBuyNow={handleBuyNow}
          isLoggedIn={isLoggedIn}
          user={user}
          handleCourseClick={handleCourseClick}
        />
      )) || []
    );
  };

  const renderLoader = () => {
    return (
      <>
        <SectionSkeleton title="Courses" />
        <LoadingSpinner />
      </>
    );
  };

  if (isCatalogDataLoading || isCategoriesLoading) {
    return renderLoader();
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="mx-auto w-full max-w-maxContent px-4 py-8 sm:py-20">
        <div className="flex flex-col justify-between items-center">
        <h2 className="text-7xl tracking-wide sm:text-3xl md:text-[90px] font-inter text-center mt-10 text-slate-200 pb-4">
         Explore Courses
        </h2>
        <div className="relative md:mt-8 text-center">
          <input
            type="text"
            placeholder="Search Courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 py-3 px-8 rounded-2xl border border-slate-500 bg-transparent text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div className='text-sm md:text-xl text-center text-slate-300 pt-3 pb-20'>
          <p>
          Unlock your potential with our expertly crafted courses designed to help you excel!
          </p>
        </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
          {renderCourseCards()}
        </div>
      </div>
      {confirmationModal && (
        <ConfirmationModal
          isOpen={!!confirmationModal}
          onClose={() => setConfirmationModal(null)}
          onConfirm={() => {
            confirmationModal.onConfirm();
            setConfirmationModal(null);
          }}
          title={confirmationModal.title}
          description={confirmationModal.description}
        />
      )}
      <Footer />
    </div>
  );
}

export default Catalog;
