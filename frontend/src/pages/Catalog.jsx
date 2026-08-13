import React, { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "react-query";
import Footer from "../components/common/Footer";
import ConfirmationModal from "../components/common/ConfirmationModal";
import { getCatalogPageData } from "../services/operations/pageAndComponentData";
import { useCategories } from "../hooks/useCategories";
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
        className="bg-surface border border-line w-full rounded-xl overflow-hidden hover:bg-elevated transition-colors duration-200 cursor-pointer flex flex-col"
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
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-fg p-1">
            {course.courseName}
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-muted mb-2 sm:mb-4 line-clamp-2">
            {course.courseDescription}
          </p>
          <div className="flex justify-between items-center text-xs sm:text-sm text-muted mb-2 sm:mb-4 md:mb-6">
            <div className="flex items-center">
              <p className="font-semibold bg-solid text-solid-fg px-3 py-0.5 rounded-full">
                {course.price === 0 ? "Free" : `₹${course.price}`}
              </p>
            </div>
            <div className="flex items-center">
              <FaBookOpen className="mr-1 text-fg" />
              <p className="font-medium">{course.courseDuration}</p>
            </div>
          </div>
          <div className="flex flex-col space-y-2" onClick={(e) => e.stopPropagation()}>
            {isEnrolled ? (
              <button
                onClick={() => handleCourseClick(course)}
                className="btn-primary w-full text-xs sm:text-sm"
              >
                Go to Course
              </button>
            ) : course.price === 0 ? (
              <Link
                to={`/courses/${course._id}`}
                className="btn-primary w-full text-xs sm:text-sm"
              >
                View Course
              </Link>
            ) : isLoggedIn ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(course)}
                  aria-label="Add to cart"
                  className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-muted hover:text-fg hover:bg-elevated transition-colors"
                >
                  <FaShoppingCart size={13} />
                </button>
                <button
                  onClick={() => handleBuyNow(course)}
                  className="btn-primary flex-1 text-xs sm:text-sm"
                >
                  Buy Now
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="btn-primary w-full text-xs sm:text-sm"
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
  <div className="bg-surface border border-line w-full rounded-xl overflow-hidden animate-pulse">
    <div className="h-40 bg-elevated"></div>
    <div className="p-6">
      <div className="h-4 bg-elevated rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-elevated rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-elevated rounded w-1/4 mb-4"></div>
      <div className="h-8 bg-elevated rounded mb-2"></div>
      <div className="h-8 bg-elevated rounded"></div>
    </div>
  </div>
);

const SectionSkeleton = ({ title }) => (
  <div className="mx-auto w-full max-w-maxContent px-4 py-8 sm:py-12">
    <div className="h-8 bg-elevated rounded w-1/4 mb-4"></div>
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
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();

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
        <LoadingSpinner />
      </>
    );
  };

  if (isCatalogDataLoading || isCategoriesLoading) {
    return renderLoader();
  }

  return (
    <div className="min-h-screen bg-page text-fg">
      <div className="mx-auto w-full max-w-maxContent px-4 py-8 sm:py-20">
        <div className="flex flex-col justify-between items-center">
          <h2 className="text-7xl tracking-wide sm:text-3xl md:text-[90px] font-inter text-center mt-10 text-fg pb-4">
            Explore Courses
          </h2>
          <div className="relative md:mt-8 text-center">
            <input
              type="text"
              placeholder="Search Courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 py-3 px-8 rounded-2xl border border-line bg-surface text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-muted touch-action-manipulation select-none"
            />
          </div>
          <div className="text-sm md:text-xl text-center text-subtle pt-3 pb-20">
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
